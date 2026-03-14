from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisResult, PersonalityTraits
from services.twin_service import TwinService

router = APIRouter()


@router.get("/{user_id}", response_model=AnalysisResult, summary="Get saved personality analysis for a user")
async def get_personality(user_id: str):
    """
    Retrieve the stored personality analysis for a user_id.
    Looks up the most recent twin created for that user.
    """
    twin = TwinService.get_twin_by_user(user_id)
    if not twin:
        raise HTTPException(
            status_code=404,
            detail="No personality analysis found for this user. Create a twin first."
        )
    return twin.analysis


@router.post("/", summary="Save a personality analysis result")
async def save_personality(user_id: str, analysis: AnalysisResult):
    """Manually save or update a personality analysis for a user."""
    from models.schemas import TwinCreate
    twin = TwinService.create_twin(user_id=user_id, analysis=analysis)
    return {"message": "Personality analysis saved", "twin_id": twin.twin_id}
