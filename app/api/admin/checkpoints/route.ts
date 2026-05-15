import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { checkpointSchema } from '@/lib/validations/admin'

// GET all checkpoints for admin
export async function GET() {
  try {
    await requireAdmin()
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('checkpoints')
      .select(`
        *,
        barangay:barangays(id, name)
      `)
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching checkpoints:', error)
    return NextResponse.json({ error: 'Failed to fetch checkpoints' }, { status: 500 })
  }
}

// POST create new checkpoint
export async function POST(request: Request) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const parsed = checkpointSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('checkpoints')
      .insert(parsed.data)
      .select(`
        *,
        barangay:barangays(id, name)
      `)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating checkpoint:', error)
    return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 })
  }
}
