import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { barangaySchema } from '@/lib/validations/admin'

// GET all barangays for admin
export async function GET(request: Request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('barangays')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching barangays:', error)
    return NextResponse.json({ error: 'Failed to fetch barangays' }, { status: 500 })
  }
}

// POST create new barangay
export async function POST(request: Request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const parsed = barangaySchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('barangays')
      .insert(parsed.data)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Barangay name already exists' },
          { status: 409 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating barangay:', error)
    return NextResponse.json({ error: 'Failed to create barangay' }, { status: 500 })
  }
}
