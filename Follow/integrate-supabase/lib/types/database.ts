// NaviCebu Database Types
// Generated from case study schema - Cebu City Jeepney Route Mapping System

export type RouteType = 'TRADITIONAL' | 'MODERNIZED'
export type CheckpointType = 'LANDMARK' | 'TERMINAL' | 'LOADING_ZONE' | 'INTERSECTION'
export type Direction = 'FORWARD' | 'RETURN'

export interface Coordinates {
  lat: number
  lng: number
}

export interface OperatingHours {
  start: string // HH:mm format
  end: string
}

// Base database row types
export interface Barangay {
  id: string
  name: string
  district: string | null
  coordinates: Coordinates | null
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  route_code: string
  route_name: string
  route_type: RouteType
  origin: string
  destination: string
  base_fare: number
  is_active: boolean
  operating_hours: OperatingHours
  created_at: string
  updated_at: string
}

export interface Checkpoint {
  id: string
  name: string
  barangay_id: string | null
  checkpoint_type: CheckpointType
  coordinates: Coordinates
  description: string | null
  radius_meters: number
  created_at: string
  updated_at: string
}

export interface RoutePath {
  id: string
  route_id: string
  checkpoint_id: string
  sequence_order: number
  direction: Direction
  estimated_time_minutes: number | null
  distance_meters: number | null
  created_at: string
}

// Extended types with relations (prevents N+1 queries)
export interface CheckpointWithBarangay extends Checkpoint {
  barangay: Barangay | null
}

export interface RoutePathWithCheckpoint extends RoutePath {
  checkpoint: CheckpointWithBarangay
}

export interface RouteWithPath extends Route {
  route_paths: RoutePathWithCheckpoint[]
}

// API Response types
export interface RouteSearchResult {
  id: string
  route_code: string
  route_name: string
  route_type: RouteType
  origin: string
  destination: string
  base_fare: number
  checkpoint_count: number
}

export interface RouteDetailResponse {
  route: Route
  checkpoints: {
    forward: CheckpointWithBarangay[]
    return: CheckpointWithBarangay[]
  }
  total_distance_meters: number
  estimated_total_time_minutes: number
}

// Insert types (omit auto-generated fields)
export type BarangayInsert = Omit<Barangay, 'id' | 'created_at' | 'updated_at'>
export type RouteInsert = Omit<Route, 'id' | 'created_at' | 'updated_at'>
export type CheckpointInsert = Omit<Checkpoint, 'id' | 'created_at' | 'updated_at'>
export type RoutePathInsert = Omit<RoutePath, 'id' | 'created_at'>

// Update types (all fields optional except id)
export type BarangayUpdate = Partial<BarangayInsert>
export type RouteUpdate = Partial<RouteInsert>
export type CheckpointUpdate = Partial<CheckpointInsert>
export type RoutePathUpdate = Partial<RoutePathInsert>
