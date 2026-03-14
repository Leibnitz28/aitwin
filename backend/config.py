import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)


class Config:
    """Centralized configuration loaded from environment variables."""

    # ── Server ────────────────────────────────────────────────────────────────
    PORT: int = int(os.getenv("PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # ── ElevenLabs (Voice Cloning & TTS) ──────────────────────────────────────
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "")
    ELEVENLABS_BASE_URL: str = "https://api.elevenlabs.io/v1"

    # ── AI Services ───────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # ── Ethereum / Blockchain ─────────────────────────────────────────────────
    ETH_RPC_URL: str = os.getenv("ETH_RPC_URL", "")
    ETH_PRIVATE_KEY: str = os.getenv("ETH_PRIVATE_KEY", "")
    ETH_CONTRACT_ADDRESS: str = os.getenv("ETH_CONTRACT_ADDRESS", "")

    # ── Snowflake (Analytics DB) ──────────────────────────────────────────────
    SNOWFLAKE_ACCOUNT: str = os.getenv("SNOWFLAKE_ACCOUNT", "")
    SNOWFLAKE_USER: str = os.getenv("SNOWFLAKE_USER", "")
    SNOWFLAKE_PASSWORD: str = os.getenv("SNOWFLAKE_PASSWORD", "")
    SNOWFLAKE_DATABASE: str = os.getenv("SNOWFLAKE_DATABASE", "TWIN_AI")
    SNOWFLAKE_SCHEMA: str = os.getenv("SNOWFLAKE_SCHEMA", "PUBLIC")
    SNOWFLAKE_WAREHOUSE: str = os.getenv("SNOWFLAKE_WAREHOUSE", "COMPUTE_WH")

    # ── Google Cloud Storage ──────────────────────────────────────────────────
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "")
    GCS_CREDENTIALS_PATH: str = os.getenv("GCS_CREDENTIALS_PATH", "")

    @classmethod
    def has_openai(cls) -> bool:
        return bool(cls.OPENAI_API_KEY)

    @classmethod
    def has_gemini(cls) -> bool:
        return bool(cls.GEMINI_API_KEY)

    @classmethod
    def has_elevenlabs(cls) -> bool:
        return bool(cls.ELEVENLABS_API_KEY)

    @classmethod
    def has_blockchain(cls) -> bool:
        return bool(cls.ETH_RPC_URL and cls.ETH_PRIVATE_KEY)

    @classmethod
    def has_snowflake(cls) -> bool:
        return bool(cls.SNOWFLAKE_ACCOUNT and cls.SNOWFLAKE_USER)

    @classmethod
    def has_gcs(cls) -> bool:
        return bool(cls.GCS_BUCKET_NAME)
