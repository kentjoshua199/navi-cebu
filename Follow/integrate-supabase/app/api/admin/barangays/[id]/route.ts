import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { barangaySchema } from '@/lib/validations/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT update barangay
export async function PUT(request: Request, { params }: RouteParams) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    
    const body = await request.json()
    const parsed = barangaySchema.partial().safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('barangays')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Barangay not found' }, { status: 404 })
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Barangay name already exists' },
          { status: 409 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating barangay:', error)
    return NextResponse.json({ error: 'Failed to update barangay' }, { status: 500 })
  }
}

// DELETE barangay
export async function DELETE(request: Request, { params }: RouteParams) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('barangays')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting barangay:', error)
    return NextResponse.json({ error: 'Failed to delete barangay' }, { status: 500 })
  }
}
