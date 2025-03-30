import requests
import time
import json

# Paths to test files
audio_path = "test_audio.mp3"
image_path = "test_image.jpeg"

# Test endpoint
send_url = "http://127.0.0.1:5000/sendMessage"
userid="userid"  # Assuming you want to send a user ID
# Initial payload
data = {
    "audio_path": audio_path,
    "image_path": image_path,
    "text": "What outfit matches this image and current weather?",
    "userid": userid,  # Assuming you want to send a user ID
    # also send the userid here
}

# Send the request to start the task
response = requests.post(send_url, json=data) 
if response.status_code == 200:
    print("Task started successfully.")
else:
    print("Failed to start task:", response.json())
    exit()

while True:
    try:
        with open(f"users/{userid}/chat_history.json", "r") as f:
            chat_history = json.load(f)
            for chat in chat_history:
                print(f"User: {chat['user']}")
                print(f"Model: {chat['model']}")

            
            new_text = input("Enter a new message for Gemini (or type 'exit' to quit): ")
                  
            if new_text.lower() == "exit":
                print("Exiting...")
                exit()

            if new_text:        
                new_data = {
                    "audio_path": audio_path,
                    "image_path": image_path,
                    "text": new_text
                }
                response = requests.post(send_url, json=new_data)

            

    except FileNotFoundError:
        print("chat_history.json not found. Waiting...")
    except json.JSONDecodeError:
        print("chat_history.json is not a valid JSON file. Waiting...")

    time.sleep(3)  # Wait for 3 seconds before checking again
