import { NextResponse } from 'next/server'
import { getSessionByToken } from '@/lib/auth/utils'

export async function GET(request: Request): Promise<NextResponse> {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  
  const session = await getSessionByToken(token)
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  
  return NextResponse.json({
    authenticated: true,
    session: {
      username: session.username,
      isAdmin: session.isAdmin,
      expiresAt: session.expiresAt
    }
  })
}
