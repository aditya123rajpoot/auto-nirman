from fastapi import APIRouter, HTTPException

from app.schemas.estimator import EstimateInput
from app.services.estimator_service import EstimationError, estimate_construction_cost


router = APIRouter()


@router.post("/estimate")
def create_estimate(payload: EstimateInput):
    try:
        return {"ok": True, "data": estimate_construction_cost(payload)}
    except EstimationError as error:
        raise HTTPException(status_code=400, detail={"error": str(error), "field": error.field}) from error

