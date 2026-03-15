"""
VectorDB Service — ChromaDB Wrapper
Manages 4 persistent collections: twins, conversations, users, writing_samples.
Provides semantic search via ChromaDB's built-in embeddings.
"""

import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
from config import Config  # type: ignore


class VectorDBService:
    """Persistent vector database layer backed by ChromaDB."""

    _client: Any = None
    _twins_col: Any = None
    _conversations_col: Any = None
    _users_col: Any = None
    _writing_col: Any = None
    _web_col: Any = None
    _social_col: Any = None

    # ── Initialization ────────────────────────────────────────────────────────

    @classmethod
    def init(cls):
        """Initialize ChromaDB persistent client and collections."""
        if cls._client is not None:
            return

        try:
            import chromadb  # type: ignore

            persist_dir = Path(Config.CHROMA_PERSIST_DIR).resolve()
            persist_dir.mkdir(parents=True, exist_ok=True)

            cls._client = chromadb.PersistentClient(path=str(persist_dir))

            # Create or load collections
            cls._twins_col = cls._client.get_or_create_collection(
                name="twins",
                metadata={"description": "AI twin profiles with personality data"},
            )
            cls._conversations_col = cls._client.get_or_create_collection(
                name="conversations",
                metadata={"description": "Chat history with semantic search"},
            )
            cls._users_col = cls._client.get_or_create_collection(
                name="users",
                metadata={"description": "Registered user accounts"},
            )
            cls._writing_col = cls._client.get_or_create_collection(
                name="writing_samples",
                metadata={"description": "Writing samples with personality embeddings"},
            )
            cls._web_col = cls._client.get_or_create_collection(
                name="web_content",
                metadata={"description": "Scraped web page content"},
            )
            cls._social_col = cls._client.get_or_create_collection(
                name="social_content",
                metadata={"description": "Social media posts and profiles"},
            )

            print(f"✅ ChromaDB initialized at {persist_dir}")
            print(f"   Collections: twins({cls._twins_col.count()}), "
                  f"conversations({cls._conversations_col.count()}), "
                  f"users({cls._users_col.count()}), "
                  f"writing_samples({cls._writing_col.count()}), "
                  f"web({cls._web_col.count()}), "
                  f"social({cls._social_col.count()})")

        except Exception as e:
            print(f"⚠️ ChromaDB init failed: {e}")
            cls._client = None

    @classmethod
    def is_ready(cls) -> bool:
        return cls._client is not None

    # ═══════════════════════════════════════════════════════════════════════════
    # TWINS COLLECTION
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def upsert_twin(cls, twin_id: str, user_id: str, name: str,
                    analysis: dict, voice_id: str = "",
                    avatar_url: str = "",
                    blockchain_tx: str = "", conversation_count: int = 0,
                    created_at: str = "") -> bool:
        """Store or update a twin profile in the vector DB."""
        if not cls.is_ready():
            return False

        doc_text = (
            f"Twin: {name}. User: {user_id}. "
            f"Personality: {json.dumps(analysis.get('traits', {}))}. "
            f"Summary: {analysis.get('summary', '')}. "
            f"Match: {analysis.get('overall_match', 0)}%."
        )

        cls._twins_col.upsert(
            ids=[twin_id],
            documents=[doc_text],
            metadatas=[{
                "user_id": user_id,
                "name": name,
                "analysis_json": json.dumps(analysis),
                "voice_id": voice_id or "",
                "avatar_url": avatar_url or "",
                "blockchain_tx": blockchain_tx or "",
                "conversation_count": conversation_count,
                "created_at": created_at or datetime.utcnow().isoformat(),
            }],
        )
        return True

    @classmethod
    def get_twin(cls, twin_id: str) -> Optional[dict]:
        """Retrieve a twin by ID."""
        if not cls.is_ready():
            return None

        try:
            result = cls._twins_col.get(ids=[twin_id], include=["metadatas"])
            if result and result["ids"]:
                meta = result["metadatas"][0]
                return {
                    "twin_id": twin_id,
                    **meta,
                    "analysis": json.loads(meta.get("analysis_json", "{}")),
                }
        except Exception:
            pass
        return None

    @classmethod
    def get_twin_by_user(cls, user_id: str) -> Optional[dict]:
        """Find the most recent twin for a user."""
        if not cls.is_ready():
            return None

        try:
            result = cls._twins_col.get(
                where={"user_id": user_id},
                include=["metadatas"],
            )
            if result and result["ids"]:
                # Return the last one (most recent)
                idx = len(result["ids"]) - 1
                meta = result["metadatas"][idx]
                return {
                    "twin_id": result["ids"][idx],
                    **meta,
                    "analysis": json.loads(meta.get("analysis_json", "{}")),
                }
        except Exception:
            pass
        return None

    @classmethod
    def delete_twin(cls, twin_id: str) -> bool:
        """Delete a twin from the vector DB."""
        if not cls.is_ready():
            return False
            
        try:
            cls._twins_col.delete(ids=[twin_id])
            return True
        except Exception as e:
            print(f"⚠️ VectorDB delete error: {e}")
            return False

    @classmethod
    def list_twins(cls) -> List[dict]:
        """Return all stored twins."""
        if not cls.is_ready():
            return []

        try:
            result = cls._twins_col.get(include=["metadatas"])
            twins = []
            for i, twin_id in enumerate(result["ids"]):
                meta = result["metadatas"][i]
                twins.append({
                    "twin_id": twin_id,
                    **meta,
                    "analysis": json.loads(meta.get("analysis_json", "{}")),
                })
            return twins
        except Exception:
            return []

    @classmethod
    def search_twins(cls, query: str, n_results: int = 5) -> List[dict]:
        """Semantic search for twins matching a natural-language query."""
        if not cls.is_ready():
            return []

        try:
            result = cls._twins_col.query(
                query_texts=[query],
                n_results=n_results,
                include=["metadatas", "distances"],
            )
            twins = []
            for i, twin_id in enumerate(result["ids"][0]):
                meta = result["metadatas"][0][i]
                twins.append({
                    "twin_id": twin_id,
                    **meta,
                    "analysis": json.loads(meta.get("analysis_json", "{}")),
                    "relevance_score": round(1 - result["distances"][0][i], 3),  # type: ignore
                })
            return twins
        except Exception:
            return []

    # ═══════════════════════════════════════════════════════════════════════════
    # CONVERSATIONS COLLECTION
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def add_conversation(cls, twin_id: str, user_message: str,
                         ai_reply: str) -> bool:
        """Store a conversation exchange with semantic embedding."""
        if not cls.is_ready():
            return False

        doc_id = f"{twin_id}_{datetime.utcnow().timestamp()}"
        doc_text = f"User said: {user_message}\nAI replied: {ai_reply}"

        cls._conversations_col.add(
            ids=[doc_id],
            documents=[doc_text],
            metadatas=[{
                "twin_id": twin_id,
                "user_message": user_message[:500],  # type: ignore
                "ai_reply": ai_reply[:500],  # type: ignore
                "timestamp": datetime.utcnow().isoformat(),
            }],
        )
        return True

    @classmethod
    def search_conversations(cls, twin_id: str, query: str,
                             n_results: int = 3) -> List[dict]:
        """Semantic search for past conversations relevant to the current query."""
        if not cls.is_ready():
            return []

        try:
            result = cls._conversations_col.query(
                query_texts=[query],
                n_results=n_results,
                where={"twin_id": twin_id},
                include=["metadatas", "distances"],
            )
            conversations = []
            if result and result["ids"] and result["ids"][0]:
                for i in range(len(result["ids"][0])):
                    meta = result["metadatas"][0][i]
                    conversations.append({
                        "user": meta.get("user_message", ""),
                        "ai": meta.get("ai_reply", ""),
                        "timestamp": meta.get("timestamp", ""),
                        "relevance": round(1 - result["distances"][0][i], 3),  # type: ignore
                    })
            return conversations
        except Exception:
            return []

    @classmethod
    def get_recent_conversations(cls, twin_id: str, limit: int = 50) -> List[dict]:
        """Get recent conversations for a twin (fallback for non-semantic retrieval)."""
        if not cls.is_ready():
            return []

        try:
            result = cls._conversations_col.get(
                where={"twin_id": twin_id},
                include=["metadatas"],
            )
            convos = []
            if result and result["ids"]:
                for i in range(len(result["ids"])):
                    meta = result["metadatas"][i]
                    convos.append({
                        "user": meta.get("user_message", ""),
                        "ai": meta.get("ai_reply", ""),
                    })
            return convos[-limit:]  # type: ignore
        except Exception:
            return []

    # ═══════════════════════════════════════════════════════════════════════════
    # USERS COLLECTION
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def upsert_user(cls, user_id: str, name: str, email: str,
                    created_at: str = "") -> bool:
        """Store or update a user profile."""
        if not cls.is_ready():
            return False

        doc_text = f"User: {name}, Email: {email}"

        cls._users_col.upsert(
            ids=[user_id],
            documents=[doc_text],
            metadatas=[{
                "name": name,
                "email": email,
                "created_at": created_at or datetime.utcnow().isoformat(),
            }],
        )
        return True

    @classmethod
    def get_user(cls, user_id: str) -> Optional[dict]:
        """Retrieve a user by ID."""
        if not cls.is_ready():
            return None

        try:
            result = cls._users_col.get(ids=[user_id], include=["metadatas"])
            if result and result["ids"]:
                meta = result["metadatas"][0]
                return {"id": user_id, **meta}
        except Exception:
            pass
        return None

    @classmethod
    def get_user_by_email(cls, email: str) -> Optional[dict]:
        """Find a user by email."""
        if not cls.is_ready():
            return None

        try:
            result = cls._users_col.get(
                where={"email": email},
                include=["metadatas"],
            )
            if result and result["ids"]:
                meta = result["metadatas"][0]
                return {"id": result["ids"][0], **meta}
        except Exception:
            pass
        return None

    @classmethod
    def list_users(cls) -> List[dict]:
        """Return all registered users."""
        if not cls.is_ready():
            return []

        try:
            result = cls._users_col.get(include=["metadatas"])
            users = []
            for i, uid in enumerate(result["ids"]):
                meta = result["metadatas"][i]
                users.append({"id": uid, **meta})
            return users
        except Exception:
            return []

    # ═══════════════════════════════════════════════════════════════════════════
    # WRITING SAMPLES COLLECTION
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def add_writing_sample(cls, user_id: str, text: str,
                           traits: Optional[dict] = None) -> bool:
        """Store a writing sample with optional personality traits."""
        if not cls.is_ready():
            return False

        doc_id = f"{user_id}_{datetime.utcnow().timestamp()}"

        cls._writing_col.add(
            ids=[doc_id],
            documents=[text],
            metadatas=[{
                "user_id": user_id,
                "traits_json": json.dumps(traits or {}),
                "char_count": len(text),
                "word_count": len(text.split()),
                "timestamp": datetime.utcnow().isoformat(),
            }],
        )
        return True

    @classmethod
    def search_similar_writing(cls, query: str, n_results: int = 5) -> List[dict]:
        """Find writing samples semantically similar to the query."""
        if not cls.is_ready():
            return []

        try:
            result = cls._writing_col.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )
            samples = []
            if result and result["ids"] and result["ids"][0]:
                for i in range(len(result["ids"][0])):
                    meta = result["metadatas"][0][i]
                    samples.append({
                        "text": result["documents"][0][i][:200],
                        "user_id": meta.get("user_id", ""),
                        "traits": json.loads(meta.get("traits_json", "{}")),
                        "relevance": round(1 - result["distances"][0][i], 3),  # type: ignore
                    })
            return samples
        except Exception:
            return []

    # ═══════════════════════════════════════════════════════════════════════════
    # WEB CONTENT COLLECTION
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def add_web_content(cls, user_id: str, url: str, title: str,
                        text: str, chunk_index: int = 0) -> bool:
        """Store a chunk of scraped web page content."""
        if not cls.is_ready() or cls._web_col is None:
            return False
        doc_id = f"{user_id}_web_{hash(url)}_{chunk_index}"
        try:
            cls._web_col.upsert(
                ids=[doc_id],
                documents=[text],
                metadatas=[{
                    "user_id": user_id,
                    "url": url,
                    "title": title,
                    "chunk_index": chunk_index,
                    "timestamp": datetime.utcnow().isoformat(),
                }],
            )
            return True
        except Exception as e:
            print(f"⚠️ add_web_content error: {e}")
            return False

    @classmethod
    def search_web_content(cls, user_id: str, query: str, n_results: int = 5) -> List[dict]:
        """Semantic search over scraped web content for a user."""
        if not cls.is_ready() or cls._web_col is None:
            return []
        try:
            result = cls._web_col.query(
                query_texts=[query],
                n_results=n_results,
                where={"user_id": user_id},
                include=["documents", "metadatas", "distances"],
            )
            items = []
            if result and result["ids"] and result["ids"][0]:
                for i in range(len(result["ids"][0])):
                    meta = result["metadatas"][0][i]
                    items.append({
                        "text": result["documents"][0][i][:400],
                        "url": meta.get("url", ""),
                        "title": meta.get("title", ""),
                        "relevance": round(1 - result["distances"][0][i], 3),  # type: ignore
                    })
            return items
        except Exception:
            return []

    # ═══════════════════════════════════════════════════════════════════════════
    # SOCIAL CONTENT COLLECTION
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def add_social_content(cls, user_id: str, platform: str, handle: str,
                           text: str, chunk_index: int = 0) -> bool:
        """Store a chunk of social media content."""
        if not cls.is_ready() or cls._social_col is None:
            return False
        doc_id = f"{user_id}_{platform}_{hash(text)}_{chunk_index}"
        try:
            cls._social_col.upsert(
                ids=[doc_id],
                documents=[text],
                metadatas=[{
                    "user_id": user_id,
                    "platform": platform,
                    "handle": handle,
                    "chunk_index": chunk_index,
                    "timestamp": datetime.utcnow().isoformat(),
                }],
            )
            return True
        except Exception as e:
            print(f"⚠️ add_social_content error: {e}")
            return False

    @classmethod
    def search_social_content(cls, user_id: str, query: str, n_results: int = 5) -> List[dict]:
        """Semantic search over social media content for a user."""
        if not cls.is_ready() or cls._social_col is None:
            return []
        try:
            result = cls._social_col.query(
                query_texts=[query],
                n_results=n_results,
                where={"user_id": user_id},
                include=["documents", "metadatas", "distances"],
            )
            items = []
            if result and result["ids"] and result["ids"][0]:
                for i in range(len(result["ids"][0])):
                    meta = result["metadatas"][0][i]
                    items.append({
                        "text": result["documents"][0][i][:400],
                        "platform": meta.get("platform", ""),
                        "handle": meta.get("handle", ""),
                        "relevance": round(1 - result["distances"][0][i], 3),  # type: ignore
                    })
            return items
        except Exception:
            return []

    # ═══════════════════════════════════════════════════════════════════════════
    # CROSS-COLLECTION HELPERS
    # ═══════════════════════════════════════════════════════════════════════════

    @classmethod
    def get_user_knowledge(cls, user_id: str, query: str, n_results: int = 4) -> str:
        """
        Retrieve the most relevant knowledge about a user from all sources —
        writing samples, web content, and social media.
        Returns a formatted string for injection into the agent's system prompt.
        """
        sections = []

        # Writing samples
        try:
            writings = cls._writing_col.query(
                query_texts=[query],
                n_results=n_results,
                where={"user_id": user_id},
                include=["documents"],
            )
            if writings and writings["ids"] and writings["ids"][0]:
                excerpts = [writings["documents"][0][i][:300] for i in range(len(writings["ids"][0]))]
                if excerpts:
                    sections.append("## Writing Samples\n" + "\n---\n".join(excerpts))
        except Exception:
            pass

        # Web content
        web = cls.search_web_content(user_id=user_id, query=query, n_results=n_results)
        if web:
            web_texts = [f"[{w['title']}]: {w['text']}" for w in web]
            sections.append("## Web / Article Knowledge\n" + "\n---\n".join(web_texts))

        # Social media
        social = cls.search_social_content(user_id=user_id, query=query, n_results=n_results)
        if social:
            social_texts = [f"[{s['platform']} @{s['handle']}]: {s['text']}" for s in social]
            sections.append("## Social Media Posts\n" + "\n---\n".join(social_texts))

        if not sections:
            return ""
        return "\n\n".join(sections)

    @classmethod
    def get_document_counts(cls, user_id: str) -> dict:
        """Return how many documents each source has for a given user."""
        counts = {"writing": 0, "web": 0, "social": 0, "conversations": 0}
        if not cls.is_ready():
            return counts
        try:
            if cls._writing_col:
                r = cls._writing_col.get(where={"user_id": user_id}, include=[])
                counts["writing"] = len(r.get("ids", []))
        except Exception:
            pass
        try:
            if cls._web_col:
                r = cls._web_col.get(where={"user_id": user_id}, include=[])
                counts["web"] = len(r.get("ids", []))
        except Exception:
            pass
        try:
            if cls._social_col:
                r = cls._social_col.get(where={"user_id": user_id}, include=[])
                counts["social"] = len(r.get("ids", []))
        except Exception:
            pass
        try:
            if cls._conversations_col:
                r = cls._conversations_col.get(include=[])
                counts["conversations"] = len(r.get("ids", []))
        except Exception:
            pass
        return counts

