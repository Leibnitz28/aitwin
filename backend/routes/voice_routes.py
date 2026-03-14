"""
Voice Routes — POST /generate-voice
Text-to-speech generation using the twin's cloned voice.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import VoiceGenerationRequest, VoiceGenerationResponse
from services.twin_service import TwinService
from services.elevenlabs_service import ElevenLabsService
from services.gcs_service import GCSService
from utils.helpers import generate_short_id

router = APIRouter()


@router.post(
    "/generate-voice",
    response_model=VoiceGenerationResponse,
    summary="Generate voice from text using the twin's voice profile",
)
async def generate_voice(payload: VoiceGenerationRequest):
    """
    Convert text to speech using the twin's cloned voice.
    Pipeline: text → ElevenLabs TTS → GCS upload → return audio URL.
    """
    twin = TwinService.get_twin(payload.twin_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Twin not found")

    # Generate audio via ElevenLabs
    audio_bytes = await ElevenLabsService.text_to_speech(
        text=payload.text,
        voice_id=twin.voice_id,
    )

    if audio_bytes:
        # Upload to GCS
        audio_url = await GCSService.upload_tts_audio(audio_bytes, payload.twin_id)
        provider = "elevenlabs"
    else:
        # Mock URL for development
        audio_url = f"https://storage.googleapis.com/echosoul-audio/tts_{payload.twin_id}_{generate_short_id()}.mp3"
        provider = "mock"

    return VoiceGenerationResponse(
        audio_url=audio_url,
        twin_id=payload.twin_id,
        text_length=len(payload.text),
        provider=provider,
    )
