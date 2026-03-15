"""
Data Ingest Routes
POST /ingest-web    — scrape a URL and store into ChromaDB
POST /ingest-social — ingest GitHub/Reddit/Twitter content
GET  /ingest-status — return document counts for a user
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional

from services.web_scraper_service import WebScraperService
from services.social_media_service import SocialMediaService

router = APIRouter(prefix="/ingest", tags=["📥 Data Ingestion"])


class WebIngestRequest(BaseModel):
    url: str
    user_id: str


class SocialIngestRequest(BaseModel):
    platform: str           # "github" | "reddit" | "twitter"
    handle: str
    user_id: str


@router.post("/web", summary="Scrape a URL and store into twin memory")
async def ingest_web(body: WebIngestRequest):
    """
    Fetches the given public URL, cleans the page text, splits it into chunks,
    and stores each chunk in ChromaDB under the user's profile.
    The AI twin will use this knowledge when answering questions.
    """
    result = await WebScraperService.ingest_url(url=body.url, user_id=body.user_id)
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])
    return {
        "status": "success",
        "message": f"Ingested {result['chunks_stored']} chunks from '{result['title']}'",
        **result,
    }


@router.post("/social", summary="Ingest public social media profile into twin memory")
async def ingest_social(body: SocialIngestRequest):
    """
    Fetches public posts from the specified social platform and stores them in ChromaDB.
    Supported platforms: github, reddit, twitter
    """
    platform = body.platform.lower().strip()

    if platform == "github":
        result = await SocialMediaService.ingest_github(handle=body.handle, user_id=body.user_id)
    elif platform == "reddit":
        result = await SocialMediaService.ingest_reddit(handle=body.handle, user_id=body.user_id)
    elif platform in ("twitter", "x"):
        result = await SocialMediaService.ingest_twitter(handle=body.handle, user_id=body.user_id)
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported platform: '{platform}'. Use github, reddit, or twitter.",
        )

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return {
        "status": "success",
        "message": (
            f"Ingested {result.get('posts_ingested', 0)} posts from "
            f"{platform} @{body.handle} "
            f"({result.get('chunks_stored', 0)} chunks stored)"
        ),
        **result,
    }


@router.get("/status/{user_id}", summary="Get ingested document counts for a user")
async def ingest_status(user_id: str):
    """
    Returns how many documents (web pages, social posts, writing samples, conversations)
    have been stored in ChromaDB for the given user.
    """
    try:
        from services.vectordb_service import VectorDBService
        if not VectorDBService.is_ready():
            return {"user_id": user_id, "status": "ChromaDB unavailable", "counts": {}}
        counts = VectorDBService.get_document_counts(user_id=user_id)
        total = sum(counts.values())
        return {
            "user_id": user_id,
            "total_documents": total,
            "counts": counts,
            "status": "ok",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
