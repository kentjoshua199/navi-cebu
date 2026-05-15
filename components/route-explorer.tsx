'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, MapPin, Bus, Clock, ArrowRight, Loader2 } from 'lucide-react'
import type { RouteSearchResult, RouteDetailResponse } from '@/lib/types/database'
import { RouteMap } from '@/components/route-map'

export function RouteExplorer() {
  const [routes, setRoutes] = useState<RouteSearchResult[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteDetailResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [activeType, setActiveType] = useState<'all' | 'TRADITIONAL' | 'MODERNIZED'>('all')
  const [error, setError] = useState<string | null>(null)

  // Fetch all routes on mount
  useEffect(() => {
    fetchRoutes()
  }, [activeType])

  async function fetchRoutes() {
    setIsLoading(true)
    setError(null)
    try {
      const params = activeType !== 'all' ? `?type=${activeType}` : ''
      const response = await fetch(`/api/routes${params}`)
      if (!response.ok) throw new Error('Failed to fetch routes')
      const json = await response.json()
      setRoutes(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routes')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchRouteDetail(routeCode: string) {
    setIsLoadingDetail(true)
    try {
      const response = await fetch(`/api/routes/${routeCode}`)
      if (!response.ok) throw new Error('Failed to fetch route details')
      const json = await response.json()
      setSelectedRoute(json.data)
    } catch (err) {
      console.error('Failed to load route details:', err)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Filter routes by search query
  const filteredRoutes = routes.filter(route => {
    const query = searchQuery.toLowerCase()
    return (
      route.route_code.toLowerCase().includes(query) ||
      route.route_name.toLowerCase().includes(query) ||
      route.origin.toLowerCase().includes(query) ||
      route.destination.toLowerCase().includes(query)
    )
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Routes List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes, landmarks, or destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as typeof activeType)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="TRADITIONAL">Traditional</TabsTrigger>
              <TabsTrigger value="MODERNIZED">Modernized</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No routes found matching your search.
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <Card 
                  key={route.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRoute?.route.route_code === route.route_code 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => fetchRouteDetail(route.route_code)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={route.route_type === 'MODERNIZED' ? 'default' : 'secondary'}
                          className="text-sm font-bold"
                        >
                          {route.route_code}
                        </Badge>
                        <CardTitle className="text-base">{route.route_name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {route.route_type === 'MODERNIZED' ? 'Modern PUJ' : 'Traditional'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{route.origin}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>{route.destination}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        {route.checkpoint_count} stops
                      </span>
                      <span className="font-semibold text-primary">
                        PHP {route.base_fare.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Route Detail Panel */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Route Details
            </CardTitle>
            <CardDescription>
              Click a route to see its full path
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : selectedRoute ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg font-bold px-3 py-1">
                    {selectedRoute.route.route_code}
                  </Badge>
                  <span className="font-medium">{selectedRoute.route.route_name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedRoute.estimated_total_time_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{(selectedRoute.total_distance_meters / 1000).toFixed(1)} km</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className="text-muted-foreground">Route Type:</span>
                    <Badge variant={selectedRoute.route.route_type === 'TRADITIONAL' ? 'default' : 'secondary'}>
                      {selectedRoute.route.route_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Stops:</span>
                    <Badge variant="outline">{selectedRoute.checkpoints.forward.length} forward</Badge>
                    {selectedRoute.checkpoints.return.length > 0 && (
                      <Badge variant="outline">{selectedRoute.checkpoints.return.length} return</Badge>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400">●</span>
                      Forward Route: {selectedRoute.route.origin} → {selectedRoute.route.destination}
                    </h4>
                    <div className="space-y-2">
                      {selectedRoute.checkpoints.forward.map((checkpoint, index) => (
                        <div 
                          key={checkpoint.id} 
                          className="flex items-start gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : 
                              index === selectedRoute.checkpoints.forward.length - 1 ? 'bg-red-500' : 
                              'bg-primary'
                            }`} />
                            {index < selectedRoute.checkpoints.forward.length - 1 && (
                              <div className="w-0.5 h-8 bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="font-medium text-sm">{checkpoint.name}</p>
                            {checkpoint.barangay && (
                              <p className="text-xs text-muted-foreground">
                                {checkpoint.barangay.name}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {checkpoint.checkpoint_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show Return Trip if available */}
                  {selectedRoute.checkpoints.return.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">●</span>
                        Return Route: {selectedRoute.route.destination} → {selectedRoute.route.origin}
                      </h4>
                      <div className="space-y-2">
                        {selectedRoute.checkpoints.return.map((checkpoint, index) => (
                          <div 
                            key={checkpoint.id} 
                            className="flex items-start gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-blue-500' : 
                                index === selectedRoute.checkpoints.return.length - 1 ? 'bg-orange-500' : 
                                'bg-primary'
                              }`} />
                              {index < selectedRoute.checkpoints.return.length - 1 && (
                                <div className="w-0.5 h-8 bg-border" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="font-medium text-sm">{checkpoint.name}</p>
                              {checkpoint.barangay && (
                                <p className="text-xs text-muted-foreground">
                                  {checkpoint.barangay.name}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {checkpoint.checkpoint_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Fare</span>
                    <span className="text-xl font-bold text-primary">
                      PHP {selectedRoute.route.base_fare.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Route Map */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Route Map</h4>
                  <RouteMap 
                    checkpoints={selectedRoute.checkpoints.forward}
                    routeCode={selectedRoute.route.route_code}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a route to view its details and path.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
