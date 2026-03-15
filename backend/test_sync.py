from gradio_client import Client, file
import os

print("Connecting to OpenVoice (myshell-ai/OpenVoiceV2) API...")
client = Client("myshell-ai/OpenVoiceV2")

text = "Wow, this is amazing! OpenVoice is working inside TwinAI."
voice_id = "uploads/voice_sample_Piyush_9d9aa4ca.mp3"

print("Generating...")
try:
    result = client.predict(
        text,
        "en_default",
        file(voice_id),
        True,
        fn_index=1
    )
    print(f"DEBUG: predict result = {result}")
    
    result_path = None
    if isinstance(result, str):
        result_path = result
    elif isinstance(result, tuple) and len(result) >= 2:
        result_path = result[1]
    elif isinstance(result, list) and len(result) >= 2:
        result_path = result[1]
        
    print(f"DEBUG: result_path = {result_path}")
    if result_path and os.path.exists(result_path):
        print("Success! File exists.")
    else:
        print("Failure.")
except Exception as e:
    import traceback
    with open("err.txt", "w", encoding="utf-8") as f:
        traceback.print_exc(file=f)
    print("Error saved to err.txt")
