// GET /api/checkpoints/search - Fuzzy search checkpoints
// Uses pg_trgm for typo-tolerant search

import { NextResponse } from 'next/server'
import { searchCheckpoints, getCheckpointsByType, getAllTerminals } from '@/lib/queries/checkpoints'
import type { CheckpointType } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') as CheckpointType | null
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 50)

    // If query provided, do fuzzy search
    if (query && query.length >= 2) {
      const checkpoints = await searchCheckpoints(query, limit)
      return NextResponse.json(
        { data: checkpoints, count: checkpoints.length },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          },
        }
      )
    }

    // If type provided, filter by type
    if (type) {
      const checkpoints = type === 'TERMINAL'
        ? await getAllTerminals()
        : await getCheckpointsByType(type)
      return NextResponse.json(
        { data: checkpoints, count: checkpoints.length },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      )
    }

    // Default: return terminals (most useful for commuters)
    const terminals = await getAllTerminals()
    return NextResponse.json(
      { data: terminals, count: terminals.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[NaviCebu] Checkpoint search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search checkpoints', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
