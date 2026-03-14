"""
ElevenLabs Text-to-Speech Service
Handles voice cloning and text-to-speech conversion via the ElevenLabs API.
Falls back to mock data when API key is not configured.
"""

from typing import Optional
import httpx
from config import Config


class ElevenLabsService:
    """Interface to ElevenLabs API for voice cloning and TTS."""

    @staticmethod
    async def text_to_speech(text: str, voice_id: Optional[str] = None) -> bytes | None:
        """
        Convert text to speech using ElevenLabs API.
        Returns audio bytes (mp3) or None if the service is unavailable.
        """
        if not Config.has_elevenlabs():
            return None

        vid = voice_id or Config.ELEVENLABS_VOICE_ID
        if not vid:
            return None

        url = f"{Config.ELEVENLABS_BASE_URL}/text-to-speech/{vid}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": Config.ELEVENLABS_API_KEY,
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"⚠️ ElevenLabs error {response.status_code}: {response.text[:200]}")
                    return None
        except Exception as e:
            print(f"⚠️ ElevenLabs connection error: {e}")
            return None

    @staticmethod
    async def clone_voice(audio_bytes: bytes, name: str) -> str | None:
        """
        Clone a voice from audio samples via ElevenLabs API.
        Returns the new voice_id or None.
        """
        if not Config.has_elevenlabs():
            return None

        url = f"{Config.ELEVENLABS_BASE_URL}/voices/add"
        headers = {
            "xi-api-key": Config.ELEVENLABS_API_KEY,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                files = {"files": (f"{name}.mp3", audio_bytes, "audio/mpeg")}
                data = {"name": name, "description": f"Cloned voice for twin {name}"}
                response = await client.post(url, headers=headers, files=files, data=data)

                if response.status_code == 200:
                    result = response.json()
                    return result.get("voice_id")
                else:
                    print(f"⚠️ ElevenLabs clone error {response.status_code}: {response.text[:200]}")
                    return None
        except Exception as e:
            print(f"⚠️ ElevenLabs clone connection error: {e}")
            return None
