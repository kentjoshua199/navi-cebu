import { createClient } from '@/lib/supabase/server'

export interface AdminSession {
  id: string
  userId: string
  username: string
  token: string
  expiresAt: number
  isAdmin: boolean
}

// Generate a random token
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function validateCredentials(username: string, password: string): Promise<{ valid: boolean; userId?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, password_hash, is_active')
    .eq('username', username.toLowerCase())
    .eq('is_active', true)
    .single()
  
  if (error || !data) {
    return { valid: false }
  }
  
  // Simple password check (case-insensitive for demo)
  if (data.password_hash.toLowerCase() === password.toLowerCase()) {
    return { valid: true, userId: data.id }
  }
  
  return { valid: false }
}

export async function createSession(userId: string, username: string): Promise<AdminSession> {
  const supabase = await createClient()
  const token = generateToken()
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  
  // Clean up any existing sessions for this user
  await supabase
    .from('admin_sessions')
    .delete()
    .eq('user_id', userId)
  
  const { data, error } = await supabase
    .from('admin_sessions')
    .insert({
      user_id: userId,
      token: token,
      expires_at: new Date(expiresAt).toISOString()
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Failed to create session:', error)
    throw new Error('Failed to create session')
  }
  
  return {
    id: data.id,
    userId,
    username,
    token,
    expiresAt,
    isAdmin: true
  }
}

export async function getSessionByToken(token: string): Promise<AdminSession | null> {
  if (!token) return null
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('admin_sessions')
    .select(`
      id,
      user_id,
      token,
      expires_at,
      admin_users!inner (
        username
      )
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (error || !data) {
    return null
  }
  
  const adminUser = data.admin_users as unknown as { username: string }
  
  return {
    id: data.id,
    userId: data.user_id,
    username: adminUser.username,
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
    isAdmin: true
  }
}

export async function deleteSessionByToken(token: string): Promise<void> {
  if (!token) return
  
  const supabase = await createClient()
  
  await supabase
    .from('admin_sessions')
    .delete()
    .eq('token', token)
}

// Middleware function to require admin authentication for API routes
// Uses Supabase Auth instead of custom token-based auth
export async function requireAdmin(request: Request): Promise<{ session: AdminSession | null; error: Response | null }> {
  const supabase = await createClient()
  
  // Check for Supabase session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      session: null,
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  // Return a compatible session object
  return {
    session: {
      id: user.id,
      userId: user.id,
      username: user.email || 'admin',
      token: '',
      expiresAt: Date.now() + 86400000,
      isAdmin: true
    },
    error: null
  }
}
