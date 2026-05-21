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
 * Counts only FORWARD direction for accurate landing page display
 */
export async function getActiveRoutes(): Promise<RouteSearchResult[]> {
  const supabase = await createClient()

  // Single query: fetch routes with stop count via stop_settings relationship
  const { data, error } = await supabase
    .from('routes')
    .select('id, route_code, route_name, route_type, origin, destination, base_fare, stop_settings(id)')
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
    checkpoint_count: Array.isArray(route.stop_settings) ? route.stop_settings.length : 0,
  }))
}


/**
 * Get route by code with full path (forward and return)
 * Optimized: Single query with nested joins - NO N+1
 * Calculates distance and time for FORWARD direction only
 */
export async function getRouteByCode(routeCode: string): Promise<RouteDetailResponse | null> {
  const supabase = await createClient()

  const { data: route, error } = await supabase
    .from('routes')
    .select(`
      *,
      stop_settings(
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

  // Use stop_settings for paths, sorted by stop_order
  const forwardPaths = route.stop_settings
    .sort((a: { stop_order: number }, b: { stop_order: number }) => a.stop_order - b.stop_order)

  // Calculate totals 
  const totalDistance = forwardPaths.reduce(
    (sum: number, rp: { distance_meters?: number | null }) => sum + (rp.distance_meters ?? 0),
    0
  )
  const totalTime = forwardPaths.reduce(
    (sum: number, rp: { estimated_time_minutes?: number | null, waiting_time_minutes?: number | null }) => 
      sum + (rp.estimated_time_minutes ?? 0) + (rp.waiting_time_minutes ?? 0),
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
      fare_per_km: route.fare_per_km ? Number(route.fare_per_km) : undefined,
      is_active: route.is_active,
      map_url: route.map_url,
      operating_hours: route.operating_hours,
      first_trip_time: route.first_trip_time ?? undefined,
      last_trip_time: route.last_trip_time ?? undefined,
      peak_hours: route.peak_hours ?? undefined,
      operating_days: route.operating_days ?? undefined,
      created_at: route.created_at,
      updated_at: route.updated_at,
    },
    checkpoints: {
      forward: forwardPaths.map((rp: { checkpoint: CheckpointWithBarangay }) => {
        const cp = rp.checkpoint
        // Ensure coordinates are properly parsed (JSONB may come as string)
        if (cp && cp.coordinates && typeof cp.coordinates === 'string') {
          try { cp.coordinates = JSON.parse(cp.coordinates) } catch {}
        }
        return cp
      }),
      return: [],
    },
    stops: forwardPaths.map((rp: any) => ({
      checkpoint: {
        ...rp.checkpoint,
        coordinates: typeof rp.checkpoint.coordinates === 'string' ? JSON.parse(rp.checkpoint.coordinates) : rp.checkpoint.coordinates
      },
      stop_order: rp.stop_order,
      stop_type: rp.stop_type,
      waiting_time_minutes: rp.waiting_time_minutes ?? 0,
      estimated_time_minutes: rp.estimated_time_minutes ?? 0,
      distance_meters: rp.distance_meters ?? 0
    })),
    total_distance_meters: totalDistance,
    estimated_total_time_minutes: totalTime,
  }
}

/**
 * Search routes by type (Traditional vs Modernized PUJ)
 * Counts only FORWARD direction for accurate display
 */
export async function getRoutesByType(routeType: RouteType): Promise<RouteSearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('routes')
    .select('id, route_code, route_name, route_type, origin, destination, base_fare, stop_settings(id)')
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
    checkpoint_count: Array.isArray(route.stop_settings) ? route.stop_settings.length : 0,
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

/**
 * Find routes passing through a specific checkpoint
 * Useful for "What jeepneys pass here?" feature
 */
export async function getRoutesPassingCheckpoint(checkpointId: string): Promise<RouteSearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stop_settings')
    .select(`
      route:routes!inner(
        id,
        route_code,
        route_name,
        route_type,
        origin,
        destination,
        base_fare,
        is_active
      )
    `)
    .eq('checkpoint_id', checkpointId)
    .eq('route.is_active', true)

  if (error) throw new Error(`Failed to fetch routes for checkpoint: ${error.message}`)

  // Deduplicate routes (a route may pass checkpoint twice - forward and return)
  const uniqueRoutes = new Map<string, RouteSearchResult>()
  for (const item of data ?? []) {
    const route = item.route as unknown as Route
    if (!uniqueRoutes.has(route.id)) {
      uniqueRoutes.set(route.id, {
        id: route.id,
        route_code: route.route_code,
        route_name: route.route_name,
        route_type: route.route_type,
        origin: route.origin,
        destination: route.destination,
        base_fare: Number(route.base_fare),
        checkpoint_count: 0, // Not needed for this query
      })
    }
  }

  return Array.from(uniqueRoutes.values()).sort((a, b) => a.route_code.localeCompare(b.route_code))
}
