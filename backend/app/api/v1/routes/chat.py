from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.groq_service import GroqServiceError, run_chat_completion
from app.services.prompts import AUTO_NIRMAN_CHAT_SYSTEM_PROMPT


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    try:
        result = await run_chat_completion(
            system_prompt=AUTO_NIRMAN_CHAT_SYSTEM_PROMPT,
            user_content=payload.message,
            temperature=0.45,
        )
        return ChatResponse(response=result.content, cache=result.cache)
    except GroqServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

