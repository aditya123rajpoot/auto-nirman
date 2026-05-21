import { NextRequest, NextResponse } from 'next/server'
import { postToBackend } from '@/lib/backend'
import { estimate, EstimationError } from '../../../lib/estimator'
import type { EstimateInput } from '../../../types/estimator'

export async function POST(req: NextRequest) {
  try {
    const input: EstimateInput = await req.json()
    const backendResult = await postToBackend('/api/v1/estimate', input)

    if (backendResult) {
      return NextResponse.json(backendResult)
    }

    const result = estimate(input)
    return NextResponse.json({ ok: true, data: result })
  } catch (err) {
    if (err instanceof EstimationError) {
      return NextResponse.json({ ok: false, error: err.message, field: err.field }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
