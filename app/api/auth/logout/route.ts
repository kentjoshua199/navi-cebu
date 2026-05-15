import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth/utils'

export async function POST(): Promise<NextResponse> {
  await clearSession()
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}
