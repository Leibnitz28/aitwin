import sys
from gradio_client import Client, file

def test_xtts(ref_audio_path: str, text: str):
    print(f"Testing XTTS API with text: '{text}' and ref_audio: {ref_audio_path}")
    try:
        client = Client("coqui/xtts")
        # Find endpoint for TTS
        result = client.predict(
            prompt=text,
            language="en",
            audio_file_pth=file(ref_audio_path),
            mic_file_pth=None,
            use_mic=False,
            voice_cleanup=False,
            no_lang_auto_detect=False,
            agree=True,
            api_name="/predict"
        )
        print("Success! Result saved to:", result)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_xtts_api.py <path_to_ref_wav>")
        sys.exit(1)
    test_xtts(sys.argv[1], "Hello there! This is a test of voice cloning.")
