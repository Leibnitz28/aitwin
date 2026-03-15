import asyncio
from services.local_voice_service import LocalVoiceService

async def test_service():
    print("Testing LocalVoiceService init...")
    LocalVoiceService.init()
    if not LocalVoiceService.is_ready():
        print("Failed to initialize service")
        return
        
    print("Testing TTS generation...")
    # use an existing reference voice
    ref_audio = "uploads/voice_sample_Piyush_9d9aa4ca.mp3"
    result = await LocalVoiceService.text_to_speech("Wow, this is amazing! OpenVoice is working inside TwinAI.", ref_audio)
    
    if result and len(result) > 0:
        print(f"Success! Generated {len(result)} bytes of audio.")
        with open("test_output.wav", "wb") as f:
            f.write(result)
        print("Saved to test_output.wav")
    else:
        print("Failed! Generation returned None or 0 bytes.")

if __name__ == "__main__":
    asyncio.run(test_service())
