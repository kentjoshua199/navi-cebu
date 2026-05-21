'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, Clock, DollarSign, Users } from 'lucide-react'

interface RouteData {
  id: string
  route_code: string
  route_name: string
  route_type: string
  origin: string
  destination: string
  base_fare: number
  fare_per_km: number
  checkpoint_count: number
  total_distance_meters: number
  estimated_total_time_minutes: number
  first_trip_time: string
  last_trip_time: string
}

interface RouteComparatorProps {
  routes: RouteData[]
}

export function RouteComparator({ routes }: RouteComparatorProps) {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])

  const toggleRoute = (routeId: string) => {
    if (selectedRoutes.includes(routeId)) {
      setSelectedRoutes(selectedRoutes.filter(id => id !== routeId))
    } else if (selectedRoutes.length < 3) {
      setSelectedRoutes([...selectedRoutes, routeId])
    }
  }

  const comparedRoutes = routes.filter(r => selectedRoutes.includes(r.id))

  if (selectedRoutes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compare Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Select up to 3 routes to compare</p>
          <div className="grid gap-3">
            {routes.slice(0, 6).map(route => (
              <button
                key={route.id}
                onClick={() => toggleRoute(route.id)}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold">{route.route_code}</p>
                  <p className="text-sm text-muted-foreground">{route.route_name}</p>
                </div>
                <Badge variant="outline">{route.route_type}</Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {comparedRoutes.map(route => (
          <Badge
            key={route.id}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => toggleRoute(route.id)}
          >
            {route.route_code} ✕
          </Badge>
        ))}
        {selectedRoutes.length < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const available = routes.find(r => !selectedRoutes.includes(r.id))
              if (available) toggleRoute(available.id)
            }}
          >
            + Add Route
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparedRoutes.map(route => (
          <Card key={route.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{route.route_code}</CardTitle>
                  <p className="text-sm text-muted-foreground">{route.route_name}</p>
                </div>
                <Badge>{route.route_type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Route</p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{route.origin} → {route.destination}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Stops</p>
                  <p className="font-semibold">{route.checkpoint_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-semibold">{(route.total_distance_meters / 1000).toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-semibold">{route.estimated_total_time_minutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fare</p>
                  <p className="font-semibold">₱{route.base_fare}</p>
                </div>
              </div>

              <div className="border-t pt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{route.first_trip_time} - {route.last_trip_time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
