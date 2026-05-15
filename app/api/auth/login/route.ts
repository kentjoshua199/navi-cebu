import { NextResponse } from 'next/server'
import { loginSchema, type AuthResponse } from '@/lib/auth/types'
import { validateCredentials, createSession, setSessionCookie } from '@/lib/auth/utils'

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
    
    // Create and set session
    const session = createSession(username)
    await setSessionCookie(session)
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      session,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
