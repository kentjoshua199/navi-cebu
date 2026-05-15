// NaviCebu Route Queries
// Optimized to eliminate N+1 queries and fix 3% API timeout issue
// Uses single-query patterns with Supabase joins

import { createClient } from '@/lib/supabase/server'
import type {
  Route,
  RouteWithPath,
  RouteSearchResult,
  RouteDetailResponse,
  RouteType,
  CheckpointWithBarangay,
} from '@/lib/types/database'

/**
 * Get all active routes with checkpoint counts
 * Optimized: Single query with aggregation instead of N+1
 */
export async function getActiveRoutes(): Promise<RouteSearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('routes')
    .select(`
      id,
      route_code,
      route_name,
      route_type,
      origin,
      destination,
      base_fare,
      route_paths(count)
    `)
    .eq('is_active', true)
    .order('route_code')

  if (error) throw new Error(`Failed to fetch routes: ${error.message}`)

  return (data ?? []).map((route) => ({
    id: route.id,
    route_code: route.route_code,
    route_name: route.route_name,
    route_type: route.route_type as RouteType,
    origin: route.origin,
    destination: route.destination,
    base_fare: Number(route.base_fare),
    checkpoint_count: route.route_paths?.[0]?.count ?? 0,
  }))
}

/**
 * Get route by code with full path (forward and return)
 * Optimized: Single query with nested joins - NO N+1
 */
export async function getRouteByCode(routeCode: string): Promise<RouteDetailResponse | null> {
  const supabase = await createClient()

  const { data: route, error } = await supabase
    .from('routes')
    .select(`
      *,
      route_paths(
        *,
        checkpoint:checkpoints(
          *,
          barangay:barangays(*)
        )
      )
    `)
    .eq('route_code', routeCode)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch route: ${error.message}`)
  }

  if (!route) return null

  // Separate forward and return paths, sorted by sequence
  const forwardPaths = route.route_paths
    .filter((rp: { direction: string }) => rp.direction === 'FORWARD')
    .sort((a: { sequence_order: number }, b: { sequence_order: number }) => a.sequence_order - b.sequence_order)

  const returnPaths = route.route_paths
    .filter((rp: { direction: string }) => rp.direction === 'RETURN')
    .sort((a: { sequence_order: number }, b: { sequence_order: number }) => a.sequence_order - b.sequence_order)

  // Calculate totals
  const totalDistance = route.route_paths.reduce(
    (sum: number, rp: { distance_meters: number | null }) => sum + (rp.distance_meters ?? 0),
    0
  )
  const totalTime = route.route_paths.reduce(
    (sum: number, rp: { estimated_time_minutes: number | null }) => sum + (rp.estimated_time_minutes ?? 0),
    0
  )

  return {
    route: {
      id: route.id,
      route_code: route.route_code,
      route_name: route.route_name,
      route_type: route.route_type as RouteType,
      origin: route.origin,
      destination: route.destination,
      base_fare: Number(route.base_fare),
      is_active: route.is_active,
      operating_hours: route.operating_hours,
      created_at: route.created_at,
      updated_at: route.updated_at,
    },
    checkpoints: {
      forward: forwardPaths.map((rp: { checkpoint: CheckpointWithBarangay }) => rp.checkpoint),
      return: returnPaths.map((rp: { checkpoint: CheckpointWithBarangay }) => rp.checkpoint),
    },
    total_distance_meters: totalDistance,
    estimated_total_time_minutes: totalTime,
  }
}

/**
 * Search routes by type (Traditional vs Modernized PUJ)
 */
export async function getRoutesByType(routeType: RouteType): Promise<RouteSearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('routes')
    .select(`
      id,
      route_code,
      route_name,
      route_type,
      origin,
      destination,
      base_fare,
      route_paths(count)
    `)
    .eq('route_type', routeType)
    .eq('is_active', true)
    .order('route_code')

  if (error) throw new Error(`Failed to fetch routes by type: ${error.message}`)

  return (data ?? []).map((route) => ({
    id: route.id,
    route_code: route.route_code,
    route_name: route.route_name,
    route_type: route.route_type as RouteType,
    origin: route.origin,
    destination: route.destination,
    base_fare: Number(route.base_fare),
    checkpoint_count: route.route_paths?.[0]?.count ?? 0,
  }))
}

/**
 * Get database statistics
 */
export async function getStatistics() {
  const supabase = await createClient()

  const [barangaysRes, routesRes] = await Promise.all([
    supabase.from('barangays').select('id', { count: 'exact', head: true }),
    supabase.from('routes').select('route_type', { head: false }).eq('is_active', true),
  ])

  const barangayCount = barangaysRes.count || 0
  const allRoutes = routesRes.data || []
  
  const traditionalCount = allRoutes.filter((r: any) => r.route_type === 'TRADITIONAL').length
  const modernizedCount = allRoutes.filter((r: any) => r.route_type === 'MODERNIZED').length

  return {
    barangayCount,
    totalRoutes: allRoutes.length,
    traditionalRoutes: traditionalCount,
    modernizedRoutes: modernizedCount,
  }
}
