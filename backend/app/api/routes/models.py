from fastapi import APIRouter
from app.llm.ollama import OllamaProvider
from app.llm.anthropic import AnthropicProvider
from app.llm.openai import OpenAIProvider
from app.llm.gemini import GeminiProvider
from app.core.config import settings

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("")
async def list_available_models():
    """List available local Ollama, cloud Anthropic, OpenAI, and Gemini models."""
    return {
        "providers": [
            {
                "id": "gemini",
                "name": "Google Gemini",
                "available": True,
                "default_model": settings.DEFAULT_GEMINI_MODEL,
                "models": ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
                "status_message": f"Google Gemini online with model '{settings.DEFAULT_GEMINI_MODEL}'."
            },
            {
                "id": "ollama",
                "name": "Ollama (Local)",
                "available": True,
                "default_model": settings.DEFAULT_OLLAMA_MODEL,
                "models": ["llama3"],
                "status_message": f"Ollama online with model '{settings.DEFAULT_OLLAMA_MODEL}'."
            },
            {
                "id": "anthropic",
                "name": "Anthropic Claude",
                "available": True,
                "default_model": settings.DEFAULT_ANTHROPIC_MODEL,
                "models": [settings.DEFAULT_ANTHROPIC_MODEL, "claude-3-haiku-20240307"],
                "status_message": f"Anthropic Claude online with model '{settings.DEFAULT_ANTHROPIC_MODEL}'."
            },
            {
                "id": "openai",
                "name": "OpenAI GPT-4",
                "available": True,
                "default_model": "gpt-4o-mini",
                "models": ["gpt-4o-mini", "gpt-4o"],
                "status_message": "OpenAI Cloud Provider online with model 'gpt-4o-mini'."
            }
        ]
    }

