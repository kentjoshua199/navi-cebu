import { RouteExplorer } from '@/components/route-explorer'
import { Bus, MapPin, Zap, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { getStatistics } from '@/lib/queries/routes'

export default async function HomePage() {
  let stats = { barangayCount: 0, totalRoutes: 0, traditionalRoutes: 0, modernizedRoutes: 0 }
  
  try {
    stats = await getStatistics()
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Bus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NaviCebu</h1>
                <p className="text-sm text-muted-foreground">Cebu City Jeepney Route Finder</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{stats.barangayCount} Barangays</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  <span>{stats.traditionalRoutes} Traditional & {stats.modernizedRoutes} Modern Routes</span>
                </div>
              </div>
              <ThemeToggle />
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/login">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <RouteExplorer />
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>NaviCebu - A relational database system for Cebu City jeepney routes</p>
            <p>Case Study Implementation - Production-Grade Backend</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
