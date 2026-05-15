'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

const TOKEN_KEY = 'navicebu_admin_token'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem(TOKEN_KEY)
      
      if (!token) {
        setIsAuthenticated(false)
        window.location.href = '/admin/login'
        return
      }
      
      try {
        const response = await fetch('/api/auth/session', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUsername(data.session?.username || 'Admin')
        } else {
          localStorage.removeItem(TOKEN_KEY)
          setIsAuthenticated(false)
          window.location.href = '/admin/login'
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setIsAuthenticated(false)
        window.location.href = '/admin/login'
      }
    }
    checkAuth()
  }, [])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show nothing (redirect is happening)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader username={username} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
