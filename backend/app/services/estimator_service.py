import math
import re

from app.data.pricing import (
    ADDON_RATES,
    BREAKDOWN_TEMPLATE,
    CITY_RATE_OVERRIDES,
    HOUSE_TYPE_MULTIPLIERS,
    QUALITY_MULTIPLIERS,
    TIER_BASE_RATES,
)
from app.schemas.estimator import EstimateInput, EstimateResult


class EstimationError(Exception):
    def __init__(self, message: str, field: str | None = None):
        super().__init__(message)
        self.field = field


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(max(value, minimum), maximum)


def round_to_nearest(value: float, nearest: int = 1000) -> int:
    return round(value / nearest) * nearest


def normalise_city_slug(city_slug: str | None) -> str:
    if not city_slug:
        return ""
    return re.sub(r"[^a-z0-9]+", "-", city_slug.strip().lower()).strip("-")


def estimate_construction_cost(input_data: EstimateInput) -> EstimateResult:
    plot_sqft = float(input_data.plotSqft)
    built_sqft = float(input_data.builtSqft)

    if not math.isfinite(plot_sqft) or plot_sqft < 200:
        raise EstimationError("Plot size should be at least 200 sq ft.", "plotSqft")

    if not math.isfinite(built_sqft) or built_sqft < 200:
        raise EstimationError("Built-up area should be at least 200 sq ft.", "builtSqft")

    if built_sqft > plot_sqft * input_data.floors * 1.25:
        raise EstimationError("Built-up area looks too high for the selected plot and floors.", "builtSqft")

    city_key = normalise_city_slug(input_data.citySlug)
    city_override = CITY_RATE_OVERRIDES.get(city_key)
    base_rate = city_override["rate"] if city_override else TIER_BASE_RATES[input_data.cityTier]
    effective_rate = base_rate * QUALITY_MULTIPLIERS[input_data.quality] * HOUSE_TYPE_MULTIPLIERS[input_data.houseType]
    floor_complexity = 1 + max(input_data.floors - 1, 0) * 0.045
    base_cost = round_to_nearest(built_sqft * effective_rate * floor_complexity)

    addon_cost = round_to_nearest(
        (min(plot_sqft, built_sqft) * ADDON_RATES["basementPerSqft"] * 0.65 if input_data.basement else 0)
        + (ADDON_RATES["parking"] if input_data.parking else 0)
        + (ADDON_RATES["lift"] if input_data.lift else 0)
        + (ADDON_RATES["vastu"] if input_data.vastu else 0)
        + (ADDON_RATES["solarReady"] if input_data.solarReady else 0)
    )

    total_cost = round_to_nearest(base_cost + addon_cost)
    confidence_pct = 11 if city_override else 15
    low = round_to_nearest(total_cost * (1 - confidence_pct / 100))
    high = round_to_nearest(total_cost * (1 + confidence_pct / 100))
    timeline_months = int(clamp(math.ceil(built_sqft / 650 + input_data.floors * 1.5 + (2 if input_data.basement else 0)), 4, 30))

    breakdown = [
        {
            "key": item["key"],
            "label": item["label"],
            "amount": round_to_nearest(total_cost * item["share"]),
            "percentage": round(item["share"] * 100),
            "color": item["color"],
        }
        for item in BREAKDOWN_TEMPLATE
    ]

    quality_label = f"{input_data.quality[0].upper()}{input_data.quality[1:]}"
    floor_label = "Single floor" if input_data.floors == 1 else f"G + {input_data.floors - 1}"
    city_label = city_override["label"] if city_override else input_data.cityTier.upper()

    assumptions = [
        f"{quality_label} quality residential construction",
        f"{floor_label} {input_data.houseType.replace('-', ' ')} project",
        f"City override applied for {city_label}" if city_override else f"Tier benchmark applied for {input_data.cityTier.upper()}",
        "Estimate excludes land, approvals, loose furniture, landscaping, GST and financing cost",
    ]

    return EstimateResult(
        totalCost=total_cost,
        low=low,
        high=high,
        baseCost=base_cost,
        addonCost=addon_cost,
        costPerSqft=round(total_cost / built_sqft),
        timelineMonths=timeline_months,
        confidencePct=confidence_pct,
        rateSource="city_override" if city_override else "tier_default",
        cityLabel=city_label,
        assumptions=assumptions,
        breakdown=breakdown,
    )

