import { NextResponse } from 'next/server'
import { loginSchema, type AuthResponse } from '@/lib/auth/types'
import { validateCredentials, createSession, SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/lib/auth/utils'

export async function POST(request: Request): Promise<NextResponse<AuthResponse>> {
  try {
    const body = await request.json()
    
    // Validate input
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials format' },
        { status: 400 }
      )
    }
    
    const { username, password } = parsed.data
    
    // Validate credentials
    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Create session
    const session = createSession(username)
    
    // Create response with cookie set directly on the response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      session,
    })
    
    // Set cookie on the response object
    const cookieOptions = getSessionCookieOptions()
    response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(session), cookieOptions)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
