"""
Twin Routes — /create-twin, /upload-voice, /upload-writing, /analyze
Handles twin lifecycle operations.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from models.schemas import (
    WritingUpload, TwinCreate, TwinResponse, AnalysisResult,
)
from services.analysis_service import PersonalityAnalysisService
from services.twin_service import TwinService
from services.elevenlabs_service import ElevenLabsService
from services.storage_service import StorageService
from utils.helpers import sanitize_text
from typing import List

router = APIRouter()


@router.post("/create-twin", response_model=TwinResponse, summary="Create an AI twin")
async def create_twin(payload: TwinCreate):
    """
    Finalize creation of an AI twin using the personality analysis results.
    Returns the twin ID to use for chat and voice sessions.
    """
    twin = TwinService.create_twin(
        user_id=payload.user_id,
        name=payload.name,
        analysis=payload.analysis,
    )
    return twin


@router.post("/upload-writing", summary="Upload writing samples for analysis")
async def upload_writing(payload: WritingUpload):
    """
    Accept raw writing text from the user.
    Returns word count, preview, and personality analysis in one step.
    """
    text = sanitize_text(payload.text)
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    word_count = len(text.split())

    # Run analysis if sufficient text
    analysis = None
    if word_count >= 10:
        analysis = await PersonalityAnalysisService.analyze_writing(text)

    return {
        "message": "Writing sample received",
        "user_id": payload.user_id,
        "word_count": word_count,
        "preview": text[:120] + ("..." if len(text) > 120 else ""),
        "analysis": analysis.model_dump() if analysis else None,
    }


@router.post("/upload-voice", summary="Upload a voice audio file")
async def upload_voice(
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Accept a voice audio file upload (.mp3, .wav, .m4a).
    Stores the file in GCS and optionally clones the voice via ElevenLabs.
    """
    allowed_types = {
        "audio/mpeg", "audio/wav", "audio/x-wav",
        "audio/mp4", "audio/m4a", "audio/aac",
    }
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Use .mp3, .wav, or .m4a",
        )

    contents = await file.read()
    size_kb = round(len(contents) / 1024, 1)

    # Upload to Local Storage
    storage_url = await StorageService.upload_voice_sample(contents, user_id)

    # Attempt voice cloning via ElevenLabs
    voice_id = await ElevenLabsService.clone_voice(contents, f"twin_{user_id}")

    # If user already has a twin, attach voice_id
    if voice_id:
        twin = TwinService.get_twin_by_user(user_id)
        if twin:
            TwinService.set_voice_id(twin.twin_id, voice_id)

    return {
        "message": "Voice sample received and processed",
        "user_id": user_id,
        "filename": file.filename,
        "size_kb": size_kb,
        "storage_url": storage_url,
        "voice_cloned": voice_id is not None,
        "voice_id": voice_id,
    }


@router.post("/analyze", response_model=AnalysisResult, summary="Run personality analysis")
async def analyze_personality(payload: WritingUpload):
    """
    Run Big Five personality analysis on text.
    Requires at least 10 words for accurate results.
    """
    text = sanitize_text(payload.text)
    if len(text.split()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 10 words for accurate analysis.",
        )
    return await PersonalityAnalysisService.analyze_writing(text)


@router.get("/twins", response_model=List[TwinResponse], summary="List all available AI twins")
async def list_twins():
    """Retrieve all AI twins (for Explore/Marketplace)."""
    return TwinService.list_twins()


@router.get("/{twin_id}", response_model=TwinResponse, summary="Get an AI twin by ID")
async def get_twin(twin_id: str):
    """Retrieve details of an AI twin by its ID."""
    twin = TwinService.get_twin(twin_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Twin not found")
    return twin
