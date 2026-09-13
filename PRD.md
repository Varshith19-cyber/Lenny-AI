# Product Requirements Document (PRD) — The Lenny Growth Assistant

---

## 1. Executive Summary
**The Lenny Growth Assistant** is a full-stack, AI-powered conversational web application designed for product managers, growth leads, and tech leaders. The assistant provides grounded answers to complex product strategy and growth questions by leveraging transcripts from **Lenny's Podcast / Newsletter**. Beyond conversational Q&A, the assistant features dedicated agent skills for generating **Ship 30 for 30** style essays (~1,250 words) and interactive **HTML/CSS artifacts** rendered inside a sandboxed in-app viewer.

---

## 2. Forward Deployment Discovery Brief

### 2.1 User and Problem
- **Primary User**: Product Managers, VP of Product, Head of Growth, Founders, and Forward-Deployed Engineers.
- **User Job-To-Be-Done**: Quickly access proven, battle-tested product management frameworks, PLG strategies, pricing models, and team execution playbooks from top industry leaders (Shreyas Doshi, Elena Verna, Marty Cagan, Patrick Campbell) without spending hours manually reading or searching through hundreds of podcast transcripts.
- **Pain Point Removed**: Eliminates generic, ungrounded AI hallucinations and vague advice by providing verbatim transcript citations, episode references, match scores, and instantly reusable written frameworks.

### 2.2 Success Metrics
- **Grounded Answer Precision Rate**: > 95% of answers directly cite supporting transcript chunks.
- **Source Attribution Rate**: 100% of grounded answers display structured citation cards (title, episode ID, excerpt, URL).
- **Artifact Render Success Rate**: 100% of requested HTML/Markdown artifacts render safely without DOM injection errors.
- **System Latency**: < 2.5 seconds median response time on cloud provider; smooth streaming on local Ollama models.

### 2.3 Key Assumptions
- Transcripts are formatted as plain text or JSON with metadata (episode ID, title, URL, speaker).
- Evaluators will run the application locally using Docker Compose or python/node dev servers, with optional local Ollama or cloud Anthropic Claude API credentials.
- Local machines have at least 8GB RAM to run lightweight Ollama models (e.g. `llama3` or `mistral`).

### 2.4 Scope Decisions
- **IN SCOPE**:
  - Grounded RAG Q&A over Lenny's Podcast transcripts.
  - Multi-session chat persistence in PostgreSQL / SQLite.
  - Dual LLM provider toggle (Ollama local & Anthropic Claude cloud).
  - Ship 30 for 30 content generation skill (~1,250 word skimmable essays).
  - In-app split-pane Artifact Viewer for Markdown & sandboxed HTML/CSS snippets.
  - Bleach HTML security sanitizer and `<iframe>` sandboxing.
  - Automated pytest test suite + manual UI test checklist.
- **OUT OF SCOPE (Intentionally Omitted)**:
  - User authentication / multi-tenancy RBAC (avoids unnecessary enterprise friction for evaluators).
  - Stripe payments / subscription billing.
  - Voice input/output.

### 2.5 Major Risks & Mitigations
| Risk | Severity | Mitigation Strategy |
|---|---|---|
| **AI Hallucination** | High | Strict system prompt grounding rules forcing explicit refusal ("I couldn't find enough relevant evidence...") when context is insufficient. |
| **Untrusted HTML XSS Attacks** | High | Bleach HTML backend sanitization stripping `<script>`, `onload`, and `javascript:` URIs + sandboxed `<iframe>` (`sandbox="allow-scripts"`). |
| **Ollama Local Unavailable** | Medium | Graceful health check detection returning clear, user-friendly error banners without raw stack traces. |
| **Database Connection Failure** | Medium | SQLAlchemy connection pooling + automatic fallback schema generation. |

---

## 3. Functional Requirements

### FR-1: Grounded Conversational RAG
- The system must answer product/growth questions using vector embeddings generated from Lenny's Podcast transcripts.
- Every answer must cite matching transcripts with episode title, URL, score, and verbatim excerpt.

### FR-2: Flexible Provider Switching
- Users can switch between local Ollama inference and cloud Anthropic Claude via header UI toggles.
- The active model and provider status must be visible at all times.

### FR-3: Ship 30 for 30 Skill
- Dedicated agent skill encoding digital writing principles (1-sentence hook, skimmable bolding, bullet points, grounded credit to guests, ~1,250 words).

### FR-4: Sandboxed Artifact Viewer
- When requested, the assistant generates Markdown or complete HTML/CSS artifacts.
- The UI presents a split-pane viewer rendering artifacts beside the chat in an isolated environment.

---

## 4. Non-Functional Requirements
- **Security**: Zero committed secrets, environment-variable configuration, strict input sanitization.
- **Observability**: Structured JSON logging capturing request ID, model, latency, retrieval count, and error context.
- **Resilience**: Gracefully handle missing API keys, model timeouts, and empty search results.
