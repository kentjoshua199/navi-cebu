import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { routeSchema } from '@/lib/validations/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single route
export async function GET(request: Request, { params }: RouteParams) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching route:', error)
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 })
  }
}

// PUT update route
export async function PUT(request: Request, { params }: RouteParams) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    
    const body = await request.json()
    const parsed = routeSchema.partial().safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('routes')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Route code already exists' },
          { status: 409 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 })
  }
}

// DELETE route
export async function DELETE(request: Request, { params }: RouteParams) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}
