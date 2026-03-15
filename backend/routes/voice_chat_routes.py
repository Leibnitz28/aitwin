"""
Voice Chat Route
POST /voice-chat — Accept audio blob, transcribe with Gemini, run agent pipeline, return TTS audio.
This enables fully hands-free voice conversation with the AI twin.
"""

import base64
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(tags=["🎙️ Voice Chat"])

AUDIO_OUT_DIR = Path(__file__).parent.parent / "uploads" / "audio"
AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/voice-chat", summary="Send voice audio, receive AI voice reply")
async def voice_chat(
    audio: UploadFile = File(...),
    twin_id: str = Form(default="default_twin"),
    user_id: str = Form(default="default_user"),
):
    """
    1. Transcribe the uploaded audio with Gemini (preferred) or Whisper
    2. Run the 5-agent pipeline on the transcription
    3. Synthesize reply with ElevenLabs (or OpenVoice fallback)
    4. Return JSON with transcript, text reply, and audio_url
    """
    audio_bytes = await audio.read()

    # ── Step 1: Transcribe ────────────────────────────────────────────────────
    transcript = await _transcribe(audio_bytes, audio.filename or "voice.webm")
    if not transcript:
        raise HTTPException(status_code=422, detail="Could not transcribe audio — please speak clearly and try again.")

    # ── Step 2: Get twin + run agent pipeline ─────────────────────────────────
    try:
        from services.twin_service import TwinService  # type: ignore
        from services.agent_orchestrator import AgentOrchestrator  # type: ignore

        twin = TwinService.get_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=404, detail=f"Twin {twin_id} not found.")

        result = await AgentOrchestrator.process(
            message=transcript,
            personality=twin.analysis.traits,
            twin_id=twin_id,
        )
        reply_text = result["reply"]
        TwinService.increment_chat_count(twin_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent pipeline error: {e}")

    # ── Step 3: Synthesize voice reply ────────────────────────────────────────
    audio_url = None
    try:
        audio_url = await _synthesize(reply_text, twin.voice_id)
    except Exception as e:
        print(f"⚠️ Voice synthesis error: {e}")

    return {
        "transcript": transcript,
        "reply": reply_text,
        "audio_url": audio_url,
        "agents_used": [a.model_dump() for a in result.get("agents_used", [])],
    }


async def _transcribe(audio_bytes: bytes, filename: str) -> str | None:
    """Transcribe audio using Gemini (primary) or a simple fallback."""
    from config import Config  # type: ignore

    if Config.has_gemini():
        try:
            import google.generativeai as genai  # type: ignore
            genai.configure(api_key=Config.GEMINI_API_KEY)

            # Save temp file with correct extension for Gemini
            ext = Path(filename).suffix or ".webm"
            tmp_path = AUDIO_OUT_DIR / f"tmp_{uuid.uuid4().hex}{ext}"
            tmp_path.write_bytes(audio_bytes)

            model = genai.GenerativeModel("gemini-1.5-flash")
            audio_file = genai.upload_file(str(tmp_path))
            response = await model.generate_content_async([
                audio_file,
                "Transcribe this audio. Return ONLY the transcribed text, nothing else.",
            ])
            tmp_path.unlink(missing_ok=True)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ Gemini transcription error: {e}")

    if Config.has_openai():
        try:
            from openai import AsyncOpenAI  # type: ignore
            client = AsyncOpenAI(api_key=Config.OPENAI_API_KEY)
            import io
            ext = Path(filename).suffix or ".webm"
            audio_file_obj = io.BytesIO(audio_bytes)
            audio_file_obj.name = f"audio{ext}"
            result = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file_obj,
            )
            return result.text.strip()
        except Exception as e:
            print(f"⚠️ Whisper transcription error: {e}")

    return None


async def _synthesize(text: str, voice_id: str | None) -> str | None:
    """Generate TTS audio and return the public URL path."""
    from config import Config  # type: ignore

    audio_bytes = None

    # Try ElevenLabs first (best quality)
    if Config.has_elevenlabs():
        try:
            from services.elevenlabs_service import ElevenLabsService  # type: ignore
            audio_bytes = await ElevenLabsService.text_to_speech(text, voice_id)
        except Exception as e:
            print(f"⚠️ ElevenLabs TTS error: {e}")

    # Fallback: OpenVoice via HF Spaces
    if not audio_bytes and voice_id:
        try:
            from services.local_voice_service import LocalVoiceService  # type: ignore
            if LocalVoiceService.is_ready():
                audio_bytes = await LocalVoiceService.text_to_speech(text, voice_id)
        except Exception as e:
            print(f"⚠️ OpenVoice TTS error: {e}")

    if audio_bytes:
        filename = f"reply_{uuid.uuid4().hex}.mp3"
        out_path = AUDIO_OUT_DIR / filename
        out_path.write_bytes(audio_bytes)
        return f"/uploads/audio/{filename}"

    return None
