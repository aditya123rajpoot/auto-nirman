TIER_BASE_RATES = {
    "metro": 2650,
    "tier1": 2350,
    "tier2": 2050,
    "tier3": 1780,
}

CITY_RATE_OVERRIDES = {
    "mumbai": {"label": "Mumbai", "rate": 2925, "tier": "metro"},
    "delhi": {"label": "Delhi NCR", "rate": 2780, "tier": "metro"},
    "bengaluru": {"label": "Bengaluru", "rate": 2720, "tier": "metro"},
    "bangalore": {"label": "Bengaluru", "rate": 2720, "tier": "metro"},
    "pune": {"label": "Pune", "rate": 2520, "tier": "tier1"},
    "hyderabad": {"label": "Hyderabad", "rate": 2480, "tier": "tier1"},
    "chennai": {"label": "Chennai", "rate": 2460, "tier": "tier1"},
    "ahmedabad": {"label": "Ahmedabad", "rate": 2260, "tier": "tier1"},
    "lucknow": {"label": "Lucknow", "rate": 2050, "tier": "tier2"},
    "jaipur": {"label": "Jaipur", "rate": 2120, "tier": "tier2"},
    "indore": {"label": "Indore", "rate": 1980, "tier": "tier2"},
    "nagpur": {"label": "Nagpur", "rate": 2010, "tier": "tier2"},
}

QUALITY_MULTIPLIERS = {
    "basic": 0.88,
    "standard": 1,
    "premium": 1.28,
}

HOUSE_TYPE_MULTIPLIERS = {
    "independent": 1,
    "villa": 1.16,
    "row": 0.94,
}

BREAKDOWN_TEMPLATE = [
    {"key": "structure", "label": "Structure & civil shell", "share": 0.34, "color": "#38bdf8"},
    {"key": "masonry", "label": "Masonry & plaster", "share": 0.13, "color": "#22c55e"},
    {"key": "flooring", "label": "Flooring & finishes", "share": 0.18, "color": "#f59e0b"},
    {"key": "mep", "label": "Electrical & plumbing", "share": 0.15, "color": "#a78bfa"},
    {"key": "doors", "label": "Doors, windows & facade", "share": 0.1, "color": "#fb7185"},
    {"key": "management", "label": "Labour, wastage & overheads", "share": 0.1, "color": "#94a3b8"},
]

ADDON_RATES = {
    "basementPerSqft": 1450,
    "parking": 185000,
    "lift": 850000,
    "vastu": 55000,
    "solarReady": 95000,
}

