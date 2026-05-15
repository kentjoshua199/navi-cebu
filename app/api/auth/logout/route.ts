import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/utils'

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
  
  // Clear the session cookie by setting it with maxAge 0
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  return response
}
