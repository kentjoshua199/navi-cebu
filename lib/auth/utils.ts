import { cookies } from 'next/headers'
import type { AdminSession } from './types'

// Hardcoded admin credentials as per user request
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'Admin',
}

const SESSION_COOKIE_NAME = 'navicebu_admin_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}

export function createSession(username: string): AdminSession {
  return {
    username,
    isAdmin: true,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
}

export async function setSessionCookie(session: AdminSession): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const session: AdminSession = JSON.parse(sessionCookie.value)
    
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
