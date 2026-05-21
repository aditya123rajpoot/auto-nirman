from typing import Literal

from pydantic import BaseModel, Field


InteriorTierId = Literal["basic", "standard", "premium", "luxury", "super_luxury"]


class RoomCostInput(BaseModel):
    id: str
    name: str
    area_sq_ft: float = Field(..., alias="areaSqFt", gt=0)

    model_config = {"populate_by_name": True}


class RoomInteriorCostRequest(BaseModel):
    tier_id: InteriorTierId = Field(..., alias="tierId")
    rooms: list[RoomCostInput] = Field(..., min_length=1)

    model_config = {"populate_by_name": True}

