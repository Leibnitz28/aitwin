"""
Chat Routes — POST /chat
Full orchestrated pipeline: message → agents → TTS → GCS → Snowflake → response.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from models.schemas import ChatMessage, ChatResponse
from services.twin_service import TwinService
from services.agent_orchestrator import AgentOrchestrator
from services.elevenlabs_service import ElevenLabsService
from services.gcs_service import GCSService
from services.snowflake_service import SnowflakeService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, summary="Chat with your AI twin")
async def chat_with_twin(payload: ChatMessage):
    """
    Full chat pipeline:
    1. Load twin personality profile
    2. Run message through 5-agent orchestrator
    3. Generate AI text response
    4. Convert response to voice via ElevenLabs
    5. Upload audio to Google Cloud Storage
    6. Log conversation to Snowflake
    7. Return text reply + audio URL + agent details
    """
    # 1. Load twin
    twin = TwinService.get_twin(payload.twin_id)
    if not twin:
        raise HTTPException(
            status_code=404,
            detail=f"Twin '{payload.twin_id}' not found. Create a twin first.",
        )

    # 2–4. Run agent orchestrator
    result = await AgentOrchestrator.process(
        message=payload.message,
        personality=twin.analysis.traits,
        twin_id=payload.twin_id,
    )

    reply = result["reply"]
    agents_used = result["agents_used"]
    audio_url = None

    # 5. Text-to-speech via ElevenLabs
    if result.get("needs_voice"):
        audio_bytes = await ElevenLabsService.text_to_speech(
            text=reply, voice_id=twin.voice_id
        )
        if audio_bytes:
            # 6. Upload to GCS
            audio_url = await GCSService.upload_tts_audio(audio_bytes, payload.twin_id)
        else:
            # Mock audio URL for development
            audio_url = f"https://storage.googleapis.com/echosoul-audio/tts_{payload.twin_id}_mock.mp3"

    # 7. Log to Snowflake
    await SnowflakeService.log_conversation(
        twin_id=payload.twin_id,
        user_message=payload.message,
        ai_reply=reply,
        audio_url=audio_url,
    )

    # 8. Update conversation count
    TwinService.increment_chat_count(payload.twin_id)

    return ChatResponse(
        reply=reply,
        audio_url=audio_url,
        twin_id=payload.twin_id,
        agents_used=agents_used,
        timestamp=datetime.utcnow(),
    )
