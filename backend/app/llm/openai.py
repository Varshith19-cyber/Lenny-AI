import os
import httpx
from typing import AsyncGenerator, Dict, List, Any, Optional
from app.llm.base import BaseLLMProvider, LLMResponse
from app.core.config import settings
from app.core.logging import logger

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, model_name: Optional[str] = None, api_key: Optional[str] = None):
        super().__init__(model_name or "gpt-4o-mini")
        self.api_key = api_key or settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")

    async def check_health(self) -> Dict[str, Any]:
        """Check if OpenAI API key is configured."""
        if not self.api_key or self.api_key.startswith("sk-placeholder"):
            return {
                "available": False,
                "message": "OpenAI API key is missing or set to placeholder in .env file."
            }
        return {
            "available": True,
            "message": f"OpenAI Cloud Provider configured with model '{self.model_name}'."
        }

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> LLMResponse:
        if not self.api_key or self.api_key.startswith("sk-placeholder"):
            return LLMResponse(
                content="OpenAI API key is not configured. Please supply OPENAI_API_KEY in .env file or switch to Ollama local model.",
                model=self.model_name,
                provider="openai"
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        openai_msgs = []
        if system_prompt:
            openai_msgs.append({"role": "system", "content": system_prompt})
        for m in messages:
            openai_msgs.append({"role": m["role"], "content": m["content"]})

        payload = {
            "model": self.model_name,
            "messages": openai_msgs,
            "temperature": temperature
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    usage = data.get("usage", {})
                    return LLMResponse(content=content, model=self.model_name, provider="openai", usage=usage)
                else:
                    return LLMResponse(content=f"OpenAI API Error (HTTP {res.status_code}): {res.text}", model=self.model_name, provider="openai")
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return LLMResponse(content=f"OpenAI request failed: {str(e)}", model=self.model_name, provider="openai")

    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        if not self.api_key or self.api_key.startswith("sk-placeholder"):
            yield "OpenAI API key is not configured."
            return
        response = await self.generate_response(messages, system_prompt, temperature)
        yield response.content
