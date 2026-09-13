# The Lenny Growth Assistant 🚀

A production-grade, full-stack AI-powered conversational web application for product and growth teams grounded in **Lenny's Podcast / Newsletter** transcripts.

---

## 🌟 Key Features

1. **Grounded Conversational RAG**: Semantic vector search over Lenny's Podcast transcripts with structured citation cards (episode title, URL, verbatim excerpt, match score).
2. **Flexible Dual LLM Provider (Ollama + Cloud)**: Seamlessly switch between local Ollama models (`llama3`, `mistral`) and cloud Anthropic Claude (`claude-3-5-sonnet`) without code changes.
3. **Ship 30 for 30 Essay Skill**: Dedicated skill generating ~1,250-word skimmable essays (hook, narrative structure, bullet points, selective bolding, grounded takeaways).
4. **Sandboxed In-App Artifact Viewer**: Split-pane UI rendering Markdown and complete HTML/CSS artifacts inside an isolated `<iframe>` with Bleach XSS sanitization.
5. **Multi-Session Chat Persistence**: Save, load, and manage independent chat sessions powered by PostgreSQL / SQLite.
6. **One-Command Docker Setup**: Full `docker-compose.yml` orchestrating PostgreSQL (pgvector), FastAPI backend, and Next.js frontend.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons, React Markdown.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, Bleach HTML Sanitizer.
- **Database**: PostgreSQL with `pgvector` (or fallback SQLite for zero-dependency local testing).
- **LLM Engine**: Ollama (Local) & Anthropic Claude API (Cloud).
- **Testing**: Pytest automated test suite.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (`npm -v`)
- **Python**: v3.10+ (`python --version`)
- **Docker** (Optional for containerized run): `docker --version`
- **Ollama** (Mandatory for local model demo): [Download Ollama](https://ollama.ai)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration in `.env`:
```env
DATABASE_URL="sqlite:///./lenny_growth.db"
OLLAMA_BASE_URL="http://localhost:11434"
DEFAULT_OLLAMA_MODEL="llama3"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

---

### 3. Backend Setup & Run

1. Navigate to backend and create virtual environment:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run FastAPI backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
> The server will start on `http://localhost:8000`. Startup automatically loads and indexes seed transcripts from `data/transcripts/`!

---

### 4. Frontend Setup & Run

1. Open a new terminal and navigate to `frontend`:
```bash
cd frontend
npm install
```

2. Run Next.js development server:
```bash
npm run dev
```
> Access the web application at `http://localhost:3000`.

---

## 🦙 Ollama Local Setup (Mandatory Demo Requirement)

To run local inference using Ollama:
1. Start Ollama service on your machine:
```bash
ollama serve
```
2. Pull the recommended lightweight local model:
```bash
ollama pull llama3
```
3. In the application header, select **Ollama (Local)**. The status indicator will turn green!

---

## 🐳 Docker Compose (One-Command Deployment)

To run the full stack (PostgreSQL + pgvector + FastAPI + Next.js):
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

---

## 🧪 Automated Testing

Run the comprehensive Pytest suite:
```bash
cd backend
python -m pytest tests -p no:cacheprovider
```

---

## 📂 Project Structure

```
lenny-growth-assistant/
│
├── backend/
│   ├── app/
│   │   ├── api/routes/      # Health, Chat, Sessions, Models, Artifacts, Ingestion
│   │   ├── core/            # Config, Logging, Security
│   │   ├── db/              # Database models, pgvector setup
│   │   ├── llm/             # Base, Ollama, Anthropic providers & factory
│   │   ├── retrieval/       # Embeddings, Chunker, Vector Search
│   │   ├── ingestion/       # Transcript loader & pipeline
│   │   ├── agents/          # Agent Router & Ship 30 tool
│   │   └── artifacts/       # Bleach HTML Sanitizer
│   ├── tests/               # Pytest test suite
│   └── requirements.txt
│
├── frontend/
│   ├── app/                 # Next.js 14 App router
│   ├── components/          # AppShell, Sidebar, ChatHeader, MessageList, ArtifactViewer, SandboxedFrame
│   ├── lib/                 # API client
│   └── types/               # TypeScript definitions
│
├── data/
│   └── transcripts/         # Lenny's Podcast transcript dataset
│
├── skills/
│   └── ship30/              # Ship 30 for 30 skill principles
│
├── agent-transcripts/       # Coding agent development log
├── docs/                    # Manual UI test plan
├── PRD.md                   # Product Requirements Document
├── design.md                # UI/UX Design System
├── architecture.md          # Architecture Specification
├── docker-compose.yml
└── README.md
```
