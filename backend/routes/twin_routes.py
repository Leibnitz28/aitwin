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
from services.local_voice_service import LocalVoiceService
from services.storage_service import StorageService
from services.avatar3d_service import Avatar3DService
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

    # Persist writing sample to ChromaDB
    try:
        from services.vectordb_service import VectorDBService
        if VectorDBService.is_ready():
            VectorDBService.add_writing_sample(
                user_id=payload.user_id,
                text=text,
                traits=analysis.traits.model_dump() if analysis else {},
            )
    except Exception:
        pass

    return {
        "message": "Writing sample received",
        "user_id": payload.user_id,
        "word_count": word_count,
        "preview": text[:120] + ("..." if len(text) > 120 else ""),
        "analysis": analysis.model_dump() if analysis else None,
    }


@router.post("/upload-avatar", summary="Upload an image to generate a 3D avatar")
async def upload_avatar(
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Accept an image file (.jpg, .png) and submit it to 3D AI Studio for 3D generation.
    Returns a task_id to poll for completion.
    """
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type}. Use .jpg or .png",
        )

    contents = await file.read()
    
    # Submit to 3D AI Studio
    result = await Avatar3DService.create_3d_model(contents)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return {
        "message": "3D generation task started",
        "user_id": user_id,
        "task_id": result["task_id"],
        "status": "processing"
    }


@router.get("/avatar-status/{task_id}", summary="Check 3D avatar generation status")
async def check_avatar_status(task_id: str, twin_id: str = None):
    """
    Poll the status of a 3D generation task from 3D AI Studio.
    If twin_id is provided and status is succeeded, it saves the avatar_url to the twin.
    """
    result = await Avatar3DService.get_task_status(task_id)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    status = result.get("status")
    model_url = result.get("model_url")
    
    # If a twin ID was given and the generation finished, save the URL
    if twin_id and status == "succeeded" and model_url:
        TwinService.set_avatar_url(twin_id, model_url)
        
    return result


@router.post("/upload-voice", summary="Upload a voice audio file")
async def upload_voice(
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Accept a voice audio file upload (.mp3, .wav, .m4a).
    Stores the file in GCS and clones the voice locally using XTTS-v2.
    """
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Please upload an audio file.",
        )

    contents = await file.read()
    size_kb = round(len(contents) / 1024, 1)

    # Upload to Local Storage
    storage_url = await StorageService.upload_voice_sample(contents, user_id)

    # Voice cloning via Local XTTS-v2
    voice_id = await LocalVoiceService.clone_voice(contents, f"twin_{user_id}")
    clone_success = voice_id is not None

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
        "voice_cloned": clone_success,
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

@router.delete("/twins/{twin_id}", summary="Delete an AI twin")
async def delete_twin(twin_id: str):
    """
    Deletes a twin and all associated data from the platform.
    """
    success = TwinService.delete_twin(twin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Twin not found")
        
    return {"message": "Twin deleted successfully", "twin_id": twin_id}


@router.get("/search", summary="Semantic search for twins and conversations")
async def search(q: str = "", n: int = 5):
    """
    Semantic search across twins and conversations using ChromaDB embeddings.
    Returns twins and conversation snippets ranked by relevance.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")

    try:
        from services.vectordb_service import VectorDBService
        if not VectorDBService.is_ready():
            raise HTTPException(status_code=503, detail="Vector DB not available")

        twins = VectorDBService.search_twins(query=q, n_results=n)
        conversations = VectorDBService.search_similar_writing(query=q, n_results=n)

        return {
            "query": q,
            "twins": twins,
            "writing_samples": conversations,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")
