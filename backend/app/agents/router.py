import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.retrieval.search import retriever
from app.llm.factory import get_llm_provider
from app.artifacts.sanitizer import sanitizer
from app.db.models import ArtifactModel, MessageModel
from app.core.logging import logger

SYSTEM_GROUNDING_PROMPT = """You are The Lenny Growth Assistant, a expert product & growth advisor built for product managers, founders, and growth teams.

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

WRITING RULES:
1. Strong Hook: Start with a powerful 1-sentence opening that challenges standard wisdom.
2. Clear Narrative Structure: Problem -> Core Insight -> Step-by-Step Playbook -> Strategic Takeaway.
3. Skimmable Micro-Formatting: Short paragraphs, clear headers (##, ###), bullet points, and **selective bolding** on pivotal terms.
4. Grounded Claims: Explicitly credit the guest (e.g., Shreyas Doshi, Elena Verna, Marty Cagan) and ground every claim in transcript evidence.
5. Useful Takeaway: End with a specific, actionable rule for product leaders.
"""

ARTIFACT_SYSTEM_PROMPT = """You are the Artifact Generator for The Lenny Growth Assistant.
The user wants a clean, standalone Markdown or HTML/CSS artifact (such as a 1-Page Product Strategy Canvas, PLG Growth Loop Checklist, or Metrics Framework).

RULES FOR HTML ARTIFACTS:
1. Output complete, beautiful, modern HTML with inline CSS styling inside a `<style>` block.
2. Use clean typography, modern dark or clean light theme palettes, CSS grid/flexbox, and rounded cards.
3. Keep the HTML self-contained and ready to render in an isolated browser preview.
4. Ground the content in the retrieved transcript context.
5. Do NOT include raw markdown backticks like ```html around the final artifact if returning just the HTML, OR wrap it clearly so the system can parse it.
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
        
        # Combine conversation history (last 6 messages for context efficiency)
        messages_payload = history[-6:] if history else []
        messages_payload.append({"role": "user", "content": user_message})

        # 3. Call LLM
        llm_response = await llm.generate_response(
            messages=messages_payload,
            system_prompt=sys_prompt,
            temperature=0.6 if intent == "qa" else 0.7
        )

        response_text = llm_response.content
        created_artifact_id = None

        # 4. Handle Artifact Parsing & Security Sanitization if intent == 'artifact' or HTML detected
        if intent == "artifact" or "```html" in response_text or "<!DOCTYPE html>" in response_text or "<div" in response_text and "class=" in response_text:
            # Extract HTML chunk
            html_content = response_text
            if "```html" in response_text:
                parts = response_text.split("```html")
                if len(parts) > 1:
                    html_content = parts[1].split("```")[0].strip()
            elif "```" in response_text:
                parts = response_text.split("```")
                if len(parts) > 1:
                    html_content = parts[1].strip()

            # Sanitize HTML
            clean_html = sanitizer.sanitize(html_content)

            # Store artifact in DB
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
            "provider": llm_response.provider,
            "model": llm_response.model,
            "artifact_id": created_artifact_id
        }

agent_router = AgentRouter()
