from fastapi import APIRouter

from app.data.interior_tiers import INTERIOR_TIERS
from app.schemas.tour import RoomInteriorCostRequest


router = APIRouter()


@router.get("/tiers")
def list_tiers():
    return {"ok": True, "tiers": list(INTERIOR_TIERS.values())}


@router.post("/cost")
def room_tour_cost(payload: RoomInteriorCostRequest):
    tier = INTERIOR_TIERS[payload.tier_id]
    rooms = [
        {
            "id": room.id,
            "name": room.name,
            "areaSqFt": room.area_sq_ft,
            "cost": round(room.area_sq_ft * tier["costPerSqFt"]),
        }
        for room in payload.rooms
    ]
    return {
        "ok": True,
        "tier": tier,
        "rooms": rooms,
        "totalCost": sum(room["cost"] for room in rooms),
    }

