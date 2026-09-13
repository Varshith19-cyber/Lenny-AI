# Demo Video Outline & Presentation Script (`docs/demo_video_script.md`)

---

## 📹 Video Requirements Checklist
- **Duration**: 2–3 minutes.
- **Presenter**: Camera enabled (facecam in corner or intro).
- **Core Topics**:
  1. Problem statement & product overview.
  2. Live product walkthrough (Chat, Grounded Sources, Ship 30 Essay, Sandboxed HTML Artifact).
  3. Local Ollama demonstration.
  4. One key technical trade-off explanation.
- **Upload Target**: YouTube (Unlisted or Public).

---

## 🎬 3-Minute Presentation Script

### Section 1: Intro & Problem Statement (0:00 - 0:40)
- *"Hi everyone, I'm [Your Name], presenting **The Lenny Growth Assistant**—a full-stack AI-powered internal product for product managers and growth leaders."*
- *"Product teams often spend hours digging through podcast transcripts for strategic frameworks. Generic AI assistants often hallucinate ungrounded advice. The Lenny Growth Assistant solves this by grounding every answer directly in Lenny's Podcast transcripts with verbatim source citations, generating Ship 30 essays, and rendering HTML artifacts natively inside the app."*

### Section 2: Live Product Walkthrough & Grounded RAG (0:40 - 1:30)
- *"Let's see it in action. Here is our dark-mode Next.js 14 frontend backed by FastAPI and PostgreSQL with pgvector embeddings."*
- *"I'll ask a strategy question: 'What are Shreyas Doshi's main rules for product strategy and the LNO framework?'"*
- *"Notice how the assistant immediately streams a grounded response. Expanding the 'Grounded Transcript Sources' drawer reveals exact verbatim transcript excerpts, match scores, and direct links to the episode."*

### Section 3: Ship 30 Essay & Sandboxed Artifact Viewer (1:30 - 2:15)
- *"Now let's request a Ship 30 for 30 essay: 'Write a Ship 30 essay on product discovery based on Marty Cagan's advice.'"*
- *"The assistant dispatches our dedicated Ship 30 skill, generating a ~1,250-word skimmable essay with a strong 1-sentence hook, narrative structure, bullet points, and selective bolding."*
- *"Next, let's request an artifact: 'Create a 1-page HTML product strategy canvas.' The assistant generates the HTML code, and our in-app Artifact Viewer opens automatically on the right panel, rendering the canvas inside a sandboxed `<iframe>` with Bleach XSS protection."*

### Section 4: Local Ollama Demo & Key Technical Trade-off (2:15 - 3:00)
- *"We can toggle between cloud Anthropic Claude and local Ollama inference using the header selector. Here, Ollama is running `llama3` locally on my machine, giving product teams complete data privacy and offline capability."*
- *"To conclude, one key technical trade-off we made was choosing a local dense subword hashing vector embedder over heavy third-party embedding models. This ensures 100% offline reproducibility and zero API dependency while maintaining fast cosine vector search."*
- *"Thank you!"*
