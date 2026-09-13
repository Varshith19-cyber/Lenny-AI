from typing import Optional
from app.llm.base import BaseLLMProvider
from app.llm.ollama import OllamaProvider
from app.llm.anthropic import AnthropicProvider
from app.core.config import settings

def get_llm_provider(provider_type: str = "ollama", model_name: Optional[str] = None) -> BaseLLMProvider:
    """Factory function returning configured LLMProvider instance."""
    provider_clean = (provider_type or "ollama").lower()
    
    if provider_clean == "anthropic" or provider_clean == "claude":
        selected_model = model_name or settings.DEFAULT_ANTHROPIC_MODEL
        return AnthropicProvider(model_name=selected_model)
    else:
        selected_model = model_name or settings.DEFAULT_OLLAMA_MODEL
        return OllamaProvider(model_name=selected_model)
