export type CityTier = 'metro' | 'tier1' | 'tier2' | 'tier3'
export type Quality = 'basic' | 'standard' | 'premium'
export type HouseType = 'independent' | 'villa' | 'row'
export type Floors = 1 | 2 | 3 | 4

export type EstimateInput = {
  plotSqft: number
  builtSqft: number
  floors: Floors
  houseType: HouseType
  cityTier: CityTier
  citySlug?: string
  quality: Quality
  basement?: boolean
  parking?: boolean
  lift?: boolean
  vastu?: boolean
  solarReady?: boolean
}

export type EstimateBreakdownItem = {
  key: string
  label: string
  amount: number
  percentage: number
  color: string
}

export type EstimateResult = {
  totalCost: number
  low: number
  high: number
  baseCost: number
  addonCost: number
  costPerSqft: number
  timelineMonths: number
  confidencePct: number
  rateSource: 'tier_default' | 'city_override'
  cityLabel: string
  assumptions: string[]
  breakdown: EstimateBreakdownItem[]
}
