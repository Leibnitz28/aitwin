import os
import io
import asyncio
from pathlib import Path
from typing import Optional

try:
    from gradio_client import Client, file
    has_gradio = True
except ImportError:
    has_gradio = False

class LocalVoiceService:
    _client: Optional["Client"] = None
    _ready = False
    
    @classmethod
    def init(cls):
        """Initialize the Hugging Face Spaces API Client."""
        if not has_gradio:
            print("⚠️ gradio_client not installed. Local voice cloning disabled.")
            return

        if cls._client is None:
            try:
                print("Connecting to OpenVoice (myshell-ai/OpenVoiceV2) API...")
                cls._client = Client("myshell-ai/OpenVoiceV2")
                cls._ready = True
                print("OpenVoice API connected successfully.")
            except Exception as e:
                print(f"Failed to connect to OpenVoice API: {e}")
                cls._ready = False

    @classmethod
    def is_ready(cls) -> bool:
        return cls._ready

    @classmethod
    async def clone_voice(cls, audio_bytes: bytes, user_id: str) -> Optional[str]:
        """
        Save the reference audio locally to use for zero-shot cloning.
        Returns the filename (used as the 'voice_id').
        """
        try:
            # We just save the audio sample to a specific "reference_voices" directory
            ref_dir = Path(__file__).parent.parent / "uploads" / "reference_voices"
            ref_dir.mkdir(parents=True, exist_ok=True)
            
            filename = f"ref_{user_id}.wav"
            filepath = ref_dir / filename
            
            # Write bytes
            filepath.write_bytes(audio_bytes)
            
            # The 'voice_id' is just the local path to the reference audio
            return str(filepath)
        except Exception as e:
            print(f"Failed to save voice clone reference: {e}")
            return None

    @classmethod
    async def text_to_speech(cls, text: str, voice_id: str) -> Optional[bytes]:
        """
        Generate TTS using the OpenVoice API and the given reference audio (voice_id).
        """
        if not cls.is_ready() or not cls._client:
            print("OpenVoice API not ready.")
            return None

        if not voice_id or not os.path.exists(voice_id):
            print(f"Reference voice missing: {voice_id}")
            return None

        def _generate():
            try:
                # API format: text_prompt, style, reference_audio, agree
                result = cls._client.predict(
                    text,
                    "en_default",
                    file(voice_id),
                    True,
                    fn_index=1
                )
                print(f"DEBUG: predict result = {result}")
                
                # Result could be a string path or a tuple 
                result_path = None
                if isinstance(result, str):
                    result_path = result
                elif isinstance(result, tuple) and len(result) >= 2:
                    result_path = result[1]
                elif isinstance(result, list) and len(result) >= 2:
                    result_path = result[1]
                    
                print(f"DEBUG: result_path = {result_path}")
                if result_path and os.path.exists(result_path):
                    with open(result_path, "rb") as f:
                        return f.read()
                return None
            except Exception as e:
                print(f"OpenVoice generation error: {e}")
                return None

        try:
            # Run inference in a thread pool to avoid blocking the asyncio event loop
            loop = asyncio.get_running_loop()
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                audio_bytes = await loop.run_in_executor(pool, _generate)
            return audio_bytes
        except Exception as e:
            print(f"XTTS/OpenVoice generator pool error: {e}")
            return None

