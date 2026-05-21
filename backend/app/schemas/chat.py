from pydantic import BaseModel, Field


class GroqCacheUsage(BaseModel):
    promptTokens: int = 0
    cachedTokens: int = 0
    cacheHitRate: int = 0


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    response: str
    cache: GroqCacheUsage

