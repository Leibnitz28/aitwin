"""
Analytics Routes — GET /analytics
Dashboard data from Snowflake and in-memory twin stats.
"""

from fastapi import APIRouter
from models.schemas import AnalyticsResponse
from services.snowflake_service import SnowflakeService
from services.twin_service import TwinService

router = APIRouter()


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    summary="Get system-wide analytics and dashboard data",
)
async def get_analytics():
    """
    Retrieve analytics data for the dashboard:
    - Conversation stats, accuracy over time, personality profile
    - Usage statistics across text, voice, blockchain, and agents
    Data is sourced from Snowflake when configured, otherwise returns mock data.
    """
    # Get data from Snowflake (or mock)
    data = await SnowflakeService.get_analytics()

    # Supplement with live twin stats
    twin_stats = TwinService.get_stats()

    return AnalyticsResponse(
        total_conversations=data.get("total_conversations", twin_stats["total_chats"]),
        active_users=data.get("active_users", twin_stats["total_twins"]),
        accuracy_score=data.get("accuracy_score", 94.2),
        avg_response_time=data.get("avg_response_time", 1.3),
        conversation_data=data.get("conversation_data", []),
        accuracy_data=data.get("accuracy_data", []),
        personality_profile=data.get("personality_profile", {}),
        usage_stats=data.get("usage_stats", []),
    )
