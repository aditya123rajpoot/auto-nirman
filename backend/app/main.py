from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings


app = FastAPI(
    title="Auto Nirman Intelligence API",
    description="Backend service layer for construction estimation, AI guidance, floor planning, BOQ intelligence, and room tour costing.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "ok": True,
        "service": "auto-nirman-backend",
        "version": app.version,
    }


app.include_router(api_router, prefix="/api/v1")

