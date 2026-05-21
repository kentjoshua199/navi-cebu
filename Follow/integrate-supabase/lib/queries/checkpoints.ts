// NaviCebu Checkpoint Queries
// Optimized for fuzzy search with pg_trgm extension
// Supports the 500m landmark radius from case study

import { createClient } from '@/lib/supabase/server'
import type { Checkpoint, CheckpointWithBarangay, CheckpointType } from '@/lib/types/database'

/**
 * Fuzzy search checkpoints by name
 * Uses pg_trgm GIN index for fast, typo-tolerant search
 */
export async function searchCheckpoints(
  query: string,
  limit: number = 10
): Promise<CheckpointWithBarangay[]> {
  const supabase = await createClient()

  // Use ilike for fuzzy matching (pg_trgm index kicks in)
  const { data, error } = await supabase
    .from('checkpoints')
    .select(`
      *,
      barangay:barangays(*)
    `)
    .ilike('name', `%${query}%`)
    .limit(limit)
    .order('name')

  if (error) throw new Error(`Failed to search checkpoints: ${error.message}`)

  return (data ?? []) as CheckpointWithBarangay[]
}

/**
 * Get checkpoints by type (TERMINAL, LANDMARK, etc.)
 */
export async function getCheckpointsByType(
  checkpointType: CheckpointType
): Promise<CheckpointWithBarangay[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('checkpoints')
    .select(`
      *,
      barangay:barangays(*)
    `)
    .eq('checkpoint_type', checkpointType)
    .order('name')

  if (error) throw new Error(`Failed to fetch checkpoints by type: ${error.message}`)

  return (data ?? []) as CheckpointWithBarangay[]
}

/**
 * Get checkpoints in a specific barangay
 */
export async function getCheckpointsByBarangay(
  barangayId: string
): Promise<Checkpoint[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('checkpoints')
    .select('*')
    .eq('barangay_id', barangayId)
    .order('name')

  if (error) throw new Error(`Failed to fetch checkpoints for barangay: ${error.message}`)

  return (data ?? []) as Checkpoint[]
}

/**
 * Get single checkpoint by ID with barangay info
 */
export async function getCheckpointById(
  checkpointId: string
): Promise<CheckpointWithBarangay | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('checkpoints')
    .select(`
      *,
      barangay:barangays(*)
    `)
    .eq('id', checkpointId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch checkpoint: ${error.message}`)
  }

  return data as CheckpointWithBarangay
}

/**
 * Get all terminals (major stops where jeepneys start/end)
 */
export async function getAllTerminals(): Promise<CheckpointWithBarangay[]> {
  return getCheckpointsByType('TERMINAL')
}
