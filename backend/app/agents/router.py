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
        
        if any(kw in lower_msg for kw in ["ship 30", "ship30", "atomic essay", "long form essay", "ship 30 essay"]):
            return "ship30"
        elif any(kw in lower_msg for kw in [
            "artifact", "html", "canvas", "calculator", "visual component", 
            "ui template", "interactive component", "1-page canvas", "one page canvas",
            "positioning canvas", "strategy canvas", "discovery matrix"
        ]):
            return "artifact"
        return "qa"

    def generate_fallback_content(self, intent: str, user_message: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Static fallback used only when ALL LLM providers are unavailable.
        Builds a response from retrieved transcript chunks rather than hardcoded content.
        """
        # Check if this is a non-product question (no relevant transcript chunks found)
        PRODUCT_KEYWORDS = [
            "product", "growth", "pricing", "strategy", "plg", "discovery",
            "feature", "roadmap", "metric", "saas", "funnel", "retention",
            "acquisition", "startup", "pm", "cagan", "verna", "doshi",
            "campbell", "lenny", "launch", "okr", "kpi", "monetization",
            "freemium", "onboarding", "churn", "conversion", "b2b", "b2c"
        ]
        query_lower = user_message.lower()
        is_product_related = any(kw in query_lower for kw in PRODUCT_KEYWORDS)

        if not retrieved_chunks or not is_product_related:
            return (
                f"I'm **The Lenny Growth Assistant** — I'm specialized in product management, "
                f"growth strategy, pricing, and startup advice grounded in Lenny's Podcast transcripts.\n\n"
                f"Your question **\"{user_message}\"** is outside my knowledge domain. "
                f"Try asking about topics like:\n"
                f"- Product-Led Growth and growth loops (Elena Verna)\n"
                f"- Empowered product teams and discovery (Marty Cagan)\n"
                f"- SaaS pricing and value metrics (Patrick Campbell)\n"
                f"- Product strategy and the LNO framework (Shreyas Doshi)"
            )

        # Build response from retrieved chunks
        sources_text = ""
        for i, chunk in enumerate(retrieved_chunks[:3], 1):
            doc_title = chunk.get("document_title", "Lenny's Podcast")
            content = chunk.get("content", "").strip()
            sources_text += f"\n\n**Source {i} — {doc_title}:**\n{content}"

        return (
            f"Based on Lenny's Podcast transcripts, here is the grounded breakdown answering your query:\n\n"
            f"---\n"
            f"{sources_text}\n\n"
            f"---\n\n"
            f"> ⚠️ *Note: AI synthesis is temporarily unavailable. The above is the raw transcript evidence "
            f"most relevant to your question. Expand the **Grounded Transcript Sources** below for full context.*"
        )

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

        # 4. If primary provider failed, auto-retry with Gemini, then static fallback
        LLM_ERROR_SIGNALS = [
            "local model unavailable",
            "api key is not configured",
            "api key is missing",
            "returned http error",
            "timed out",
            "http 429",
            "no credits remaining",
            "quota",
            "billing",
            "rate limit",
            "insufficient_quota",
            "api error",
            "request failed",
            "incorrect api key",
            "invalid_api_key",
            "authentication",
            "not configured",
        ]

        def _is_error(text: str) -> bool:
            t = text.lower()
            return any(sig in t for sig in LLM_ERROR_SIGNALS)

        if _is_error(response_text):
            # Try Gemini as the reliable fallback
            if provider_type not in ("gemini", "google"):
                logger.info(f"Provider '{provider_type}' failed. Retrying with Gemini fallback...")
                from app.llm.gemini import GeminiProvider
                fallback_llm = GeminiProvider()
                fallback_response = await fallback_llm.generate_response(
                    messages=messages_payload,
                    system_prompt=sys_prompt,
                    temperature=0.6 if intent == "qa" else 0.7
                )
                if not _is_error(fallback_response.content):
                    response_text = fallback_response.content
                    used_provider = provider_type
                    used_model = model_name or fallback_response.model
                else:
                    logger.warning("Gemini fallback also failed. Using static RAG fallback.")
                    response_text = self.generate_fallback_content(intent, user_message, retrieved_chunks)
                    used_provider = provider_type
                    used_model = model_name or "fallback"
            else:
                logger.warning("Gemini failed as primary. Using static RAG fallback.")
                response_text = self.generate_fallback_content(intent, user_message, retrieved_chunks)
                used_provider = provider_type
                used_model = model_name or "fallback"

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
            if "<!DOCTYPE html>" in response_text or "```html" in response_text or "<div" in response_text:
                response_text = f"### 🎨 Interactive HTML Artifact Generated\n\nI have generated the interactive HTML artifact based on your request. Click the **View Rendered Artifact** button below or open the Artifact Viewer panel to preview it."

        return {
            "intent": intent,
            "content": response_text,
            "sources": sources_meta,
            "provider": used_provider,
            "model": used_model,
            "artifact_id": created_artifact_id
        }

agent_router = AgentRouter()
