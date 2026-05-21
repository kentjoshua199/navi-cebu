import { NextResponse } from 'next/server'
import { deleteSessionByToken } from '@/lib/auth/utils'

export async function POST(request: Request): Promise<NextResponse> {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    await deleteSessionByToken(token)
  }
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}
