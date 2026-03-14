"""
Twin Service
Manages AI twin lifecycle — creation, retrieval, and metadata updates.
In-memory store for development; ready to swap for a database.
"""

from datetime import datetime
from typing import Optional, List
from models.schemas import TwinCreate, TwinResponse, AnalysisResult
from utils.helpers import generate_id


class TwinService:
    """In-memory twin management service."""

    # Storage: {twin_id: TwinResponse}
    _twins: dict = {}
    # Quick lookup: {user_id: twin_id}
    _user_to_twin: dict = {}
    # Conversation counter per twin
    _chat_counts: dict = {}

    @classmethod
    def create_twin(cls, user_id: str, analysis: AnalysisResult) -> TwinResponse:
        """Create and store a new AI twin for a user."""
        twin_id = generate_id()
        now = datetime.utcnow()

        twin = TwinResponse(
            twin_id=twin_id,
            user_id=user_id,
            analysis=analysis,
            created_at=now,
        )

        cls._twins[twin_id] = twin
        cls._user_to_twin[user_id] = twin_id
        cls._chat_counts[twin_id] = 0
        print(f"🤖 Created twin {str(twin_id)[:8]}... for user {str(user_id)[:8]}...")  # type: ignore
        return twin

    @classmethod
    def get_twin(cls, twin_id: str) -> Optional[TwinResponse]:
        """Retrieve a twin by its ID."""
        return cls._twins.get(twin_id)

    @classmethod
    def get_twin_by_user(cls, user_id: str) -> Optional[TwinResponse]:
        """Retrieve the most recent twin for a given user."""
        twin_id = cls._user_to_twin.get(user_id)
        if twin_id:
            return cls._twins.get(twin_id)
        return None

    @classmethod
    def list_twins(cls) -> List[TwinResponse]:
        """Return all stored twins."""
        return list(cls._twins.values())

    @classmethod
    def increment_chat_count(cls, twin_id: str):
        """Increment the conversation counter for a twin."""
        cls._chat_counts[twin_id] = cls._chat_counts.get(twin_id, 0) + 1
        twin = cls._twins.get(twin_id)
        if twin:
            twin.conversation_count = cls._chat_counts[twin_id]

    @classmethod
    def set_voice_id(cls, twin_id: str, voice_id: str):
        """Attach a cloned voice ID to a twin."""
        twin = cls._twins.get(twin_id)
        if twin:
            twin.voice_id = voice_id

    @classmethod
    def set_blockchain_tx(cls, twin_id: str, tx_hash: str):
        """Attach a blockchain transaction hash to a twin."""
        twin = cls._twins.get(twin_id)
        if twin:
            twin.blockchain_tx = tx_hash

    @classmethod
    def get_stats(cls) -> dict:
        """Get aggregate stats about the twin ecosystem."""
        twins = cls.list_twins()
        total_chats = sum(cls._chat_counts.values())
        avg_match = (
            sum(t.analysis.overall_match for t in twins) / len(twins)
            if twins
            else 0
        )
        return {
            "total_twins": len(twins),
            "total_chats": total_chats,
            "average_match_score": round(avg_match, 1),  # type: ignore
        }
