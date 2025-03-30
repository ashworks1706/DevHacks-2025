import base64
import os
import traceback
from flask import Flask, request, jsonify
from google import genai
from google.genai import types
import asyncio
import threading
import requests
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import json

app = Flask(__name__)
global files, responses, task_running, task_error, client, grounding_sources, chat_history, conversation_complete, user_id
grounding_sources=[]
responses = []
user_id=None
task_running = False
task_error = None
files=None
conversation_complete = False
client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY","AIzaSyCnbeks5tL1s_PwBKyYRqT83Wlh0tTTITI"),
)
def load_user_info(file_path):
    with open(file_path, 'r') as f:
        user_info = json.load(f)
    return user_info


# Load chat history from file
def load_chat_history(file_path=f"users/{user_id}/chat_history.json"):
    try:
        with open(file_path, 'r') as f:
            chat_history = json.load(f)
    except FileNotFoundError:
        chat_history = []
    return chat_history

# Save chat history to file
def save_chat_history(chat_history, file_path=f"users/{user_id}/chat_history.json"):
    with open(file_path, 'w') as f:
        json.dump(chat_history, f)



def append_to_json(file_path, data):
    try:
        with open(file_path, 'r+') as f:
            try:
                file_data = json.load(f)
            except json.JSONDecodeError:
                file_data = []
            file_data.append(data)
            f.seek(0)
            json.dump(file_data, f, indent=4)
    except FileNotFoundError:
        with open(file_path, 'w') as f:
            json.dump([data], f, indent=4)

async def create_superior_agent(query, image_path, audio_path):
    global files, responses, task_running, task_error, client,grounding_sources, chat_history, conversation_complete
    model = "gemini-2.0-flash"
    chat_history = load_chat_history()
    
    user_info = load_user_info(f"/home/ash/backend/users/{user_id}/preferences.json")
    user_info_string = f"""User Profile:
        User ID: {user_info['user_id']}
        Name: {user_info['name']}, Age: {user_info['age']}, Gender: {user_info['gender']}
        Location: {user_info['location']}

        Onboarding Responses:
            Favorite Colors: {', '.join(user_info['onboarding_responses']['favorite_colors'])}
            Dominant Colors: {', '.join(user_info['onboarding_responses']['dominant_colors'])}
            Preferred Materials: {', '.join(user_info['onboarding_responses']['preferred_materials'])}
            Preferred Patterns: {', '.join(user_info['onboarding_responses']['preferred_patterns'])}
            Style Preferences: {', '.join(user_info['onboarding_responses']['style_preferences'])}
            Fashion Influences: {user_info['onboarding_responses']['fashion_influences']}
            Wardrobe Challenges: {user_info['onboarding_responses']['wardrobe_challenges']}
            Budget: {user_info['onboarding_responses']['budget']}
            Lifestyle:
                Work: {user_info['onboarding_responses']['lifestyle']['work']}
                Social: {user_info['onboarding_responses']['lifestyle']['social']}
                Climate: {user_info['onboarding_responses']['lifestyle']['climate']}

        Style Profile:
            Casual: {user_info['style_profile']['casual']}%
            Formal: {user_info['style_profile']['formal']}%
            Active: {user_info['style_profile']['active']}%
            Pattern Variability: {user_info['style_profile']['pattern_variability']}
            Material Variety: {user_info['style_profile']['material_variety']}
        """
    
    tools = [
            types.Tool(
                function_declarations=[
                    types.FunctionDeclaration(
                        name="access_environment_agent",
                        description="Fetch context about weather, location, and venue vibes to inform the final fashion recommendations.",
                        parameters={
                            "type": "object",
                            "properties": {
                                "instruction_to_agent": {
                                    "type": "string",
                                    "description": "Specific instructions or queries related to location, weather, or event details for retrieving relevant context."
                                }
                            },
                            "required": ["instruction_to_agent"]
                        }
                    ),
                    types.FunctionDeclaration(
                        name="access_closet_analysis_agent",
                        description="Analyze the user's closet from images to detect clothing types, color profiles, and style patterns.",
                        parameters={
                            "type": "object",
                            "properties": {
                                "instruction_to_agent": {
                                    "type": "string",
                                    "description": "Instruction plus any reference to the closet images or user’s existing wardrobe data for classification."
                                }
                            },
                            "required": ["instruction_to_agent"]
                        }
                    ),
                    types.FunctionDeclaration(
                        name="access_style_match_agent",
                        description="Interprets the user’s desired aesthetic or vibe, compares it to online inspiration, and aligns it with the user's closet.",
                        parameters={
                            "type": "object",
                            "properties": {
                                "instruction_to_agent": {
                                    "type": "string",
                                    "description": "User’s style request or references (e.g., 'casual boho vibe'), which the agent converts into structured style data."
                                }
                            },
                            "required": ["instruction_to_agent"]
                        }
                    ),
                ]
            )
        ]
        
    generate_content_config = types.GenerateContentConfig(
        tools=tools,
        system_instruction="""Act as a fashion assistant known as Lux. You will be provided with an image of the user and their closet, along with audio input. Your task is to analyze the images and audio to provide personalized fashion recommendations detailed towards user taste. 
        
        \n1) `access_environment_agent` : can get the weather of the given location \n
        2) `access_closet_analysis_agent` : can get detailed description about the image\n
        3) `access_style_match_agent` : can get inspiration from web detailed to prebuilt knowledge of user's preferred taste. 
        
        Use these agents to gather additional information about the user's environment, analyze their closet in detail, and match their style preferences. Please use your functions to answer the user's query. Call one function at a time. Always provide detailed answers. After providing a final recommendation, do not call any more functions and end the conversation.""",
        temperature=0.5,
        response_mime_type="text/plain",
    )
    
    task_running = True
    
    async def access_environment_agent(instruction_to_agent : str):
        try:
            model_id = "gemini-2.0-flash-exp"                
            prompt = types.Content(
                role="user",
                parts=[types.Part.from_text(text=instruction_to_agent)]
            )
            
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=GenerateContentConfig(
                tools=[Tool(google_search=GoogleSearch())],
                response_modalities=["TEXT"],
                system_instruction="You are a helpful assistant that uses Google Search to provide information about weather, location, and venue vibes.",
                max_output_tokens=600
                )
            )
            try:
                global grounding_sources
                # Extract the grounding sources from the response
                grounding_sources = [get_final_url(chunk.web.uri) for candidate in response.candidates if candidate.grounding_metadata and candidate.grounding_metadata.grounding_chunks for chunk in candidate.grounding_metadata.grounding_chunks if chunk.web]
            except Exception as e:
                print(f"Error extracting grounding sources: {e}")
            
            print("\nEnvironment Agent @ ", response)
            return f"{response.text}"
        except Exception as e:
            return f"Error in Google Search Agent: {str(e)}"
    
    def get_final_url( url):
        response = requests.get(url, allow_redirects=True)
        return response.url
    
    
    async def pinterest_search(query: str):
        try:
            append_to_json("responses.json", f"Going over pinterest for inspiration 💫")

            # Configure Chrome options for headless browsing
            chrome_options = Options()
            # chrome_options.add_argument("--headless")
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--ignore-certificate-errors')
            chrome_options.add_argument('--disable-extensions')
            chrome_options.add_argument('--no-first-run')
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")  # Prevent detection as a bot

            # Initialize the Chrome driver
            driver = webdriver.Chrome(options=chrome_options)

            # Construct the Pinterest search URL
            search_url = f"http://in.pinterest.com/search/pins/?q={query}"

            # Open the URL
            driver.get(search_url)
            time.sleep(5)  # Give the page time to load
            
            # Zoom out to 75%
            driver.execute_script("document.body.style.zoom='75%'")
            time.sleep(2)

            # Take the first screenshot
            screenshot1_path = "screenshot1.png"
            driver.save_screenshot(screenshot1_path)
            files.append(client.files.upload(file=screenshot1_path))

            # Scroll down
            driver.execute_script("window.scrollBy(0, 700);")  # Scroll down by 700 pixels
            time.sleep(2)  # Give the page time to adjust

            append_to_json("responses.json", f"Matching to your taste! 💢")
            # Take the second screenshot
            screenshot2_path = "screenshot2.png"
            driver.save_screenshot(screenshot2_path)
            files.append(client.files.upload(file=screenshot2_path))

            # Scroll down again
            driver.execute_script("window.scrollBy(0, 700);")  # Scroll down by 700 pixels
            time.sleep(2)  # Give the page time to adjust

            # Take the third screenshot
            screenshot3_path = "screenshot3.png"
            driver.save_screenshot(screenshot3_path)
            files.append(client.files.upload(file=screenshot3_path))

            append_to_json("responses.json", f"Finalizing inspirations ☺️")
            # Close the driver
            driver.quit()
            

            return [screenshot1_path, screenshot2_path, screenshot3_path]

        except Exception as e:
            return f"Error during Pinterest search: {str(e)}"

    async def access_closet_analysis_agent(instruction_to_agent: str):
        try:
            append_to_json("responses.json", f"Analyzing your closet 🧐")

            model_id = "gemini-2.0-flash-exp"                
            prompt = types.Content(
                role="user",
                parts=[ types.Part.from_uri(
                    file_uri=files[0].uri,
                    mime_type=files[0].mime_type,
                ),types.Part.from_text(text=instruction_to_agent)]
            )
            
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=GenerateContentConfig(
                tools=[],
                response_modalities=["TEXT"],
                system_instruction="You are a closet analysis agent. Analyze the user's closet images to detect clothing types, color profiles, and style patterns.",
                max_output_tokens=600
                )
            )
            print("\nCloset Agent @ ",response)
            return f"{response.text}"
        except Exception as e:
            return f"Error in Closet analysis agent: {str(e)}"
        
    async def access_style_match_agent(instruction_to_agent):
        append_to_json("responses.json", f"Calculating your fit check 💅")
        tools = [
        types.Tool(
            function_declarations=[
            types.FunctionDeclaration(
                name="pinterest_search",
                description="Search Pinterest for inspiration images based on a query.",
                parameters={
                "type": "object",
                "properties": {
                    "query": {
                    "type": "string",
                    "description": "The search query for Pinterest."
                    }
                },
                "required": ["query"]
                }
            )
            ]
        )
        ]
        
        generate_content_config = types.GenerateContentConfig(
        tools=tools,
        system_instruction="You are a Style Match agent. You have to use Pinterest to search for inspiration images. Analyze the user's closet and the Pinterest images to provide fashion recommendations. Please consider the user's interests, fashion style preferences, and the context of the event.",
        temperature=0.8,
        response_mime_type="text/plain",
        )
        
        model = "gemini-2.0-flash"
        
        generation_result = client.models.generate_content(
        model=model,
        contents=[types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_info_string)]
        ),
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=instruction_to_agent)]
        )
        ],
        config=generate_content_config,
        )
        print("\nStyle Agent @ ",generation_result)
        
        while generation_result.candidates[-1].content.parts[-1].function_call:
            function_call = generation_result.candidates[-1].content.parts[-1].function_call
            if function_call.name == "pinterest_search":
                query = function_call.args["query"]
                pinterest_images = await pinterest_search(query)
                
                # Prepare the content with the Pinterest images
                content_parts = [types.Part.from_text(text=f"Pinterest search returned these images: {pinterest_images}. Analyze these images for inspiration and provide fashion recommendations based on the user's closet and the Pinterest results."), types.Part.from_uri(
                        file_uri=files[2].uri,
                        mime_type=files[2].mime_type,
                    ),types.Part.from_uri(
                        file_uri=files[3].uri,
                        mime_type=files[3].mime_type,
                    ),types.Part.from_uri(
                        file_uri=files[4].uri,
                        mime_type=files[4].mime_type,
                    ),]
                    
                
                # Generate content again with the Pinterest images
                generation_result = client.models.generate_content(
                model=model,
                contents=[types.Content(role="user", parts=content_parts)],
                config=generate_content_config,
                )
                print("\nStyle Agent nested @ ",generation_result)
                
        return generation_result.candidates[-1].content.parts[-1].text
        
    async def handle_function_call(function_call):
            function_name = function_call.name
            function_args = function_call.args
            if function_name == "access_environment_agent":
                result = await access_environment_agent(function_args["instruction_to_agent"])
                print("\nEnvironment Agent Called")
                return result
            elif function_name == "access_closet_analysis_agent":
                result =  await access_closet_analysis_agent(function_args["instruction_to_agent"])
                print ("\nCloset Agent Called")
                return result
            elif function_name == "access_style_match_agent":
                result = await access_style_match_agent(function_args["instruction_to_agent"])
                print ("\nStyle Agent Called")
                return result
            else:
                return f"Unknown function: {function_name}"
    
    try:
        files = [
            client.files.upload(file=image_path),
            client.files.upload(file=audio_path),
        ]
    except Exception as file_error:
        raise Exception(f"Failed to upload files: {str(file_error)}")

    # Include chat history in the content
    contents=[]
    try:
        for turn in chat_history:
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=turn["user"])]))
            contents.append(types.Content(role="model", parts=[types.Part.from_text(text=turn["model"])]))
            
        contents.append(
            types.Content(
                role="user",
                parts=[
                    types.Part.from_uri(
                        file_uri=files[0].uri,
                        mime_type=files[0].mime_type,
                    ),
                    types.Part.from_uri(
                        file_uri=files[1].uri,
                        mime_type=files[1].mime_type,
                    ),
                    types.Part.from_text(text=query),
                ],
            ),
        )
    except Exception as e:  
        raise Exception(f"Failed to prepare contents: {str(e)}")

    
    generation_result = client.models.generate_content(
    model=model,
    contents=contents,
    config=generate_content_config,
    )
    print("\nSuperior Agent @ ",generation_result)
    
    while generation_result.candidates[-1].content.parts[-1].function_call:
        function_call = generation_result.candidates[-1].content.parts[-1].function_call
        function_response = await handle_function_call(function_call)
        # Send the function response back to the model
        generation_result = client.models.generate_content(
            model=model,
            contents=[
                *contents,
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=f"(System Generated, User cannot see this)\n{function_call} : Response :\n{function_response}.\n"),
                    ]
                )
            ],
            config=generate_content_config,
        )
        print("\nSuperior Agent nested @ ",generation_result, f"\n for {contents}")

        if generation_result.candidates[-1].content.parts[-1].text:
            # Save the conversation turn to chat history
            chat_history.append({"user": query, "model": generation_result.candidates[-1].content.parts[-1].text})
            save_chat_history(chat_history)
            
    if generation_result.candidates[-1].content.parts[-1].text:
        # Save the conversation turn to chat history
        chat_history.append({"user": query, "model": generation_result.candidates[-1].content.parts[-1].text})
        save_chat_history(chat_history)
    
    global grounding_sources
    append_to_json("responses.json", grounding_sources)
    task_running = False    
    return responses
        
        
        
def run_agent_in_background(query, image_path, audio_path):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(create_superior_agent(query, image_path, audio_path))
    except Exception as e:
        global task_error
        task_error = str(e)
    finally:
        loop.close()

@app.route('/sendMessage', methods=['POST'])
def start_message():
    global responses, task_running, task_error, conversation_complete
    if not request.json:
        return jsonify({'error': 'No JSON data provided'}), 400
    if 'text' not in request.json:
        return jsonify({'error': 'Text query is required'}), 400
    if 'image_path' not in request.json:
        return jsonify({'error': 'Image path is required'}), 400
    if 'audio_path' not in request.json:
        return jsonify({'error': 'Audio path is required'}), 400
    
    query = request.json['text']
    image_path = request.json['image_path']
    audio_path = request.json['audio_path']
    global user_id
    user_id = request.json['userid']
    
    if not os.path.exists(image_path):
        return jsonify({'error': f"Image file not found: {image_path}"}), 400
    if not os.path.exists(audio_path):
        return jsonify({'error': f"Audio file not found: {audio_path}"}), 400
    
    responses = []  # Clear previous responses
    task_running = True
    task_error = None
    conversation_complete = False
    
    threading.Thread(target=run_agent_in_background, args=(query, image_path, audio_path,)).start()
    return jsonify({'message': 'Task started in the background. Check /getstatus for updates.'}), 200



if __name__ == "__main__":
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Failed to start server: {str(e)}")
