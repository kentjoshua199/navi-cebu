'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertCircle } from 'lucide-react'

interface RouteSchedulesProps {
  firstTripTime: string
  lastTripTime: string
  peakHours: { start: string; end: string; evening?: string; evening_end?: string }
  operatingDays: string[]
}

export function RouteSchedules({
  firstTripTime,
  lastTripTime,
  peakHours,
  operatingDays,
}: RouteSchedulesProps) {
  const isPeakHours = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    return (
      (currentTime >= peakHours.start && currentTime <= peakHours.end) ||
      (peakHours.evening && currentTime >= peakHours.evening && currentTime <= peakHours.evening_end)
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">First Trip</p>
            <p className="text-lg font-semibold">{firstTripTime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Trip</p>
            <p className="text-lg font-semibold">{lastTripTime}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Peak Hours</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={isPeakHours() ? 'default' : 'secondary'}>
                {peakHours.start} - {peakHours.end}
              </Badge>
              <span className="text-xs text-muted-foreground">Morning</span>
            </div>
            {peakHours.evening && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {peakHours.evening} - {peakHours.evening_end}
                </Badge>
                <span className="text-xs text-muted-foreground">Evening</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Operating Days</p>
          <p className="text-sm">{operatingDays.join(', ')}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg flex gap-2 text-sm border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">Wait times may be longer during peak hours</p>
            <p className="text-xs text-amber-800 dark:text-amber-200">Expect more passengers during {peakHours.start}-{peakHours.end}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
