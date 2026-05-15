import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { checkpointSchema } from '@/lib/validations/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single checkpoint
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('checkpoints')
      .select(`
        *,
        barangay:barangays(id, name)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching checkpoint:', error)
    return NextResponse.json({ error: 'Failed to fetch checkpoint' }, { status: 500 })
  }
}

// PUT update checkpoint
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    
    const body = await request.json()
    const parsed = checkpointSchema.partial().safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('checkpoints')
      .update(parsed.data)
      .eq('id', id)
      .select(`
        *,
        barangay:barangays(id, name)
      `)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating checkpoint:', error)
    return NextResponse.json({ error: 'Failed to update checkpoint' }, { status: 500 })
  }
}

// DELETE checkpoint
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('checkpoints')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting checkpoint:', error)
    return NextResponse.json({ error: 'Failed to delete checkpoint' }, { status: 500 })
  }
}
