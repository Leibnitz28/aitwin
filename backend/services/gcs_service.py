"""
Google Cloud Storage Service
Handles file uploads for voice audio and other assets.
Falls back to mock URLs when GCS credentials are not configured.
"""

import uuid
from typing import Any
from config import Config
from utils.helpers import generate_short_id


class GCSService:
    """Interface to Google Cloud Storage for file operations."""

    _client: Any = None
    _bucket: Any = None

    @classmethod
    def _init(cls):
        """Lazy-initialize GCS client."""
        if cls._client is not None:
            return True
        if not Config.has_gcs():
            return False

        try:
            from google.cloud import storage

            if Config.GCS_CREDENTIALS_PATH:
                cls._client = storage.Client.from_service_account_json(
                    Config.GCS_CREDENTIALS_PATH
                )
            else:
                cls._client = storage.Client()

            cls._bucket = cls._client.bucket(Config.GCS_BUCKET_NAME)
            print(f"✅ Connected to GCS bucket: {Config.GCS_BUCKET_NAME}")
            return True
        except Exception as e:
            print(f"⚠️ GCS init error: {e}")
            cls._client = None
            return False

    @classmethod
    async def upload_file(
        cls, file_bytes: bytes, filename: str, content_type: str = "audio/mpeg"
    ) -> str:
        """
        Upload a file to GCS.
        Returns the public URL or a mock URL if GCS is unavailable.
        """
        if cls._init() and cls._bucket:
            try:
                blob = cls._bucket.blob(f"audio/{filename}")
                blob.upload_from_string(file_bytes, content_type=content_type)
                blob.make_public()
                return blob.public_url
            except Exception as e:
                print(f"⚠️ GCS upload error: {e}")

        # Mock URL for development
        return f"https://storage.googleapis.com/echosoul-audio/audio/{filename}"

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
    async def get_signed_url(cls, blob_name: str, expiration_minutes: int = 60) -> str:
        """Generate a time-limited signed URL for a file."""
        if cls._init() and cls._bucket:
            try:
                from datetime import timedelta
                blob = cls._bucket.blob(blob_name)
                url = blob.generate_signed_url(
                    expiration=timedelta(minutes=expiration_minutes),
                    method="GET",
                )
                return url
            except Exception as e:
                print(f"⚠️ GCS signed URL error: {e}")

        return f"https://storage.googleapis.com/echosoul-audio/{blob_name}"
