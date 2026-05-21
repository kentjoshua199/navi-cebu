'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { CheckpointWithBarangay } from '@/lib/types/database'

interface RouteMapProps {
  checkpoints: CheckpointWithBarangay[]
  routeCode: string
  className?: string
}

export function RouteMap({ checkpoints, routeCode, className = '' }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current || checkpoints.length === 0) return

    // Clean up previous markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Calculate bounds from checkpoints
    const validCheckpoints = checkpoints.filter(cp => cp.coordinates?.lat && cp.coordinates?.lng)
    
    if (validCheckpoints.length === 0) return

    // Initialize map if not already done
    if (!map.current) {
      // Center on Cebu City
      const cebuCenter: [number, number] = [123.8854, 10.3157]
      
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: cebuCenter,
        zoom: 13
      })

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    }

    // Wait for map to load before adding markers and route
    const addMarkersAndRoute = () => {
      if (!map.current) return

      // Create bounds to fit all checkpoints
      const bounds = new maplibregl.LngLatBounds()
      const routeCoordinates: [number, number][] = []

      // Add markers for each checkpoint
      validCheckpoints.forEach((checkpoint, index) => {
        const { lat, lng } = checkpoint.coordinates
        const lngLat: [number, number] = [lng, lat]
        
        bounds.extend(lngLat)
        routeCoordinates.push(lngLat)

        // Determine marker color based on position
        let color = '#3b82f6' // Primary blue
        if (index === 0) color = '#22c55e' // Green for start
        else if (index === validCheckpoints.length - 1) color = '#ef4444' // Red for end

        // Create custom marker element
        const el = document.createElement('div')
        el.className = 'route-marker'
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        `
        el.textContent = String(index + 1)

        // Create popup
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 150px;">
            <strong style="font-size: 14px;">${checkpoint.name}</strong>
            ${checkpoint.barangay ? `<p style="margin: 4px 0 0; font-size: 12px; color: #666;">${checkpoint.barangay.name}</p>` : ''}
            <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px;">
              ${checkpoint.checkpoint_type}
            </span>
          </div>
        `)

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(map.current!)

        markersRef.current.push(marker)
      })

      // Remove existing route layer and source if they exist
      if (map.current.getLayer('route-line')) {
        map.current.removeLayer('route-line')
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route')
      }

      // Add route line
      if (routeCoordinates.length > 1) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        })

        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.8
          }
        })
      }

      // Fit map to bounds with padding
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15
      })
    }

    if (map.current.loaded()) {
      addMarkersAndRoute()
    } else {
      map.current.on('load', addMarkersAndRoute)
    }

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [checkpoints, routeCode])

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  if (checkpoints.length === 0) {
    return null
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border ${className}`}>
      <div ref={mapContainer} className="w-full h-[300px]" />
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
        Route {routeCode} - {checkpoints.length} stops
      </div>
    </div>
  )
}
