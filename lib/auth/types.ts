import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginCredentials = z.infer<typeof loginSchema>

export interface AdminSession {
  username: string
  isAdmin: boolean
  expiresAt: number
}

export interface AuthResponse {
  success: boolean
  message: string
  session?: AdminSession
}
