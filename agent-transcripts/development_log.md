# Coding Agent Transcripts & Iteration Log (`agent-transcripts/development_log.md`)

---

## 1. Executive Summary
This directory captures the transparent step-by-step engineering trajectory, iteration history, debugging cycles, and architectural choices made by the coding agent while implementing **The Lenny Growth Assistant**.

---

## 2. Iteration Timeline & Decision Record

### Iteration 1: Discovery & Requirements Audit Matrix
- **Action**: Analyzed the official assignment document (`Forward_Deployed_Engineer_Take_Home_Assignment.docx`) and extracted all mandatory and optional requirements.
- **Key Decision**: Established a 14-point audit matrix covering Grounded RAG, Session Persistence, LLM Provider Abstraction (Ollama + Anthropic), Agent Routing, Ship 30 Skill, HTML Sanitization, Sandboxed Viewer, and Docker Deployment.
- **Artifact Created**: `implementation_plan.md`.

### Iteration 2: Database Schema & Vector Embedding Architecture
- **Action**: Designed database schemas in SQLAlchemy supporting PostgreSQL (`pgvector`) with SQLite fallback for zero-dependency test runner execution.
- **Key Decision**: Built a local 384-dimensional dense vector embedding engine using subword char-ngram hashing and term frequency L2 normalization. This allows 100% offline local vector similarity scoring without external API costs or model download overhead.

### Iteration 3: Modular LLM Abstraction & Agent Router
- **Action**: Created abstract base provider `BaseLLMProvider` with implementations `OllamaProvider` and `AnthropicProvider`.
- **Key Decision**: Built robust health detection logic in `OllamaProvider` to detect connection failures and missing local models, returning clear user-friendly instructions (`"Local model unavailable. Please start Ollama..."`) rather than exposing raw stack traces.

### Iteration 4: Ship 30 for 30 Skill & HTML Artifact Sanitization
- **Action**: Built `skills/ship30/skill.md` encoding digital writing principles (~1,250 words, hook, narrative structure, bullet formatting, grounded transcript claims).
- **Security Decision**: Created `HTMLSanitizer` using `Bleach` to strip unsafe `<script>` tags, inline `on*` event handlers, and `javascript:` URIs. Rendered HTML inside `SandboxedFrame` with `sandbox="allow-scripts"`.

### Iteration 5: Automated Testing & Debugging Cycle
- **Issue**: Pytest failed initial collection with `SyntaxError` in `backend/app/ingestion/loader.py` (extra parenthesis in method signature) and `OperationalError` (missing database table initialization in test runner).
- **Fix**: Corrected signature syntax error in `loader.py` and created `backend/conftest.py` with an auto-use session fixture that calls `init_db()` automatically before test execution.
- **Result**: All 5 backend unit tests passed (`test_health`, `test_sessions`, `test_embedding_generation`, `test_cosine_similarity`, `test_html_sanitizer_xss_protection`).

---

## 3. Security Audit & Confidentiality Verification
- **Verified**: Zero API keys or secrets committed to repository.
- **Verified**: `.env` added to `.gitignore`, safe placeholders in `.env.example`.
- **Verified**: XSS payloads neutralized by Bleach sanitizer and `<iframe>` sandboxing.
