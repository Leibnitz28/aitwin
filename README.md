# 🧬 EchoSoul: AI Personality Twin Platform

An intelligent, multi-agent platform designed to replicate and interact with a digital personality twin. Built with Next.js, FastAPI, ChromaDB, and cutting-edge GenAI APIs, EchoSoul constructs an AI version of you using data from your web footprint, social media, writing samples, and real-time voice cloning.

---

## 🌟 Key Features

### 🖥️ Frontend (Next.js 16)
- **Tech Stack**: Next.js 16 (React 19), TailwindCSS v4, Framer Motion, Lucide React.
- **Glassmorphic UI**: Complete, responsive modern dark UI with dynamic animated routes.
- **Twin Creation Flow**: Interactive multi-step onboarding to upload writing and voice samples.
- **Data Ingestion Hub**: Paste URLs to trigger the web scraper, pull Reddit/GitHub/Twitter social data, upload voice clones, or paste writing samples.
- **Immersive Chat**: Hold-to-record voice interactions with live Audio Playback, animated typing indicators, and a dropdown visualization of the internal AI agent pipeline step execution.

### ⚙️ Backend (FastAPI + AI Agents)
- **Vector Database**: **ChromaDB** maintains specialized collections for `web_content` (chunked web sites), `social_content` (chunked tweets & repos), and `writing_samples`.
- **Personality Analysis Engine**: Dynamic agent pipeline using Gemini 1.5 Flash (or OpenAI GPT-4) to extract and calculate Big Five personality traits based on ingested user data.
- **Voice Synthesis (ElevenLabs)**: Implements **ElevenLabs** API for ultra-realistic voice cloning from uploaded `.mp3`/`.webm` samples and real-time Text-To-Speech generation. (Falls back to OpenVoice on API disruption).
- **Web & Social Web Scraping**: Ingests public URLs (via BeautifulSoup4) and Twitter/Reddit data natively.
- **Analytics & Blockchain Integration**: Uses Snowflake connector for user metric logging and Web3.py for native minting of Digital Twin identities onto the Ethereum Blockchain.

---

## 💻 Tech Stack Overview
**Frontend**: Next.js, React, Tailwind CSS, Framer Motion  
**Backend**: FastAPI, Pydantic, Uvicorn, Python 3  
**Database**: ChromaDB (Vector Search), Snowflake (Analytics)  
**AI Models/APIs**: Gemini 1.5 Flash, OpenAI GPT-4/3.5, ElevenLabs, Whisper  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- LLM API Keys (Gemini or OpenAI)
- ElevenLabs API Key (for Voice Cloning)

### 1. Frontend Setup
Open a terminal in the root directory:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 2. Backend Setup
Open a **new** terminal window and navigate to the backend directory:
```bash
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

# Install the dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```
*Backend runs on `http://localhost:8000`*

### 3. Environment Variables
Create a `.env` file inside the `/backend` folder. **(Note: This file is git-ignored for safety)**

```env
# /backend/.env

# --- AI APIs ---
# Provide either Gemini or OpenAI (or both)
GEMINI_API_KEY="AIzaSyYourGeminiKeyHere..."
OPENAI_API_KEY="sk-proj-YourOpenAIKeyHere..."

# --- Voice Synthesis ---
ELEVENLABS_API_KEY="sk_YourElevenLabsKey..."
ELEVENLABS_VOICE_ID="YourCustomVoiceID..." # Leave blank if you haven't created one yet
```

---

## 📁 Repository Structure
```
├── frontend/           # Next.js App
│   ├── src/app/        # App Router pages (chat, ingest, dashboard, etc.)
│   ├── src/components/ # Reusable React components
│   └── package.json    # Frontend dependencies
├── backend/            # FastAPI Python App
│   ├── main.py         # Entry point
│   ├── config.py       # Configuration & Env Loading
│   ├── routes/         # API Routers (chat, ingest, voice, etc.)
│   ├── services/       # Core business logic (Agents, ChromaDB, Scraping)
│   ├── uploads/        # Local persistent file storage
│   └── chroma_data/    # ChromaDB persistent storage (git-ignored)
└── README.md           # Documentation
```

---

## 📌 Contributing & Future Features
- **Blockchain Hardening**: Finalize Ethereum NFT logic to fully mint User Twin objects exclusively on the ETH Blockchain.
- **True Auth Integration**: Integrate NextAuth / Clerk to establish persistent user_id connections for multi-tenant support.
- **Dockerization**: Create a unified `docker-compose.yml` configuration to orchestrate ChromaDB, FastAPI, and Next.js instantly in any environment. 
