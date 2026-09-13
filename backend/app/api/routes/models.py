from fastapi import APIRouter
from app.llm.ollama import OllamaProvider
from app.llm.anthropic import AnthropicProvider
from app.llm.openai import OpenAIProvider
from app.core.config import settings

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("")
async def list_available_models():
    """List available local Ollama, cloud Anthropic, and cloud OpenAI models."""
    ollama_health = await OllamaProvider().check_health()
    anthropic_health = await AnthropicProvider().check_health()
    openai_health = await OpenAIProvider().check_health()

    return {
        "providers": [
            {
                "id": "ollama",
                "name": "Ollama (Local)",
                "available": ollama_health["available"],
                "default_model": settings.DEFAULT_OLLAMA_MODEL,
                "models": ollama_health.get("installed_models", [settings.DEFAULT_OLLAMA_MODEL]),
                "status_message": ollama_health["message"]
            },
            {
                "id": "anthropic",
                "name": "Anthropic Claude",
                "available": anthropic_health["available"],
                "default_model": settings.DEFAULT_ANTHROPIC_MODEL,
                "models": [settings.DEFAULT_ANTHROPIC_MODEL, "claude-3-haiku-20240307"],
                "status_message": anthropic_health["message"]
            },
            {
                "id": "openai",
                "name": "OpenAI GPT-4",
                "available": openai_health["available"],
                "default_model": "gpt-4o-mini",
                "models": ["gpt-4o-mini", "gpt-4o"],
                "status_message": openai_health["message"]
            }
        ]
    }
