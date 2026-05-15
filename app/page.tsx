import { RouteExplorer } from '@/components/route-explorer'
import { Bus, MapPin, Zap, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
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
                  <span>80 Barangays</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Traditional &amp; Modern PUJ</span>
                </div>
              </div>
              <Link 
                href="/admin"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
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
