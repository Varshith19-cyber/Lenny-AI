from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.llm.ollama import OllamaProvider
from app.llm.anthropic import AnthropicProvider
from app.llm.openai import OpenAIProvider

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint checking Database, Ollama, Anthropic, and OpenAI providers."""
    # Check DB
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # Check Ollama
    ollama_provider = OllamaProvider()
    ollama_health = await ollama_provider.check_health()

    # Check Anthropic
    anthropic_provider = AnthropicProvider()
    anthropic_health = await anthropic_provider.check_health()

    # Check OpenAI
    openai_provider = OpenAIProvider()
    openai_health = await openai_provider.check_health()

    overall_status = "ok" if db_status == "healthy" else "degraded"

    return {
        "status": overall_status,
        "database": db_status,
        "ollama": ollama_health,
        "anthropic": anthropic_health,
        "openai": openai_health
    }

