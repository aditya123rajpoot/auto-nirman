from typing import Literal

from pydantic import BaseModel, Field


CityTier = Literal["metro", "tier1", "tier2", "tier3"]
Quality = Literal["basic", "standard", "premium"]
HouseType = Literal["independent", "villa", "row"]


class EstimateInput(BaseModel):
    plotSqft: float = Field(..., ge=0)
    builtSqft: float = Field(..., ge=0)
    floors: Literal[1, 2, 3, 4]
    houseType: HouseType
    cityTier: CityTier
    citySlug: str | None = None
    quality: Quality
    basement: bool = False
    parking: bool = False
    lift: bool = False
    vastu: bool = False
    solarReady: bool = False


class EstimateBreakdownItem(BaseModel):
    key: str
    label: str
    amount: int
    percentage: int
    color: str


class EstimateResult(BaseModel):
    totalCost: int
    low: int
    high: int
    baseCost: int
    addonCost: int
    costPerSqft: int
    timelineMonths: int
    confidencePct: int
    rateSource: Literal["tier_default", "city_override"]
    cityLabel: str
    assumptions: list[str]
    breakdown: list[EstimateBreakdownItem]

