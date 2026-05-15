import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/utils'

export async function GET(): Promise<NextResponse> {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  
  return NextResponse.json({
    authenticated: true,
    session,
  })
}
