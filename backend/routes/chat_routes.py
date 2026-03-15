"""
Chat Routes — POST /chat
Full orchestrated pipeline: message → agents → TTS → GCS → Snowflake → response.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from models.schemas import ChatMessage, ChatResponse
from services.twin_service import TwinService
from services.agent_orchestrator import AgentOrchestrator
from services.local_voice_service import LocalVoiceService
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
    4. Convert response to voice via Local XTTS-v2
    5. Upload audio to Google Cloud Storage (or local fallback)
    6. Log conversation to Snowflake
    7. Return text reply + audio URL + agent details
    """
    import traceback
    try:
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

        # 5. Text-to-speech — ElevenLabs first, OpenVoice fallback
        if result.get("needs_voice"):
            audio_bytes = None

            # Try ElevenLabs (primary — best voice quality)
            try:
                from services.elevenlabs_service import ElevenLabsService  # type: ignore
                from config import Config  # type: ignore
                if Config.has_elevenlabs():
                    audio_bytes = await ElevenLabsService.text_to_speech(
                        text=reply, voice_id=twin.voice_id
                    )
            except Exception as e:
                print(f"⚠️ ElevenLabs TTS error: {e}")

            # Fallback: OpenVoice API
            if not audio_bytes:
                try:
                    audio_bytes = await LocalVoiceService.text_to_speech(
                        text=reply, voice_id=twin.voice_id
                    )
                except Exception as e:
                    print(f"⚠️ OpenVoice TTS error: {e}")

            if audio_bytes:
                # Save locally to /uploads/audio/
                import uuid
                from pathlib import Path
                audio_dir = Path(__file__).parent.parent / "uploads" / "audio"
                audio_dir.mkdir(parents=True, exist_ok=True)
                filename = f"reply_{uuid.uuid4().hex}.mp3"
                (audio_dir / filename).write_bytes(audio_bytes)
                audio_url = f"/uploads/audio/{filename}"
            else:
                audio_url = None

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
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
