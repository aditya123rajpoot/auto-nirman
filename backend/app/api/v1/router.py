from fastapi import APIRouter

from app.api.v1.routes import chat, estimate, map2d, tour


api_router = APIRouter()
api_router.include_router(estimate.router, tags=["estimate"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(map2d.router, prefix="/map2d", tags=["map2d"])
api_router.include_router(tour.router, prefix="/tour", tags=["tour"])

