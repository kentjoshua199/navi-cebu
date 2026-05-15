// GET /api/checkpoints/[id]/routes - Get routes passing through a checkpoint
// "What jeepneys pass here?" feature

import { NextResponse } from 'next/server'
import { getRoutesPassingCheckpoint } from '@/lib/queries/routes'
import { getCheckpointById } from '@/lib/queries/checkpoints'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate checkpoint exists
    const checkpoint = await getCheckpointById(id)
    if (!checkpoint) {
      return NextResponse.json(
        { error: 'Checkpoint not found', id },
        { status: 404 }
      )
    }

    const routes = await getRoutesPassingCheckpoint(id)

    return NextResponse.json(
      {
        data: {
          checkpoint,
          routes,
          route_count: routes.length,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[NaviCebu] Checkpoint routes API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routes for checkpoint', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
