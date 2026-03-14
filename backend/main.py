"""
Twin AI — EchoSoul API
Production-grade FastAPI backend with multi-agent AI orchestration,
ElevenLabs voice synthesis, Ethereum blockchain identity,
Snowflake analytics, and Google Cloud Storage.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat_routes, twin_routes, voice_routes, blockchain_routes, analytics_routes
from config import Config
import uvicorn

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Twin AI — EchoSoul API",
    description=(
        "AI Personality Twin platform backend.\n\n"
        "**Features:**\n"
        "- 🧠 5-agent AI orchestration pipeline\n"
        "- 🔊 ElevenLabs voice cloning & TTS\n"
        "- ⛓️ Ethereum NFT identity minting (web3.py)\n"
        "- ❄️ Snowflake analytics & conversation logging\n"
        "- ☁️ Google Cloud Storage for audio files\n"
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[Config.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(chat_routes.router,       tags=["💬 Chat"])
app.include_router(twin_routes.router,       tags=["🤖 Twins"])
app.include_router(voice_routes.router,      tags=["🔊 Voice"])
app.include_router(blockchain_routes.router, tags=["⛓️ Blockchain"])
app.include_router(analytics_routes.router,  tags=["📊 Analytics"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "message": "Twin AI — EchoSoul API v2.0 🚀",
        "docs": "/docs",
        "integrations": {
            "gemini": Config.has_gemini(),
            "openai": Config.has_openai(),
            "elevenlabs": Config.has_elevenlabs(),
            "blockchain": Config.has_blockchain(),
            "snowflake": Config.has_snowflake(),
            "gcs": Config.has_gcs(),
        },
    }


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = Config.PORT
    print(f"\n🚀 Starting Twin AI — EchoSoul API v2.0")
    print(f"   Server:      http://localhost:{port}")
    print(f"   Swagger:     http://localhost:{port}/docs")
    print(f"   ReDoc:       http://localhost:{port}/redoc")
    print(f"\n   Integrations:")
    print(f"   ├── Gemini/OpenAI: {'✅ Connected' if Config.has_gemini() or Config.has_openai() else '⬜ Not configured'}")
    print(f"   ├── ElevenLabs: {'✅ Connected' if Config.has_elevenlabs() else '⬜ Not configured'}")
    print(f"   ├── Blockchain: {'✅ Connected' if Config.has_blockchain() else '⬜ Not configured'}")
    print(f"   ├── Snowflake:  {'✅ Connected' if Config.has_snowflake() else '⬜ Not configured'}")
    print(f"   └── GCS:        {'✅ Connected' if Config.has_gcs() else '⬜ Not configured'}\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
