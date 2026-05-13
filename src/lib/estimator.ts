import { addonRates, breakdownTemplate, cityRateOverrides, houseTypeMultipliers, qualityMultipliers, tierBaseRates } from './pricingDb'
import type { EstimateInput, EstimateResult } from '../types/estimator'

export class EstimationError extends Error {
  field?: keyof EstimateInput

  constructor(message: string, field?: keyof EstimateInput) {
    super(message)
    this.name = 'EstimationError'
    this.field = field
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const roundToNearest = (value: number, nearest = 1000) => Math.round(value / nearest) * nearest

export function formatINR(value: number) {
  if (!Number.isFinite(value)) return 'Rs 0'

  if (value >= 10000000) {
    return `Rs ${(value / 10000000).toFixed(value >= 100000000 ? 1 : 2)} Cr`
  }

  if (value >= 100000) {
    return `Rs ${(value / 100000).toFixed(value >= 1000000 ? 1 : 2)} L`
  }

  return `Rs ${Math.round(value).toLocaleString('en-IN')}`
}

function normaliseCitySlug(citySlug?: string) {
  return citySlug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? ''
}

export function estimate(input: EstimateInput): EstimateResult {
  const plotSqft = Number(input.plotSqft)
  const builtSqft = Number(input.builtSqft)

  if (!Number.isFinite(plotSqft) || plotSqft < 200) {
    throw new EstimationError('Plot size should be at least 200 sq ft.', 'plotSqft')
  }

  if (!Number.isFinite(builtSqft) || builtSqft < 200) {
    throw new EstimationError('Built-up area should be at least 200 sq ft.', 'builtSqft')
  }

  if (builtSqft > plotSqft * input.floors * 1.25) {
    throw new EstimationError('Built-up area looks too high for the selected plot and floors.', 'builtSqft')
  }

  const cityKey = normaliseCitySlug(input.citySlug)
  const cityOverride = cityRateOverrides[cityKey]
  const baseRate = cityOverride?.rate ?? tierBaseRates[input.cityTier]
  const effectiveRate = baseRate * qualityMultipliers[input.quality] * houseTypeMultipliers[input.houseType]
  const floorComplexity = 1 + Math.max(input.floors - 1, 0) * 0.045
  const baseCost = roundToNearest(builtSqft * effectiveRate * floorComplexity)

  const addonCost = roundToNearest(
    (input.basement ? Math.min(plotSqft, builtSqft) * addonRates.basementPerSqft * 0.65 : 0) +
    (input.parking ? addonRates.parking : 0) +
    (input.lift ? addonRates.lift : 0) +
    (input.vastu ? addonRates.vastu : 0) +
    (input.solarReady ? addonRates.solarReady : 0)
  )

  const totalCost = roundToNearest(baseCost + addonCost)
  const confidencePct = cityOverride ? 11 : 15
  const low = roundToNearest(totalCost * (1 - confidencePct / 100))
  const high = roundToNearest(totalCost * (1 + confidencePct / 100))
  const timelineMonths = clamp(Math.ceil(builtSqft / 650 + input.floors * 1.5 + (input.basement ? 2 : 0)), 4, 30)

  const breakdown = breakdownTemplate.map(item => ({
    key: item.key,
    label: item.label,
    amount: roundToNearest(totalCost * item.share),
    percentage: Math.round(item.share * 100),
    color: item.color,
  }))

  const assumptions = [
    `${input.quality[0].toUpperCase()}${input.quality.slice(1)} quality residential construction`,
    `${input.floors === 1 ? 'Single floor' : `G + ${input.floors - 1}`} ${input.houseType.replace('-', ' ')} project`,
    cityOverride ? `City override applied for ${cityOverride.label}` : `Tier benchmark applied for ${input.cityTier.toUpperCase()}`,
    'Estimate excludes land, approvals, loose furniture, landscaping, GST and financing cost',
  ]

  return {
    totalCost,
    low,
    high,
    baseCost,
    addonCost,
    costPerSqft: Math.round(totalCost / builtSqft),
    timelineMonths,
    confidencePct,
    rateSource: cityOverride ? 'city_override' : 'tier_default',
    cityLabel: cityOverride?.label ?? input.cityTier.toUpperCase(),
    assumptions,
    breakdown,
  }
}
