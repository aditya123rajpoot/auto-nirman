'use client'

import { useState } from 'react'
import type { EstimateInput, EstimateResult } from '../types/estimator'

type ApiResponse =
  | { ok: true; data: EstimateResult }
  | { ok: false; error: string; field?: keyof EstimateInput }

export function useEstimator(apiUrl = '/api/estimate') {
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<keyof EstimateInput | null>(null)

  const calculate = async (input: EstimateInput) => {
    setLoading(true)
    setError(null)
    setFieldError(null)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const payload = (await response.json()) as ApiResponse

      if (!response.ok || !payload.ok) {
        const message = payload.ok ? 'Could not calculate estimate.' : payload.error
        const field = payload.ok ? undefined : payload.field
        setError(message)
        setFieldError(field ?? null)
        setResult(null)
        return null
      }

      setResult(payload.data)
      return payload.data
    } catch {
      setError('Estimator service is not reachable. Please try again.')
      setResult(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, fieldError, calculate }
}
