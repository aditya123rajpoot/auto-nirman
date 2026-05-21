from dataclasses import dataclass
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.chat import GroqCacheUsage


class GroqServiceError(Exception):
    pass


@dataclass(frozen=True)
class GroqCompletionResult:
    content: str
    cache: GroqCacheUsage
    raw: dict[str, Any]


def extract_cache_usage(data: dict[str, Any]) -> GroqCacheUsage:
    usage = data.get("usage") or {}
    details = usage.get("prompt_tokens_details") or {}
    prompt_tokens = int(usage.get("prompt_tokens") or 0)
    cached_tokens = int(details.get("cached_tokens") or 0)
    hit_rate = round((cached_tokens / prompt_tokens) * 100) if prompt_tokens else 0
    return GroqCacheUsage(promptTokens=prompt_tokens, cachedTokens=cached_tokens, cacheHitRate=hit_rate)


async def run_chat_completion(
    *,
    system_prompt: str,
    user_content: str,
    temperature: float,
    response_format: dict[str, str] | None = None,
) -> GroqCompletionResult:
    if not settings.groq_api_key:
        raise GroqServiceError("Missing GROQ_API_KEY.")

    payload: dict[str, Any] = {
        "model": settings.groq_model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    }
    if response_format:
        payload["response_format"] = response_format

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    try:
        data = response.json()
    except ValueError as error:
        raise GroqServiceError("Groq returned a non-JSON response.") from error

    if response.status_code >= 400:
        message = (data.get("error") or {}).get("message") or "Groq request failed."
        raise GroqServiceError(message)

    content = (((data.get("choices") or [{}])[0].get("message") or {}).get("content") or "").strip()
    if not content:
        raise GroqServiceError("Groq returned an empty response.")

    return GroqCompletionResult(content=content, cache=extract_cache_usage(data), raw=data)

