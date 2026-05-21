'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Button } from '@/components/ui/button'
import { MapPin, Crosshair } from 'lucide-react'

interface MapPinPickerProps {
  coordinates: { lat: number; lng: number }
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void
  className?: string
}

export function MapPinPicker({ coordinates, onCoordinatesChange, className = '' }: MapPinPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const marker = useRef<maplibregl.Marker | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || !isExpanded) return

    // Initialize map centered on Cebu City or current coordinates
    const center: [number, number] = [
      coordinates.lng || 123.8854,
      coordinates.lat || 10.3157
    ]

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
      center: center,
      zoom: 15
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Create draggable marker
    const el = document.createElement('div')
    el.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24c0-8.836-7.164-16-16-16z" fill="#ef4444"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `
    el.style.cssText = `
      cursor: grab;
      transform: translate(-50%, -100%);
    `

    marker.current = new maplibregl.Marker({
      element: el,
      draggable: true
    })
      .setLngLat(center)
      .addTo(map.current)

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat()
      if (lngLat) {
        onCoordinatesChange({
          lat: Math.round(lngLat.lat * 10000) / 10000,
          lng: Math.round(lngLat.lng * 10000) / 10000
        })
      }
    })

    // Also allow clicking on map to move marker
    map.current.on('click', (e) => {
      if (marker.current) {
        marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat])
        onCoordinatesChange({
          lat: Math.round(e.lngLat.lat * 10000) / 10000,
          lng: Math.round(e.lngLat.lng * 10000) / 10000
        })
      }
    })

    // Change cursor on map hover
    map.current.getCanvas().style.cursor = 'crosshair'

    return () => {
      marker.current?.remove()
      map.current?.remove()
      map.current = null
      marker.current = null
    }
  }, [isExpanded])

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (marker.current && coordinates.lat && coordinates.lng) {
      marker.current.setLngLat([coordinates.lng, coordinates.lat])
    }
  }, [coordinates.lat, coordinates.lng])

  const handleCenterOnCoordinates = () => {
    if (map.current && coordinates.lat && coordinates.lng) {
      map.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 16
      })
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          <MapPin className="mr-2 h-4 w-4" />
          {isExpanded ? 'Hide Map' : 'Pick Location on Map'}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="relative rounded-lg overflow-hidden border">
          <div ref={mapContainer} className="w-full h-[250px]" />
          
          {/* Instructions overlay */}
          <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm text-xs max-w-[200px]">
            <p className="font-medium text-foreground">Click or drag to set location</p>
            <p className="text-muted-foreground mt-1">
              Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
            </p>
          </div>

          {/* Center button */}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 shadow-md"
            onClick={handleCenterOnCoordinates}
            title="Center on coordinates"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
