import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bus, MapPin, Map, Activity } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const supabase = await createClient()
  
  const [routes, checkpoints, barangays] = await Promise.all([
    supabase.from('routes').select('id', { count: 'exact', head: true }),
    supabase.from('checkpoints').select('id', { count: 'exact', head: true }),
    supabase.from('barangays').select('id', { count: 'exact', head: true }),
  ])
  
  return {
    routes: routes.count || 0,
    checkpoints: checkpoints.count || 0,
    barangays: barangays.count || 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Total Routes',
      value: stats.routes,
      description: 'Active jeepney routes',
      icon: Bus,
      href: '/admin/routes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Checkpoints',
      value: stats.checkpoints,
      description: 'Landmarks and stops',
      icon: MapPin,
      href: '/admin/checkpoints',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Barangays',
      value: stats.barangays,
      description: 'Covered areas',
      icon: Map,
      href: '/admin/barangays',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the NaviCebu admin dashboard. Manage routes, checkpoints, and barangays.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.title} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks for managing NaviCebu data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/admin/routes"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <Bus className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Routes</p>
                <p className="text-sm text-muted-foreground">Add, edit, or remove jeepney routes</p>
              </div>
            </Link>
            <Link
              href="/admin/checkpoints"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Checkpoints</p>
                <p className="text-sm text-muted-foreground">Configure landmarks and stops</p>
              </div>
            </Link>
            <Link
              href="/admin/barangays"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <Map className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Barangays</p>
                <p className="text-sm text-muted-foreground">Update area information</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
