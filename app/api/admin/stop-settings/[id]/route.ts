import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('stop_settings')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating stop setting:', error)
    return NextResponse.json({ error: 'Failed to update stop setting' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('stop_settings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting stop setting:', error)
    return NextResponse.json({ error: 'Failed to delete stop setting' }, { status: 500 })
  }
}
