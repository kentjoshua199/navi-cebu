import { getActiveRoutes } from '@/lib/queries/routes'
import { RouteComparator } from '@/components/route-comparator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Compare Jeepney Routes - NaviCebu',
  description: 'Compare multiple jeepney routes side-by-side to find the best route for your journey.',
}

export default async function CompareRoutesPage() {
  const routes = await getActiveRoutes()

  // Transform routes to include necessary data
  const routesWithData = await Promise.all(
    routes.map(async (route) => {
      // Fetch full route details for comparison
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/routes/${route.route_code}`,
        { cache: 'force-cache' }
      )
      const { data } = await response.json()
      return {
        ...route,
        total_distance_meters: data?.total_distance_meters || 0,
        estimated_total_time_minutes: data?.estimated_total_time_minutes || 0,
        first_trip_time: data?.route?.first_trip_time || '05:00',
        last_trip_time: data?.route?.last_trip_time || '21:00',
      }
    })
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compare Routes</h1>
            <p className="text-muted-foreground mt-1">
              Select up to 3 routes to compare side-by-side
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <RouteComparator routes={routesWithData as any} />
        </div>
      </div>
    </main>
  )
}
