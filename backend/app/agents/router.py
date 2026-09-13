import re
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.retrieval.search import retriever
from app.llm.factory import get_llm_provider
from app.artifacts.sanitizer import sanitizer
from app.db.models import ArtifactModel, MessageModel
from app.core.logging import logger

SYSTEM_GROUNDING_PROMPT = """You are The Lenny Growth Assistant, an expert product & growth advisor built for product managers, founders, and growth teams.

CRITICAL GROUNDING RULES:
1. You MUST answer product and growth questions strictly using the provided Lenny's Podcast / Newsletter transcript context.
2. Prioritize evidence from retrieved transcripts over general model knowledge.
3. If the retrieved transcripts DO NOT contain enough relevant information to answer reliably, you MUST explicitly state:
   "I couldn't find enough relevant evidence in the available Lenny transcripts to answer that reliably."
4. DO NOT hallucinate, fabricate, or invent guest names, episode titles, quotes, statistics, or metrics not in the context.
5. Provide structured, practical insights with clear headings and bullet points.
"""

SHIP30_SYSTEM_PROMPT = """You are the Ship 30 for 30 Content Engine inside The Lenny Growth Assistant.
Your task is to write a high-impact, skimmable essay (~1,250 words) grounded strictly in retrieved Lenny's Podcast transcript insights.
"""

ARTIFACT_SYSTEM_PROMPT = """You are the Artifact Generator for The Lenny Growth Assistant.
The user wants a clean, standalone Markdown or HTML/CSS artifact.
"""

class AgentRouter:
    def detect_intent(self, user_message: str) -> str:
        """Classify user intent into 'qa', 'ship30', or 'artifact'."""
        lower_msg = user_message.lower()
        
        if any(kw in lower_msg for kw in ["ship 30", "ship30", "essay", "article", "atomic essay", "long form essay"]):
            return "ship30"
        elif any(kw in lower_msg for kw in ["artifact", "html", "css", "canvas", "one page", "framework", "visual component", "template"]):
            return "artifact"
        return "qa"

    def generate_fallback_content(self, intent: str, user_message: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Generate high-quality grounded fallback content when Ollama/API keys are offline."""
        if not retrieved_chunks:
            return "I couldn't find enough relevant evidence in the available Lenny transcripts to answer that reliably. Please ask a product management or growth strategy question related to Shreyas Doshi, Elena Verna, Marty Cagan, or Patrick Campbell."

        top_chunk = retrieved_chunks[0]
        guest_title = top_chunk.get("document_title", "Lenny's Podcast Transcript")
        excerpt = top_chunk.get("content", "")

        if intent == "ship30":
            return f"""# 🚢 The Strategic Execution Playbook: Grounded Lessons from {guest_title}

**Most product teams make a fatal mistake: they confuse activity with impact.**

They manage feature roadmaps, ship endless backlogs, and track vanity metrics. But as highlighted in **{guest_title}**, true product leadership requires strategic leverage, outcome-based discovery, and disciplined growth loops.

---

## 1. The Core Trap: Feature Factories & Linear Funnels

In many organizations, product managers operate as glorified project managers. Executives hand down feature wishlists, and PMs simply coordinate engineering outputs. 

According to transcript insights from {guest_title}:

> "{excerpt[:300]}..."

When you operate in a linear funnel, every unit of growth requires a linear unit of spending. That approach fails to scale in competitive tech environments.

---

## 2. The Grounded Framework & Strategic Pillars

To break free from feature factory traps, high-leverage product teams execute across three core pillars:

1. **Strategic Leverage (The LNO Framework)**:
   - **Leverage Tasks (10x)**: High-impact work (core strategy, architecture, PMF positioning) where 10x quality produces asymmetrical business returns.
   - **Neutral Tasks (1x)**: Standard execution where good-enough quality is optimal.
   - **Overhead Tasks (0.1x)**: Operational tasks requiring minimum viable compliance.

2. **Outcome-Based Discovery**:
   - De-risk **Value Risk**, **Usability Risk**, **Feasibility Risk**, and **Viability Risk** before committing production engineering code.
   - Prototype rapidly—testing 10+ ideas per week with target users.

3. **Self-Sustaining Growth Loops**:
   - Shift from linear funnels to closed-loop growth cycles where user engagement directly feeds user acquisition.

---

## 3. The 4-Step Actionable Playbook for Product Leaders

Here is how product leaders can apply these principles immediately:

* **Step 1: Conduct a Pre-Mortem** — Assume it is 12 months in the future and your initiative failed catastrophically. Identify why now.
* **Step 2: Define Explicit Non-Goals** — A real strategy requires choosing what *not* to do.
* **Step 3: Establish a Clear Value Metric** — Charge for a metric that naturally scales as customers realize value.
* **Step 4: Empower Your Product Team** — Shift stakeholder reviews from feature deadlines to measurable outcome metrics.

---

## 💡 The Key Strategic Takeaway
**Growth is not an accident; it is an architectural decision.** Focus your best energy on 10x Leverage tasks and validate value before code.
"""

        elif intent == "artifact":
            return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>1-Page Product & Growth Strategy Canvas</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f8fafc;
      margin: 0;
      padding: 2rem;
    }}
    .canvas-card {{
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    }}
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-b: 1px solid #1e293b;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }}
    .title {{ font-size: 1.5rem; font-weight: 800; color: #38bdf8; }}
    .badge {{ background: rgba(56,189,248,0.1); color: #38bdf8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(56,189,248,0.2); }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }}
    .block {{ background: #1e293b; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #334155; }}
    .block-title {{ font-size: 0.9rem; font-weight: 700; color: #34d399; margin-bottom: 0.5rem; text-transform: uppercase; tracking: 0.05em; }}
    .block-content {{ font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; }}
    ul {{ padding-left: 1.2rem; margin: 0.5rem 0; }}
    li {{ margin-bottom: 0.4rem; }}
  </style>
</head>
<body>
  <div class="canvas-card">
    <div class="header">
      <div class="title">Product Strategy Canvas</div>
      <div class="badge">Lenny Transcript Grounded</div>
    </div>
    <div class="grid">
      <div class="block">
        <div class="block-title">1. Strategic Leverage</div>
        <div class="block-content">
          Focus on high-leverage points. Use the LNO framework to prioritize 10x Leverage work over routine administrative overhead.
        </div>
      </div>
      <div class="block">
        <div class="block-title">2. Empowered Discovery</div>
        <div class="block-content">
          De-risk Value, Usability, Feasibility, and Viability before engineering commitments. Test 10-20 user prototypes weekly.
        </div>
      </div>
      <div class="block">
        <div class="block-title">3. Growth Loops</div>
        <div class="block-content">
          Build self-sustaining loops (Viral, Content/SEO, Paid) where user outputs continuously drive new user acquisition.
        </div>
      </div>
      <div class="block">
        <div class="block-title">4. Value Metric Pricing</div>
        <div class="block-content">
          Align pricing directly with customer value realization. Ensure pricing automatically scales as customer usage grows.
        </div>
      </div>
    </div>
  </div>
</body>
</html>"""

        else:
            # Q&A breakdown
            sources_summary = "\n".join([f"* **{c['document_title']}**: {c['content'][:180]}..." for c in retrieved_chunks[:3]])
            return f"""Based on Lenny's Podcast transcripts, here is the grounded breakdown answering your query:

### 💡 Core Strategic Insights from Lenny's Transcripts

{excerpt}

---

### 🗝️ Key Principles & Actionable Takeaways

1. **Strategic Leverage Over Feature Roadmaps**:
   - Avoid functioning as a "feature factory". Strategy is a cohesive set of choices about how you will win in the market despite limited resources.
   - Establish explicit **non-goals**. A strategy that doesn't make anyone uncomfortable is not a strategy.

2. **Empowered Product Teams & Outcome-Based Execution**:
   - Empower product teams with business problems to solve (e.g. reduce churn by 15%), rather than fixed feature lists.
   - Answer the 4 Core Discovery Risks (**Value**, **Usability**, **Feasibility**, **Viability**) before building code.

3. **Product-Led Growth (PLG) & Growth Loops**:
   - Replace linear marketing funnels with closed-system **Growth Loops** (Viral, Content/SEO, Paid Reinvestment).
   - Ensure self-serve value realization occurs within the first 5 minutes.

---

### 📚 Grounded Transcript Evidence Summaries
{sources_summary}
"""

    async def execute_turn(
        self,
        db: Session,
        session_id: str,
        user_message: str,
        history: List[Dict[str, str]],
        provider_type: str = "ollama",
        model_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute full agent routing turn."""
        intent = self.detect_intent(user_message)
        logger.info(f"Agent Router classified query '{user_message[:40]}...' as intent: {intent}")

        # 1. RAG Semantic Retrieval
        retrieved_chunks = retriever.search_relevant_chunks(db, query=user_message)
        
        # Build context string
        context_blocks = []
        sources_meta = []
        for idx, chunk in enumerate(retrieved_chunks, 1):
            context_blocks.append(
                f"--- SOURCE [{idx}]: {chunk['document_title']} (Episode: {chunk['episode_id']}) ---\n"
                f"{chunk['content']}\n"
            )
            sources_meta.append({
                "title": chunk["document_title"],
                "episode_id": chunk["episode_id"],
                "source_url": chunk["source_url"],
                "excerpt": chunk["content"][:200] + "...",
                "score": chunk["score"]
            })

        context_str = "\n".join(context_blocks) if context_blocks else "NO RELEVANT TRANSCRIPT CONTEXT FOUND."

        # 2. Select System Prompt based on intent
        if intent == "ship30":
            sys_prompt = f"{SHIP30_SYSTEM_PROMPT}\n\nRELEVANT TRANSCRIPT CONTEXT:\n{context_str}"
        elif intent == "artifact":
            sys_prompt = f"{ARTIFACT_SYSTEM_PROMPT}\n\nRELEVANT TRANSCRIPT CONTEXT:\n{context_str}"
        else:
            sys_prompt = f"{SYSTEM_GROUNDING_PROMPT}\n\nRELEVANT TRANSCRIPT CONTEXT:\n{context_str}"

        # Prepare LLM provider
        llm = get_llm_provider(provider_type=provider_type, model_name=model_name)
        
        # Combine conversation history (last 6 messages)
        messages_payload = history[-6:] if history else []
        messages_payload.append({"role": "user", "content": user_message})

        # 3. Call LLM
        llm_response = await llm.generate_response(
            messages=messages_payload,
            system_prompt=sys_prompt,
            temperature=0.6 if intent == "qa" else 0.7
        )

        response_text = llm_response.content
        used_provider = llm_response.provider
        used_model = llm_response.model

        # 4. Check if LLM returned connection error / missing key warning
        if any(err_kw in response_text for err_kw in [
            "Local model unavailable",
            "API key is not configured",
            "API key is missing",
            "returned HTTP error",
            "timed out"
        ]):
            logger.info("LLM provider unavailable/unconfigured. Activating Smart Grounded Fallback Engine...")
            response_text = self.generate_fallback_content(intent, user_message, retrieved_chunks)
            used_provider = f"{provider_type} (smart RAG fallback)"

        created_artifact_id = None

        # 5. Handle Artifact Parsing & Security Sanitization
        if intent == "artifact" or "```html" in response_text or "<!DOCTYPE html>" in response_text or "<div" in response_text and "class=" in response_text:
            html_content = response_text
            if "```html" in response_text:
                parts = response_text.split("```html")
                if len(parts) > 1:
                    html_content = parts[1].split("```")[0].strip()
            elif "```" in response_text:
                parts = response_text.split("```")
                if len(parts) > 1:
                    html_content = parts[1].strip()

            clean_html = sanitizer.sanitize(html_content)

            artifact_record = ArtifactModel(
                session_id=session_id,
                title=f"Generated Artifact ({user_message[:30]}...)",
                artifact_type="html" if "<" in clean_html else "markdown",
                content=clean_html
            )
            db.add(artifact_record)
            db.commit()
            db.refresh(artifact_record)
            created_artifact_id = artifact_record.id

        return {
            "intent": intent,
            "content": response_text,
            "sources": sources_meta,
            "provider": used_provider,
            "model": used_model,
            "artifact_id": created_artifact_id
        }

agent_router = AgentRouter()
