from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, List, Any, Optional

class LLMResponse:
    def __init__(self, content: str, model: str, provider: str, usage: Optional[Dict[str, int]] = None):
        self.content = content
        self.model = model
        self.provider = provider
        self.usage = usage or {}

class BaseLLMProvider(ABC):
    def __init__(self, model_name: str):
        self.model_name = model_name

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> LLMResponse:
        """Synchronously/async generate full response from provider."""
        pass

    @abstractmethod
    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens chunk-by-chunk."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Check status of provider connection and model availability."""
        pass
