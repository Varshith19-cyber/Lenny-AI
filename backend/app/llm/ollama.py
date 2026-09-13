import httpx
import json
from typing import AsyncGenerator, Dict, List, Any, Optional
from app.llm.base import BaseLLMProvider, LLMResponse
from app.core.config import settings
from app.core.logging import logger

class OllamaProvider(BaseLLMProvider):
    def __init__(self, model_name: Optional[str] = None, base_url: Optional[str] = None):
        super().__init__(model_name or settings.DEFAULT_OLLAMA_MODEL)
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")

    async def check_health(self) -> Dict[str, Any]:
        """Check if Ollama server is reachable and if the specified model is installed."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    model_exists = any(self.model_name in m for m in models)
                    return {
                        "available": True,
                        "model_available": model_exists,
                        "installed_models": models,
                        "message": f"Ollama online. Model '{self.model_name}' " + ("is installed." if model_exists else "is NOT installed.")
                    }
                return {"available": False, "message": f"Ollama HTTP {res.status_code}"}
        except httpx.ConnectError:
            return {
                "available": False,
                "message": "Local model unavailable. Please start Ollama and ensure the selected model is installed."
            }
        except Exception as e:
            return {"available": False, "message": f"Ollama check failed: {str(e)}"}

    def _prepare_payload(self, messages: List[Dict[str, str]], system_prompt: Optional[str], stream: bool, temperature: float) -> Dict[str, Any]:
        formatted_msgs = []
        if system_prompt:
            formatted_msgs.append({"role": "system", "content": system_prompt})
        for m in messages:
            formatted_msgs.append({"role": m["role"], "content": m["content"]})
            
        return {
            "model": self.model_name,
            "messages": formatted_msgs,
            "stream": stream,
            "options": {"temperature": temperature}
        }

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> LLMResponse:
        payload = self._prepare_payload(messages, system_prompt, stream=False, temperature=temperature)
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("message", {}).get("content", "")
                    return LLMResponse(content=content, model=self.model_name, provider="ollama")
                elif res.status_code == 404:
                    return LLMResponse(
                        content=f"Model '{self.model_name}' not found in Ollama. Please run `ollama pull {self.model_name}`.",
                        model=self.model_name,
                        provider="ollama"
                    )
                else:
                    return LLMResponse(
                        content=f"Ollama returned HTTP error {res.status_code}.",
                        model=self.model_name,
                        provider="ollama"
                    )
        except httpx.ConnectError:
            return LLMResponse(
                content="Local model unavailable. Please start Ollama service on your local machine.",
                model=self.model_name,
                provider="ollama"
            )
        except httpx.TimeoutException:
            return LLMResponse(
                content="Ollama model response timed out. Try using a smaller local model or switching to Anthropic Claude.",
                model=self.model_name,
                provider="ollama"
            )
        except Exception as e:
            logger.error(f"Ollama generate exception: {e}")
            return LLMResponse(
                content=f"Ollama error: {str(e)}",
                model=self.model_name,
                provider="ollama"
            )

    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        payload = self._prepare_payload(messages, system_prompt, stream=True, temperature=temperature)
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        yield f"Ollama connection error (HTTP {response.status_code}). Please check if model is installed."
                        return
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                chunk = json.loads(line)
                                token = chunk.get("message", {}).get("content", "")
                                if token:
                                    yield token
                            except Exception:
                                pass
        except httpx.ConnectError:
            yield "Local model unavailable. Please start Ollama and ensure the selected model is installed."
        except Exception as e:
            yield f"\n[Ollama Connection Error: {str(e)}]"
