// GET /api/routes/[code] - Get route details by code
// Single optimized query with all checkpoints (no N+1)

import { NextResponse } from 'next/server'
import { getRouteByCode } from '@/lib/queries/routes'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const routeCode = decodeURIComponent(code).toUpperCase()

    const routeDetail = await getRouteByCode(routeCode)

    if (!routeDetail) {
      return NextResponse.json(
        { error: 'Route not found', code: routeCode },
        { status: 404 }
      )
    }

    // Cache route details for 5min (routes don't change often)
    return NextResponse.json(
      { data: routeDetail },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[NaviCebu] Route detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch route', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
