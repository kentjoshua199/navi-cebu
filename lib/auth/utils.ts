import { cookies } from 'next/headers'
import type { AdminSession } from './types'

// Hardcoded admin credentials as per user request (case-insensitive)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
}

export const SESSION_COOKIE_NAME = 'navicebu_admin_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export function validateCredentials(username: string, password: string): boolean {
  // Case-insensitive comparison for both username and password
  return username.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() && 
         password.toLowerCase() === ADMIN_CREDENTIALS.password.toLowerCase()
}

export function createSession(username: string): AdminSession {
  return {
    username,
    isAdmin: true,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    // Decode the URL-encoded cookie value
    const decodedValue = decodeURIComponent(sessionCookie.value)
    const session: AdminSession = JSON.parse(decodedValue)
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return null
    }
    
    return session
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession()
  
  if (!session || !session.isAdmin) {
    throw new Error('Unauthorized')
  }
  
  return session
}
