// GET /api/routes - List all active routes
// Optimized for 5x rush-hour traffic with cache headers

import { NextResponse } from 'next/server'
import { getActiveRoutes, getRoutesByType } from '@/lib/queries/routes'
import type { RouteType } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeType = searchParams.get('type') as RouteType | null

    const routes = routeType
      ? await getRoutesByType(routeType)
      : await getActiveRoutes()

    // Cache for 60s during rush hour, browser can use stale for 5min
    // This handles the 5x traffic spike from case study
    return NextResponse.json(
      { data: routes, count: routes.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('[NaviCebu] Routes API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routes', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
