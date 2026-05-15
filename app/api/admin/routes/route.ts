import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { routeSchema } from '@/lib/validations/admin'

// GET all routes for admin
export async function GET(request: Request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError
  
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('route_code', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

// POST create new route
export async function POST(request: Request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError
  
  try {
    const body = await request.json()
    const parsed = routeSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('routes')
      .insert(parsed.data)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Route code already exists' },
          { status: 409 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 })
  }
}
