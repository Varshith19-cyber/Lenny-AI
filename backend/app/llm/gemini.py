import httpx
from typing import AsyncGenerator, Dict, List, Any, Optional
from app.llm.base import BaseLLMProvider, LLMResponse
from app.core.config import settings
from app.core.logging import logger

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiProvider(BaseLLMProvider):
    def __init__(self, model_name: Optional[str] = None, api_key: Optional[str] = None):
        super().__init__(model_name or settings.DEFAULT_GEMINI_MODEL)
        self.api_key = api_key or settings.GEMINI_API_KEY or ""

    async def check_health(self) -> Dict[str, Any]:
        if not self.api_key or len(self.api_key) < 10:
            return {
                "available": False,
                "message": "Gemini API key is missing or invalid in .env file.",
            }
        # Quick model-list probe to confirm key is accepted
        url = f"{GEMINI_API_BASE}?key={self.api_key}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(url)
            if r.status_code == 200:
                return {
                    "available": True,
                    "message": f"Google Gemini configured with model '{self.model_name}'.",
                }
            else:
                body = r.json()
                err = body.get("error", {}).get("message", r.text)
                return {"available": False, "message": f"Gemini key check failed: {err}"}
        except Exception as e:
            return {"available": False, "message": f"Gemini health check error: {e}"}

    def _build_payload(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        temperature: float,
    ) -> Dict[str, Any]:
        """Convert OpenAI-style message list to Gemini generateContent payload."""
        contents = []
        for m in messages:
            # Gemini uses "model" instead of "assistant"
            role = "model" if m["role"] == "assistant" else "user"
            contents.append({"role": role, "parts": [{"text": m["content"]}]})

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 8192,
            },
        }

        if system_prompt:
            payload["system_instruction"] = {"parts": [{"text": system_prompt}]}

        return payload

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> LLMResponse:
        if not self.api_key or len(self.api_key) < 10:
            return LLMResponse(
                content="Gemini API key is not configured. Please set GEMINI_API_KEY in .env.",
                model=self.model_name,
                provider="gemini",
            )

        url = f"{GEMINI_API_BASE}/{self.model_name}:generateContent?key={self.api_key}"
        payload = self._build_payload(messages, system_prompt, temperature)

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                r = await client.post(url, json=payload)

            if r.status_code == 200:
                data = r.json()
                # Extract text from first candidate
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                usage = data.get("usageMetadata", {})
                return LLMResponse(
                    content=text,
                    model=self.model_name,
                    provider="gemini",
                    usage={
                        "prompt_tokens": usage.get("promptTokenCount", 0),
                        "completion_tokens": usage.get("candidatesTokenCount", 0),
                        "total_tokens": usage.get("totalTokenCount", 0),
                    },
                )
            else:
                err = r.json().get("error", {}).get("message", r.text)
                logger.error(f"Gemini API error {r.status_code}: {err}")
                return LLMResponse(
                    content=f"Gemini API Error (HTTP {r.status_code}): {err}",
                    model=self.model_name,
                    provider="gemini",
                )
        except Exception as e:
            logger.error(f"Gemini request failed: {e}")
            return LLMResponse(
                content=f"Gemini request failed: {str(e)}",
                model=self.model_name,
                provider="gemini",
            )

    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """Streams via the streamGenerateContent endpoint."""
        if not self.api_key or len(self.api_key) < 10:
            yield "Gemini API key is not configured."
            return

        url = f"{GEMINI_API_BASE}/{self.model_name}:streamGenerateContent?alt=sse&key={self.api_key}"
        payload = self._build_payload(messages, system_prompt, temperature)

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", url, json=payload) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data:"):
                            import json
                            raw = line[5:].strip()
                            if raw == "[DONE]":
                                break
                            try:
                                chunk = json.loads(raw)
                                text = (
                                    chunk.get("candidates", [{}])[0]
                                    .get("content", {})
                                    .get("parts", [{}])[0]
                                    .get("text", "")
                                )
                                if text:
                                    yield text
                            except Exception:
                                continue
        except Exception as e:
            logger.error(f"Gemini stream error: {e}")
            yield f"Gemini stream error: {str(e)}"
