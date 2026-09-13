# Architecture Specification (`architecture.md`) — The Lenny Growth Assistant

---

## 1. System Topology & Architecture Overview

```mermaid
graph TD
    User([Browser Client]) --> NextFS[Next.js 14 Frontend UI]
    NextFS -->|REST / SSE API| FastAPI[FastAPI Backend - Port 8000]
    
    subgraph FastAPI Application Layer
        FastAPI --> SessionMgr[Session & Context Manager]
        SessionMgr --> Router[Modular Agent Router]
        
        Router -->|Intent: QA| RAGTool[RAG Retriever Engine]
        Router -->|Intent: Ship 30| Ship30Skill[Ship 30 Content Skill]
        Router -->|Intent: Artifact| ArtifactTool[Artifact Generator]
        
        RAGTool --> Embedder[384d Local Embedder]
        Embedder --> DB[(PostgreSQL + pgvector / SQLite)]
        
        Router --> LLMFactory[LLM Provider Factory]
        LLMFactory -->|Local| Ollama[Ollama Server - http://localhost:11434]
        LLMFactory -->|Cloud| Anthropic[Anthropic Claude API]
        
        ArtifactTool --> Sanitizer[Bleach HTML Sanitizer]
    end
    
    Sanitizer --> ArtifactViewer[Sandboxed Artifact Viewer]
```

---

## 2. Database Schema (PostgreSQL + pgvector)

### Logical Tables & Entity Relationships

```mermaid
erDiagram
    SESSIONS ||--o{ MESSAGES : contains
    SESSIONS ||--o{ ARTIFACTS : generates
    DOCUMENTS ||--o{ CHUNKS : splits_into
    MESSAGES ||--o{ ARTIFACTS : references

    SESSIONS {
        string id PK
        string title
        datetime created_at
        datetime updated_at
        json meta_info
    }

    MESSAGES {
        string id PK
        string session_id FK
        string role
        text content
        json sources_json
        datetime created_at
    }

    DOCUMENTS {
        string id PK
        string title
        string episode_id
        string source_url
        datetime created_at
    }

    CHUNKS {
        string id PK
        string document_id FK
        integer chunk_index
        text content
        json_vector embedding_json
        datetime created_at
    }

    ARTIFACTS {
        string id PK
        string session_id FK
        string message_id FK
        string title
        string artifact_type
        text content
        datetime created_at
    }
```

---

## 3. API Contract Specifications

### Health Check
- `GET /api/v1/health`
- **Response**: `{ "status": "ok", "database": "healthy", "ollama": { "available": true }, "anthropic": { "available": true } }`

### Sessions API
- `POST /api/v1/sessions` — Create session.
- `GET /api/v1/sessions` — List sessions.
- `GET /api/v1/sessions/{id}` — Get session.
- `GET /api/v1/sessions/{id}/messages` — Get session messages.

### Conversational Chat API
- `POST /api/v1/chat`
- **Request**: `{ "session_id": "...", "message": "What is PLG?", "provider": "ollama"|"anthropic" }`
- **Response**: `{ "session_id": "...", "content": "...", "sources": [...], "provider": "ollama", "artifact_id": "..." }`

### Artifacts API
- `GET /api/v1/artifacts/{id}` — Get single artifact.
- `GET /api/v1/artifacts/session/{session_id}` — List artifacts in session.

---

## 4. Security Architecture

1. **HTML Security & DOM Sanitization**:
   - Backend HTML sanitizer using `Bleach` strips `<script>`, inline event handlers (`onload`, `onclick`), `javascript:` URIs, and dangerous elements.
   - Frontend renders HTML inside an isolated `<iframe>` with `sandbox="allow-scripts"` to prevent parent DOM manipulation or cookie theft.
2. **Environment Secret Protection**:
   - All credentials loaded via `pydantic-settings` from `.env`.
   - `.env` excluded in `.gitignore`. `.env.example` provided with safe placeholder defaults.
3. **CORS Security**:
   - Configured with explicitly permitted origins for Next.js frontend.
