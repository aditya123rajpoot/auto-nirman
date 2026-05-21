from typing import Literal

from pydantic import BaseModel, Field


RoadSide = Literal["north", "east", "south", "west"]
HouseType = Literal["2bhk", "3bhk"]
PlotMode = Literal["rectangle", "trace"]
PlanStyle = Literal["compact", "family", "premium"]


class Map2DPoint(BaseModel):
    x: float
    y: float


class Map2DAIPlanRequest(BaseModel):
    plotMode: PlotMode | None = None
    plotLength: float
    plotWidth: float
    plotPolygon: list[Map2DPoint] | None = None
    roadSide: RoadSide
    houseType: HouseType
    bedrooms: int | None = None
    bathrooms: int | None = None
    planStyle: PlanStyle | None = None
    aiBrief: str | None = None
    vastu: bool = False
    parking: bool = False
    staircase: bool = False
    city: str


class BoundaryDetectRequest(BaseModel):
    imageData: list[int] = Field(..., min_length=1)
    imageWidth: int = Field(..., gt=0)
    imageHeight: int = Field(..., gt=0)
    plotWidth: float = Field(..., gt=0)
    plotLength: float = Field(..., gt=0)


class BoundaryDetectResponse(BaseModel):
    success: bool
    polygon: list[Map2DPoint] | None = None
    confidence: float | None = None
    source: str = "fastapi_fallback"
    error: str | None = None

