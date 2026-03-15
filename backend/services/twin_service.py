"""
Twin Service
Manages AI twin lifecycle — creation, retrieval, and metadata updates.
Uses ChromaDB for persistent storage with in-memory fallback.
"""

from datetime import datetime
from typing import Optional, List
from models.schemas import TwinCreate, TwinResponse, AnalysisResult
from utils.helpers import generate_id


class TwinService:
    """Twin management service backed by ChromaDB vector database."""

    # In-memory fallback (used when ChromaDB is unavailable)
    _twins: dict = {}
    _user_to_twin: dict = {}
    _chat_counts: dict = {}

    @classmethod
    def _vdb(cls):
        """Get VectorDBService if available."""
        try:
            from services.vectordb_service import VectorDBService
            if VectorDBService.is_ready():
                return VectorDBService
        except Exception:
            pass
        return None

    @classmethod
    def create_twin(cls, user_id: str, name: str, analysis: AnalysisResult, voice_id: Optional[str] = None) -> TwinResponse:
        """Create and store a new AI twin for a user."""
        twin_id = generate_id()
        now = datetime.utcnow()

        twin = TwinResponse(
            twin_id=twin_id,
            user_id=user_id,
            name=name,
            analysis=analysis,
            voice_id=voice_id,
            created_at=now,
        )

        # Persist to ChromaDB
        vdb = cls._vdb()
        if vdb:
            vdb.upsert_twin(
                twin_id=twin_id,
                user_id=user_id,
                name=name,
                analysis=analysis.model_dump(),
                voice_id=voice_id,
                created_at=now.isoformat(),
            )

        # Also keep in-memory for fast access
        cls._twins[twin_id] = twin
        cls._user_to_twin[user_id] = twin_id
        cls._chat_counts[twin_id] = 0
        print(f"🤖 Created twin {str(twin_id)[:8]}... for user {str(user_id)[:8]}...")
        return twin

    @classmethod
    def get_twin(cls, twin_id: str) -> Optional[TwinResponse]:
        """Retrieve a twin by its ID. Checks memory first, then ChromaDB."""
        # 1. Check in-memory cache
        twin = cls._twins.get(twin_id)
        if twin:
            return twin

        # 2. Check ChromaDB
        vdb = cls._vdb()
        if vdb:
            data = vdb.get_twin(twin_id)
            if data:
                twin = cls._rebuild_twin(data)
                cls._twins[twin_id] = twin  # Cache
                return twin

        # 3. Fallback for development — seed default twin
        if twin_id == 'default_twin':
            from models.schemas import PersonalityTraits  # type: ignore
            analysis = AnalysisResult(
                traits=PersonalityTraits(openness=88, conscientiousness=75, extraversion=60, agreeableness=82, neuroticism=35),
                overall_match=94.5,
                summary="Creative, thoughtful, and analytical.",
            )
            twin = cls.create_twin(user_id="default_user", name="General Assistant", analysis=analysis)
            cls._twins.pop(twin.twin_id)
            twin.twin_id = twin_id
            cls._twins[twin_id] = twin
            cls._user_to_twin["default_user"] = twin_id
            return twin

        return None

    @classmethod
    def delete_twin(cls, twin_id: str) -> bool:
        """Delete a twin from memory and ChromaDB."""
        twin = cls._twins.pop(twin_id, None)
        
        # Remove from user mapping if it was the active twin
        if twin and cls._user_to_twin.get(twin.user_id) == twin_id:
            del cls._user_to_twin[twin.user_id]
            
        # Delete from ChromaDB
        vdb = cls._vdb()
        if vdb:
            vdb.delete_twin(twin_id)
            
        return twin is not None

    @classmethod
    def set_avatar_url(cls, twin_id: str, avatar_url: str):
        """Update a twin's 3D avatar URL."""
        # 1. Update in-memory
        if twin_id in cls._twins:
            cls._twins[twin_id].avatar_url = avatar_url

        # 2. Update Vector DB
        vdb = cls._vdb()
        if vdb:
            # We must fetch the existing meta to not overwrite other fields
            existing = vdb.get_twin(twin_id)
            if existing:
                # Use standard upsert with the full existing metadata
                vdb.upsert_twin(
                    twin_id=twin_id,
                    user_id=existing.get("user_id", ""),
                    name=existing.get("name", ""),
                    analysis=existing.get("analysis", {}),
                    voice_id=existing.get("voice_id", ""),
                    avatar_url=avatar_url,
                    blockchain_tx=existing.get("blockchain_tx", ""),
                    conversation_count=existing.get("conversation_count", 0),
                    created_at=existing.get("created_at", ""),
                )
    @classmethod
    def get_twin_by_user(cls, user_id: str) -> Optional[TwinResponse]:
        """Retrieve the most recent twin for a given user."""
        # Memory first
        twin_id = cls._user_to_twin.get(user_id)
        if twin_id:
            return cls._twins.get(twin_id)

        # ChromaDB
        vdb = cls._vdb()
        if vdb:
            data = vdb.get_twin_by_user(user_id)
            if data:
                twin = cls._rebuild_twin(data)
                cls._twins[twin.twin_id] = twin
                cls._user_to_twin[user_id] = twin.twin_id
                return twin

        return None

    @classmethod
    def list_twins(cls) -> List[TwinResponse]:
        """Return all stored twins from ChromaDB, falling back to memory."""
        vdb = cls._vdb()
        if vdb:
            data_list = vdb.list_twins()
            if data_list:
                twins = []
                for data in data_list:
                    created_at = datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.utcnow()
                    twin = TwinResponse(
                        twin_id=data["twin_id"],
                        user_id=data.get("user_id", ""),
                        name=data.get("name", "Unknown"),
                        analysis=AnalysisResult(**data.get("analysis", {})),
                        voice_id=data.get("voice_id"),
                        avatar_url=data.get("avatar_url"),
                        blockchain_tx=data.get("blockchain_tx"),
                        conversation_count=data.get("conversation_count", 0),
                        created_at=created_at,
                    )
                    cls._twins[twin.twin_id] = twin
                    twins.append(twin)
                if twins:
                    return twins

        # Fallback: in-memory
        if not cls._twins:
            cls.seed_dummy_twins()
        return list(cls._twins.values())

    @classmethod
    def seed_dummy_twins(cls):
        """Seed twin store with 3 distinct dummy personalities for Explore."""
        profiles = [
            ("creative_writer", "Creative Storyteller", "Imaginative, expressive, and passionate about storytelling.", {"openness": 95, "conscientiousness": 60, "extraversion": 75, "agreeableness": 80, "neuroticism": 40}, 92),
            ("logic_coder", "Logical Coder", "Direct, analytical, and highly structured.", {"openness": 70, "conscientiousness": 95, "extraversion": 40, "agreeableness": 65, "neuroticism": 25}, 88),
            ("empath_coach", "Empathic Coach", "Warm, supportive, and extremely empathetic.", {"openness": 85, "conscientiousness": 80, "extraversion": 90, "agreeableness": 98, "neuroticism": 45}, 96),
        ]

        for user_id, name, style, traits, match in profiles:
            analysis = AnalysisResult(
                traits=traits,
                overall_match=match,
                communication_style=style,
                warnings=[]
            )
            cls.create_twin(user_id=user_id, name=name, analysis=analysis)

    @classmethod
    def increment_chat_count(cls, twin_id: str):
        """Increment the conversation counter for a twin."""
        cls._chat_counts[twin_id] = cls._chat_counts.get(twin_id, 0) + 1
        twin = cls._twins.get(twin_id)
        if twin:
            twin.conversation_count = cls._chat_counts[twin_id]
            # Sync to ChromaDB
            vdb = cls._vdb()
            if vdb:
                vdb.upsert_twin(
                    twin_id=twin_id,
                    user_id=twin.user_id,
                    name=twin.name,
                    analysis=twin.analysis.model_dump(),
                    voice_id=twin.voice_id or "",
                    avatar_url=twin.avatar_url or "",
                    blockchain_tx=twin.blockchain_tx or "",
                    conversation_count=twin.conversation_count,
                    created_at=twin.created_at.isoformat(),
                )

    @classmethod
    def set_voice_id(cls, twin_id: str, voice_id: str):
        """Attach a cloned voice ID to a twin."""
        twin = cls._twins.get(twin_id)
        if twin:
            twin.voice_id = voice_id
            vdb = cls._vdb()
            if vdb:
                vdb.upsert_twin(
                    twin_id=twin_id, user_id=twin.user_id, name=twin.name,
                    analysis=twin.analysis.model_dump(), voice_id=voice_id,
                    blockchain_tx=twin.blockchain_tx or "",
                    conversation_count=twin.conversation_count,
                    created_at=twin.created_at.isoformat(),
                )

    @classmethod
    def set_blockchain_tx(cls, twin_id: str, tx_hash: str):
        """Attach a blockchain transaction hash to a twin."""
        twin = cls._twins.get(twin_id)
        if twin:
            twin.blockchain_tx = tx_hash
            vdb = cls._vdb()
            if vdb:
                vdb.upsert_twin(
                    twin_id=twin_id, user_id=twin.user_id, name=twin.name,
                    analysis=twin.analysis.model_dump(), voice_id=twin.voice_id or "",
                    blockchain_tx=tx_hash,
                    conversation_count=twin.conversation_count,
                    created_at=twin.created_at.isoformat(),
                )

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
            "average_match_score": round(avg_match, 1),
        }

    @classmethod
    def _rebuild_twin(cls, data: dict) -> TwinResponse:
        """Reconstruct a TwinResponse from ChromaDB metadata."""
        analysis_data = data.get("analysis", {})
        analysis = AnalysisResult(
            traits=analysis_data.get("traits", {}),
            overall_match=analysis_data.get("overall_match", 0),
            summary=analysis_data.get("summary", ""),
        )
        return TwinResponse(
            twin_id=data.get("twin_id", ""),
            user_id=data.get("user_id", ""),
            name=data.get("name", "My AI Twin"),
            analysis=analysis,
            voice_id=data.get("voice_id") or None,
            blockchain_tx=data.get("blockchain_tx") or None,
            conversation_count=int(data.get("conversation_count", 0)),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.utcnow(),
        )
