from fastapi import APIRouter

from app.schemas.map2d import BoundaryDetectRequest, BoundaryDetectResponse, Map2DAIPlanRequest
from app.services.boundary_service import detect_boundary_fallback
from app.services.map_planner_service import create_ai_plan


router = APIRouter()


@router.post("/ai-plan")
async def ai_plan(payload: Map2DAIPlanRequest):
    return await create_ai_plan(payload)


@router.post("/detect-boundary", response_model=BoundaryDetectResponse)
def detect_boundary(payload: BoundaryDetectRequest):
    return detect_boundary_fallback(payload)

