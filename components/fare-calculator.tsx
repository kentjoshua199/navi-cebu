'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Zap } from 'lucide-react'

interface FareCalculatorProps {
  routeCode: string
  baseFare: number
  farePerKm: number
  totalDistance: number
}

export function FareCalculator({
  routeCode,
  baseFare,
  farePerKm,
  totalDistance,
}: FareCalculatorProps) {
  const [distanceKm, setDistanceKm] = useState(totalDistance / 1000)

  const calculatedFare = Math.max(
    baseFare,
    baseFare + distanceKm * farePerKm
  )

  const distanceCharge = Math.max(0, calculatedFare - baseFare)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Fare Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Distance (km)</label>
          <div className="flex gap-2 mt-2">
            <Input
              type="number"
              value={distanceKm.toFixed(1)}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
            <Button
              variant="outline"
              onClick={() => setDistanceKm(totalDistance / 1000)}
            >
              Full Route
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base Fare</span>
            <span className="font-semibold">₱{baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Distance Charge ({distanceKm.toFixed(1)} km × ₱{farePerKm}/km)</span>
            <span className="font-semibold">₱{distanceCharge.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-base font-bold">
            <span>Total Fare</span>
            <span className="text-lg text-primary">₱{calculatedFare.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex gap-2 text-sm">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-blue-700 dark:text-blue-300">
            This is an estimate. Actual fare may vary based on route variations and current rates.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
