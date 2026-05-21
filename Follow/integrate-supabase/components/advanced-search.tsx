'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface Route {
  id: string
  route_code: string
  route_name: string
  route_type: string
  origin: string
  destination: string
  base_fare: number
  checkpoint_count: number
}

interface AdvancedSearchProps {
  routes: Route[]
}

export function AdvancedSearch({ routes }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'TRADITIONAL' | 'MODERNIZED'>('all')
  const [results, setResults] = useState<Route[]>(routes)

  useEffect(() => {
    const filtered = routes.filter(route => {
      const matchesQuery = !query || 
        route.route_code.toLowerCase().includes(query.toLowerCase()) ||
        route.route_name.toLowerCase().includes(query.toLowerCase()) ||
        route.origin.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())

      const matchesType = filterType === 'all' || route.route_type === filterType

      return matchesQuery && matchesType
    })

    setResults(filtered)
  }, [query, filterType, routes])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search routes, areas, or checkpoints</label>
            <Input
              placeholder="E.g., 01A, Colon, Ayala..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Route Type</label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                All Routes
              </Button>
              <Button
                variant={filterType === 'TRADITIONAL' ? 'default' : 'outline'}
                onClick={() => setFilterType('TRADITIONAL')}
              >
                Traditional
              </Button>
              <Button
                variant={filterType === 'MODERNIZED' ? 'default' : 'outline'}
                onClick={() => setFilterType('MODERNIZED')}
              >
                Modernized
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Found {results.length} route{results.length !== 1 ? 's' : ''}
        </p>
        <div className="space-y-2">
          {results.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No routes found</p>
              </CardContent>
            </Card>
          ) : (
            results.map(route => (
              <Link key={route.id} href={`/?route=${route.route_code}`}>
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{route.route_code}</p>
                        <p className="text-sm text-muted-foreground">{route.route_name}</p>
                        <p className="text-sm mt-1">{route.origin} → {route.destination}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge>{route.route_type}</Badge>
                        <div className="text-sm text-muted-foreground">
                          {route.checkpoint_count} stops • ₱{route.base_fare}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
