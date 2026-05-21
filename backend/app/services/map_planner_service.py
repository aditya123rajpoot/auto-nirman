import json

from app.schemas.map2d import Map2DAIPlanRequest
from app.services.groq_service import GroqServiceError, run_chat_completion
from app.services.prompts import AUTO_NIRMAN_MAP_SYSTEM_PROMPT


def fallback_plan(input_data: Map2DAIPlanRequest) -> dict:
    premium = input_data.planStyle == "premium"
    compact = input_data.planStyle == "compact"
    bedrooms = input_data.bedrooms or (3 if input_data.houseType == "3bhk" else 2)
    bathrooms = input_data.bathrooms or 2

    return {
        "conceptTitle": "Premium Family Flow" if premium else "Compact Smart Core" if compact else "Balanced Family Plan",
        "strategy": "premium_family" if premium else "compact_core" if compact else "open_living",
        "roomEmphasis": "living" if premium else "bedrooms" if compact else "balanced",
        "recommendedRooms": [
            f"{bedrooms} bedrooms",
            f"{bathrooms} bathrooms",
            "covered parking" if input_data.parking else "larger living frontage",
            "edge staircase" if input_data.staircase else "single-floor circulation",
        ],
        "rooms": [],
        "designNotes": [
            "AI detected an irregular plot and recommends using the cleanest internal buildable zone."
            if input_data.plotMode == "trace"
            else "AI recommends a clean rectangular planning grid.",
            "Kitchen and utility should stay biased toward the south-east service zone."
            if input_data.vastu
            else "Room placement can prioritize daylight and compact circulation.",
            "Give the living/dining zone more breathing space and keep bedroom entries more private."
            if premium
            else "Keep plumbing grouped so bathrooms and utility do not fragment the plan.",
        ],
        "scoreAdjustments": {
            "efficiency": 3 if compact else -2 if premium else 1,
            "circulation": 4 if premium else 1,
            "daylight": 2 if input_data.roadSide in ["north", "east"] else 0,
        },
    }


def buildable_bounds(input_data: Map2DAIPlanRequest) -> dict:
    polygon = input_data.plotPolygon or []
    if not polygon:
        return {"minX": 0, "minY": 0, "maxX": input_data.plotWidth, "maxY": input_data.plotLength}
    return {
        "minX": min(point.x for point in polygon),
        "minY": min(point.y for point in polygon),
        "maxX": max(point.x for point in polygon),
        "maxY": max(point.y for point in polygon),
    }


async def create_ai_plan(input_data: Map2DAIPlanRequest) -> dict:
    user_payload = {
        "plotMode": input_data.plotMode,
        "plotLength": input_data.plotLength,
        "plotWidth": input_data.plotWidth,
        "polygon": [point.model_dump() for point in input_data.plotPolygon or []],
        "buildableCoordinateBox": buildable_bounds(input_data),
        "roadSide": input_data.roadSide,
        "houseType": input_data.houseType,
        "bedrooms": input_data.bedrooms,
        "bathrooms": input_data.bathrooms,
        "planStyle": input_data.planStyle,
        "vastu": input_data.vastu,
        "parking": input_data.parking,
        "staircase": input_data.staircase,
        "city": input_data.city,
        "userBrief": input_data.aiBrief,
    }

    try:
        result = await run_chat_completion(
            system_prompt=AUTO_NIRMAN_MAP_SYSTEM_PROMPT,
            user_content=json.dumps(user_payload),
            temperature=0.35,
            response_format={"type": "json_object"},
        )
        return {"success": True, "aiPlan": json.loads(result.content), "source": "groq", "cache": result.cache.model_dump()}
    except (GroqServiceError, json.JSONDecodeError):
        return {"success": True, "aiPlan": fallback_plan(input_data), "source": "fallback"}

