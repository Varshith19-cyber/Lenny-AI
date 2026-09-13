import os
import httpx
from typing import AsyncGenerator, Dict, List, Any, Optional
from app.llm.base import BaseLLMProvider, LLMResponse
from app.core.config import settings
from app.core.logging import logger

try:
    import anthropic
    HAS_ANTHROPIC_SDK = True
except ImportError:
    HAS_ANTHROPIC_SDK = False

class AnthropicProvider(BaseLLMProvider):
    def __init__(self, model_name: Optional[str] = None, api_key: Optional[str] = None):
        super().__init__(model_name or settings.DEFAULT_ANTHROPIC_MODEL)
        self.api_key = api_key or settings.ANTHROPIC_API_KEY or os.getenv("ANTHROPIC_API_KEY", "")

    async def check_health(self) -> Dict[str, Any]:
        """Check if Anthropic API key is configured and valid."""
        if not self.api_key or self.api_key.startswith("sk-ant-api03-placeholder"):
            return {
                "available": False,
                "message": "Anthropic API key is missing or set to placeholder in .env file."
            }
        return {
            "available": True,
            "message": f"Anthropic Cloud Provider configured with model '{self.model_name}'."
        }

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> LLMResponse:
        if not self.api_key or self.api_key.startswith("sk-ant-api03-placeholder"):
            return LLMResponse(
                content="Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env file or select Ollama local model.",
                model=self.model_name,
                provider="anthropic"
            )

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        anthropic_msgs = []
        for m in messages:
            anthropic_msgs.append({"role": m["role"], "content": m["content"]})

        payload = {
            "model": self.model_name,
            "messages": anthropic_msgs,
            "max_tokens": 4096,
            "temperature": temperature
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content_blocks = data.get("content", [])
                    text = "".join([b.get("text", "") for b in content_blocks if b.get("type") == "text"])
                    usage = data.get("usage", {})
                    return LLMResponse(content=text, model=self.model_name, provider="anthropic", usage=usage)
                elif res.status_code == 401:
                    return LLMResponse(content="Invalid Anthropic API Key provided.", model=self.model_name, provider="anthropic")
                else:
                    return LLMResponse(content=f"Anthropic API Error (HTTP {res.status_code}): {res.text}", model=self.model_name, provider="anthropic")
        except Exception as e:
            logger.error(f"Anthropic error: {e}")
            return LLMResponse(content=f"Anthropic request failed: {str(e)}", model=self.model_name, provider="anthropic")

    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        if not self.api_key or self.api_key.startswith("sk-ant-api03-placeholder"):
            yield "Anthropic API key is not configured. Please supply ANTHROPIC_API_KEY in .env file or switch to Ollama local model."
            return

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        anthropic_msgs = [{"role": m["role"], "content": m["content"]} for m in messages]
        payload = {
            "model": self.model_name,
            "messages": anthropic_msgs,
            "max_tokens": 4096,
            "temperature": temperature,
            "stream": True
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", "https://api.anthropic.com/v1/messages", headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        yield f"Anthropic Streaming Error (HTTP {response.status_code})"
                        return
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            import json
                            raw_data = line[6:]
                            if raw_data.strip() == "[DONE]":
                                break
                            try:
                                event = json.loads(raw_data)
                                if event.get("type") == "content_block_delta":
                                    delta = event.get("delta", {})
                                    if delta.get("type") == "text_delta":
                                        yield delta.get("text", "")
                            except Exception:
                                pass
        except Exception as e:
            yield f"\n[Anthropic API Stream Error: {str(e)}]"
