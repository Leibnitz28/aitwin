from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


# ═══════════════════════════════════════════════════════════════════════════════
# USER MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# PERSONALITY & ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

class PersonalityTraits(BaseModel):
    openness: float = 0.0
    conscientiousness: float = 0.0
    extraversion: float = 0.0
    agreeableness: float = 0.0
    neuroticism: float = 0.0


class AnalysisResult(BaseModel):
    traits: PersonalityTraits
    overall_match: float = 0.0
    summary: str = ""


# ═══════════════════════════════════════════════════════════════════════════════
# TWIN MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class TwinCreate(BaseModel):
    user_id: str
    name: str = "My AI Twin"
    analysis: AnalysisResult


class TwinResponse(BaseModel):
    twin_id: str
    user_id: str
    name: str = "My AI Twin"
    analysis: AnalysisResult
    voice_id: Optional[str] = None
    blockchain_tx: Optional[str] = None
    conversation_count: int = 0
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# WRITING UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════

class WritingUpload(BaseModel):
    user_id: str
    text: str


# ═══════════════════════════════════════════════════════════════════════════════
# CHAT MODELS (Full Pipeline)
# ═══════════════════════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    twin_id: str
    message: str


class AgentStep(BaseModel):
    agent_name: str
    status: str = "completed"
    output: str = ""
    duration_ms: float = 0.0


class ChatResponse(BaseModel):
    reply: str
    audio_url: Optional[str] = None
    twin_id: str
    agents_used: List[AgentStep] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ═══════════════════════════════════════════════════════════════════════════════
# VOICE GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

class VoiceGenerationRequest(BaseModel):
    text: str
    twin_id: str


class VoiceGenerationResponse(BaseModel):
    audio_url: Optional[str] = None
    twin_id: str
    text_length: int
    provider: str = "elevenlabs"


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCKCHAIN / IDENTITY MINTING
# ═══════════════════════════════════════════════════════════════════════════════

class IdentityMintRequest(BaseModel):
    twin_id: str
    user_id: str


class IdentityMintResponse(BaseModel):
    twin_id: str
    transaction_hash: str
    token_id: str
    owner: str
    contract_address: str
    status: str = "pending"
    network: str = "ethereum"


# ═══════════════════════════════════════════════════════════════════════════════
# ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════════

class ConversationStat(BaseModel):
    name: str
    conversations: int


class AccuracyStat(BaseModel):
    name: str
    accuracy: float


class UsageStat(BaseModel):
    label: str
    value: int
    max: int


class AnalyticsResponse(BaseModel):
    total_conversations: int
    active_users: int
    accuracy_score: float
    avg_response_time: float
    conversation_data: List[ConversationStat] = []
    accuracy_data: List[AccuracyStat] = []
    personality_profile: Dict[str, float] = {}
    usage_stats: List[UsageStat] = []
