import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/auth/types'
import { validateCredentials, createSession } from '@/lib/auth/utils'

export async function POST(request: Request) {
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
    
    // Validate credentials against database
    const validation = await validateCredentials(username, password)
    if (!validation.valid || !validation.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Create session in database
    const session = await createSession(validation.userId, username)
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: session.token,
      session: {
        username: session.username,
        isAdmin: session.isAdmin,
        expiresAt: session.expiresAt
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
