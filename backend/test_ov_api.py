import sys
from gradio_client import Client, file

def test_openvoice(ref_audio_path: str, text: str):
    print(f"Testing OpenVoice API with text: '{text}' and ref_audio: {ref_audio_path}")
    try:
        client = Client("myshell-ai/OpenVoiceV2")
        result = client.predict(
                text_input=text,
                style="default",
                reference_audio=file(ref_audio_path),
                api_name="/predict"
        )
        print("Success! Result saved to:", result)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ov_api.py <path_to_ref_wav>")
        sys.exit(1)
    test_openvoice(sys.argv[1], "Hello there! This is a test of OpenVoice cloning.")
