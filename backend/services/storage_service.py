"""
Local Storage Service
Handles file uploads by saving them to the local filesystem.
Alternative to Google Cloud Storage.
"""

import os
import uuid
from pathlib import Path
from config import Config
from utils.helpers import generate_short_id

class StorageService:
    """Interface for local file operations."""
    
    # Base directory for uploads
    UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
    
    @classmethod
    def _ensure_dir(cls):
        """Ensure the upload directory exists."""
        if not os.path.exists(cls.UPLOAD_DIR):
            os.makedirs(cls.UPLOAD_DIR, exist_ok=True)

    @classmethod
    async def upload_file(
        cls, file_bytes: bytes, filename: str, content_type: str = "audio/mpeg"
    ) -> str:
        """
        Save a file to the local 'uploads' directory.
        Returns the local URL.
        """
        cls._ensure_dir()
        
        # Save file
        file_path = cls.UPLOAD_DIR / filename
        with open(file_path, "wb") as f:
            f.write(file_bytes)
            
        # Return URL (assuming backend runs on localhost:PORT)
        # Note: In production, you'd use a real domain or CDN
        return f"http://localhost:{Config.PORT}/uploads/{filename}"

    @classmethod
    async def upload_voice_sample(cls, file_bytes: bytes, user_id: str) -> str:
        """Upload a voice sample file and return the URL."""
        filename = f"voice_sample_{user_id}_{generate_short_id()}.mp3"
        return await cls.upload_file(file_bytes, filename, "audio/mpeg")

    @classmethod
    async def upload_tts_audio(cls, audio_bytes: bytes, twin_id: str) -> str:
        """Upload generated TTS audio and return the URL."""
        filename = f"tts_{twin_id}_{generate_short_id()}.mp3"
        return await cls.upload_file(audio_bytes, filename, "audio/mpeg")

    @classmethod
    async def get_signed_url(cls, filename: str, expiration_minutes: int = 60) -> str:
        """
        For local storage, we just return the direct URL.
        """
        return f"http://localhost:{Config.PORT}/uploads/{filename}"
