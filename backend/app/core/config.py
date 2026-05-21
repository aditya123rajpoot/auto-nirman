import os
from dataclasses import dataclass
from functools import cached_property

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    groq_api_key: str | None = os.getenv("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

    @cached_property
    def cors_origins(self) -> list[str]:
        extra = os.getenv("CORS_ORIGINS", "")
        origins = [self.frontend_origin, "http://127.0.0.1:3000"]
        origins.extend(origin.strip() for origin in extra.split(",") if origin.strip())
        return sorted(set(origins))


settings = Settings()
