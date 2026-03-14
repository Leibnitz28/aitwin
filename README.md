# EchoSoul: AI Personality Replicator

An intelligent, multi-agent platform designed to replicate and interact with a user's digital personality twin using advanced AI, voice cloning, and blockchain technology.

## 🌟 Advancements Till Now (Current Architecture)

The project has completely evolved from its original Node.js/MongoDB structure into a robust, modern AI application stack. 

### 🖥️ Frontend (Next.js)
- **Tech Stack**: Next.js 16 (React 19), TailwindCSS V4, Framer Motion, Three.js (@react-three/fiber).
- **Features**: 
  - Complete, responsive modern dark UI with dynamic routing.
  - Implemented core pages: Home, Create Twin, Dashboard, Chat Interface, Voice Studio, Blockchain Verifier, and Analytics.
  - Interactive onboarding flow to upload writing and voice samples.

### ⚙️ Backend (FastAPI / Python)
- **Tech Stack**: FastAPI, Uvicorn, Python 3.
- **AI Orchestration**: Built a 5-agent pipeline (`agent_orchestrator.py`) utilizing OpenAI / Gemini to extract and analyze personality traits (Big Five).
- **Voice Synthesis**: Successfully integrated **ElevenLabs** API for both voice cloning (from uploaded `.mp3`/`.wav` samples) and real-time Text-To-Speech generation.
- **Analytics Integration**: Integrated **Snowflake** via `snowflake-connector-python` to securely log chat history and pull advanced platform metrics.
- **Blockchain Identity**: Configured `web3.py` for minting Digital Twin identities onto the Ethereum Blockchain (Sepolia Testnet), assigning them unique NFTs.
- **Storage Subsystem**: Transitioned away from Google Cloud Storage to a rapid **Local File Storage** (`StorageService`), meaning audio files and TTS generations are securely saved and served directly from the backend (`/uploads` directory) without requiring cloud keys.

---

## 🚀 What Work is Remaining?

While the core functionality is active, the following segments require completion or polishing to reach a fully production-ready state:

### 1. Smart Contract & Blockchain Hardening
- **Deploy Smart Contract**: The Ethereum Contract Address is currently unassigned in the `.env` file. We need to deploy the actual Solidity ERC-721/ERC-1155 contract to Sepolia, verify it, and link the address.
- **Frontend Web3 Integration**: Ensure users can connect their Web3 wallets (e.g., MetaMask) on the frontend to natively sign transactions and view their Twin NFT.

### 2. Analytics Expansion
- **Real-Time Data Sync**: While Snowflake logs are functional, the API currently utilizes a mock fallback for detailed charts (like accuracy scores and active users). We need to write the specific advanced SQL queries in `snowflake_service.py` to populate these charts dynamically.

### 3. Authentication & Security
- **User Accounts**: Currently, `user_id` generation is largely mocked/session-based. We need to implement a true authentication system (like NextAuth, Clerk, or JWT backend issuing) to secure user twins.
- **API Rate Limiting**: Implement connection throttling on the FastAPI endpoints so that malicious users cannot drain ElevenLabs or OpenAI quotas.

### 4. System Resiliency & Error Handling
- **Graceful Degradations**: Add user-friendly UI toasts/modals to handle scenarios where an external API (like ElevenLabs or OpenAI) times out or runs out of credits.
- **Job Queues**: Transition long-running AI analysis and voice-cloning tasks to asynchronous background workers (like Celery or Redis Queue) to prevent HTTP timeouts.

### 5. Deployment & DevOps
- **Dockerization**: Create `Dockerfile`s and a `docker-compose.yml` that cleanly packages both the Next.js frontend and the FastAPI backend.
- **Production CDN**: Transition the local `StorageService` to an AWS S3/CloudFront or alternative architecture if scaling beyond a single local server is desired for production.

---

## 💻 Quick Start (Current Setup)

### 1. Frontend
```bash
cd "Twin AI"
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 2. Backend
```bash
cd "Twin AI/backend"
# Activate your virtual environment
.\venv\Scripts\activate  # Windows
# or source venv/bin/activate # Mac/Linux

pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000` (Swagger Docs at `/docs`)*
