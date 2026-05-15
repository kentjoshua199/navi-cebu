import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'

export async function GET(request: Request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError
  
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('stop_settings')
      .select(`
        *,
        route:routes(id, route_code, route_name),
        checkpoint:checkpoints(id, name)
      `)
      .order('route_id', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching stop settings:', error)
    return NextResponse.json({ error: 'Failed to fetch stop settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError
  
  try {
    const body = await request.json()
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('stop_settings')
      .insert(body)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating stop setting:', error)
    return NextResponse.json({ error: 'Failed to create stop setting' }, { status: 500 })
  }
}
