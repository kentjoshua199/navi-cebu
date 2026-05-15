import { z } from 'zod'

// Barangay validation
export const barangaySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  district: z.string().max(50).optional().nullable(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional().nullable(),
})

export type BarangayInput = z.infer<typeof barangaySchema>

// Route validation
export const routeSchema = z.object({
  route_code: z.string().min(1, 'Route code is required').max(20),
  route_name: z.string().min(1, 'Route name is required').max(200),
  route_type: z.enum(['TRADITIONAL', 'MODERNIZED']),
  origin: z.string().min(1, 'Origin is required').max(200),
  destination: z.string().min(1, 'Destination is required').max(200),
  base_fare: z.number().positive('Fare must be positive').default(13.00),
  is_active: z.boolean().default(true),
  operating_hours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional().nullable(),
})

export type RouteInput = z.infer<typeof routeSchema>

// Checkpoint validation
export const checkpointSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  barangay_id: z.string().uuid().optional().nullable(),
  checkpoint_type: z.enum(['LANDMARK', 'TERMINAL', 'LOADING_ZONE', 'INTERSECTION']).default('LANDMARK'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  description: z.string().optional().nullable(),
  radius_meters: z.number().int().positive().default(500),
})

export type CheckpointInput = z.infer<typeof checkpointSchema>

// Route Path validation
export const routePathSchema = z.object({
  route_id: z.string().uuid('Invalid route ID'),
  checkpoint_id: z.string().uuid('Invalid checkpoint ID'),
  sequence_order: z.number().int().positive('Sequence must be positive'),
  direction: z.enum(['FORWARD', 'RETURN']).default('FORWARD'),
  estimated_time_minutes: z.number().int().nonnegative().optional().nullable(),
  distance_meters: z.number().int().nonnegative().optional().nullable(),
})

export type RoutePathInput = z.infer<typeof routePathSchema>
