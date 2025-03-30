import base64
import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
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
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
CORS(app)
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
def modify_image_with_replacement(image_path):
    """
    Analyze an image using the Gemini API, detect objects, and update the image with bounding boxes and labels.
    This function replaces the original image with the modified one.
    
    Args:
        image_path (str): Path to the image file to analyze
    
    Returns:
        str: Path to the modified image with bounding boxes (same as input path)
    """
    try:
        # Load the image
        with Image.open(image_path) as img:
            # Make a copy of the original image
            original_img = img.copy()
            # Resize image if needed for better processing
            img.thumbnail([1024, 1024], Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS)
            
            # Prepare prompt for object detection
            prompt = "Detect the 2D bounding boxes of all visible objects in this image with descriptive labels."
            
            # System instructions for bounding box format
            bounding_box_instructions = """
            Return bounding boxes as a JSON array with labels. Never return masks or code fencing. 
            Limit to 25 objects. If an object is present multiple times, name them according to 
            their unique characteristic (colors, size, position, unique characteristics, etc.).
            """
            
            # Upload image to Gemini API
            uploaded_file = client.files.upload(file=image_path)
            
            # Generate content with the model
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[prompt, uploaded_file],
                config=types.GenerateContentConfig(
                    system_instruction=bounding_box_instructions,
                    temperature=0.5,
                )
            )
            
            # Parse the JSON response
            bounding_boxes = parse_json_response(response.text)
            
            # Draw bounding boxes on the image
            draw = ImageDraw.Draw(original_img)
            
            # Define colors for different objects
            colors = ['red', 'green', 'blue', 'yellow', 'orange', 'pink', 'purple', 'brown', 
                        'gray', 'cyan', 'magenta', 'lime', 'navy', 'teal', 'olive']
            
            width, height = original_img.size
            
            # Try to get a font that works across systems
            try:
                font = ImageFont.truetype("Arial.ttf", 14)
            except IOError:
                # Fallback to default font
                font = ImageFont.load_default()
            
            # Draw each bounding box
            boxes_data = json.loads(bounding_boxes)
            for i, box in enumerate(boxes_data):
                color = colors[i % len(colors)]
                
                # Extract coordinates (normalized to 0-1000 range)
                y1 = int(box["box_2d"][0] / 1000 * height)
                x1 = int(box["box_2d"][1] / 1000 * width)
                y2 = int(box["box_2d"][2] / 1000 * height)
                x2 = int(box["box_2d"][3] / 1000 * width)
                
                # Ensure coordinates are in correct order
                if x1 > x2:
                    x1, x2 = x2, x1
                if y1 > y2:
                    y1, y2 = y2, y1
                
                # Draw rectangle
                draw.rectangle([(x1, y1), (x2, y2)], outline=color, width=3)
                
                # Add label
                if "label" in box:
                    draw.text((x1 + 5, y1 + 5), box["label"], fill=color, font=font)
            
            # Save back to the original path, replacing the original image
            original_img.save(image_path)
            
            return image_path
            
    except Exception as e:
        print(f"Error in modify_image_with_replacement: {str(e)}")
        return None

def parse_json_response(json_output):
    """
    Parse JSON output from Gemini API, handling potential markdown fencing
    
    Args:
        json_output (str): JSON response from Gemini API
        
    Returns:
        str: Cleaned JSON string
    """
    # Remove markdown fencing if present
    lines = json_output.splitlines()
    for i, line in enumerate(lines):
        if line.strip() == "```json" or line.strip() == "```":
            json_output = "\n".join(lines[i+1:])  # Remove everything before "```json"
            json_output = json_output.split("```")[0]  # Remove everything after the closing "```"
            break
    
    return json_output

# Load chat history from file
def load_chat_history(file_path):
    try:
        with open(file_path, 'r') as f:
            chat_history = json.load(f)
    except FileNotFoundError:
        chat_history = []
    return chat_history

# Save chat history to file
def save_chat_history(chat_history ,file_path):
    try:
        with open(file_path, 'w') as f:
            json.dump(chat_history, f, indent=4)
# Append data to JSON file
    except Exception as e:
        print(f"Error saving chat history: {e}")


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

async def create_superior_agent(query, image_path, audio_path,user_id):
    global files, responses, task_running, task_error, client,grounding_sources, chat_history, conversation_complete
    model = "gemini-2.0-flash"
    chat_history = load_chat_history(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/chat_history.json")

    # /home/ash/DevHacks-2025/frontend/public/users/user_2v1sELLPUpnBpR8pviRBtRvMFqE/chat_history.json
    user_info = load_user_info(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/preferences.json")
    

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
        system_instruction="""Act as
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
            append_to_json(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/responses.json", f"Going over pinterest for inspiration 💫")

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

            append_to_json(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/responses.json", f"Matching to your taste! 💢")
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

            append_to_json(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/responses.json", f"Finalizing inspirations ☺️")
            # Close the driver
            driver.quit()
            

            return [screenshot1_path, screenshot2_path, screenshot3_path]

        except Exception as e:
            return f"Error during Pinterest search: {str(e)}"

    async def access_closet_analysis_agent(instruction_to_agent: str):
        try:
            append_to_json(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/responses.json", f"Analyzing your closet 🧐")

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
        append_to_json(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/responses.json", f"Calculating your fit check 💅")
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
    print("hello")
    # Include chat history in the content
    contents=[]
    try:
        for turn in chat_history:
            if "user" in turn:
                contents.append(types.Content(role="user", parts=[types.Part.from_text(text=turn["user"])]))
            if "model" in turn:
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

        # if generation_result.candidates[-1].content.parts[-1].text:
        #     # Save the conversation turn to chat history
        #     chat_history.append({"user": query}, {"model": generation_result.candidates[-1].content.parts[-1].text})
        #     save_chat_history(chat_history, f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/chat_history.json") 
            
    if generation_result.candidates[-1].content.parts[-1].text:
        # Save the conversation turn to chat history
        chat_history.append({"user": query})
        chat_history.append( {"model": generation_result.candidates[-1].content.parts[-1].text})
        save_chat_history(chat_history, f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/chat_history.json") 
    
    global grounding_sources
    append_to_json(f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/responses.json", grounding_sources)
    task_running = False    
    return responses
             
def run_agent_in_background(query, image_path, audio_path,user_id):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(create_superior_agent(query, image_path, audio_path,user_id))
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
    
    query = request.json['text']
    
    global user_id
    user_id = request.json['userid']
    image_path = f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/temp_image.jpeg"
    audio_path = f"/home/ash/DevHacks-2025/frontend/public/users/{user_id}/temp_audio.mp3"
    responses = []  # Clear previous responses
    task_running = True
    task_error = None
    conversation_complete = False
    
    modify_image_with_replacement(image_path)
    
    threading.Thread(target=run_agent_in_background, args=(query, image_path, audio_path,user_id)).start()
    return jsonify({'message': 'Task started in the background. Check /getstatus for updates.'}), 200

if __name__ == "__main__":
    try:
        CORS(app)  # Enable CORS for all routes
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Failed to start server: {str(e)}")
