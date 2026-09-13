from fastapi import APIRouter
from app.llm.ollama import OllamaProvider
from app.llm.anthropic import AnthropicProvider
from app.core.config import settings

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("")
async def list_available_models():
    """List available local Ollama and cloud Anthropic models."""
    ollama_health = await OllamaProvider().check_health()
    anthropic_health = await AnthropicProvider().check_health()

    return {
        "providers": [
            {
                "id": "ollama",
                "name": "Ollama (Local Inference)",
                "available": ollama_health["available"],
                "default_model": settings.DEFAULT_OLLAMA_MODEL,
                "models": ollama_health.get("installed_models", [settings.DEFAULT_OLLAMA_MODEL]),
                "status_message": ollama_health["message"]
            },
            {
                "id": "anthropic",
                "name": "Anthropic Claude (Cloud)",
                "available": anthropic_health["available"],
                "default_model": settings.DEFAULT_ANTHROPIC_MODEL,
                "models": [settings.DEFAULT_ANTHROPIC_MODEL, "claude-3-haiku-20240307"],
                "status_message": anthropic_health["message"]
            }
        ]
    }
