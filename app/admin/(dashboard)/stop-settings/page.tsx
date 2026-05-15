'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface StopSetting {
  id: string
  checkpoint_id: string
  route_id: string
  stop_order: number
  is_mandatory: boolean
  stop_type: string
  waiting_time_minutes: number
  route?: { route_code: string; route_name: string }
  checkpoint?: { name: string }
}

interface Route {
  id: string
  route_code: string
  route_name: string
}

interface Checkpoint {
  id: string
  name: string
}

export default function StopSettingsPage() {
  const [stopSettings, setStopSettings] = useState<StopSetting[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    route_id: '',
    checkpoint_id: '',
    stop_order: 1,
    is_mandatory: false,
    stop_type: 'REGULAR',
    waiting_time_minutes: 2,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchStopSettings()
    fetchRoutes()
    fetchCheckpoints()
  }, [])

  async function fetchStopSettings() {
    try {
      const response = await fetch('/api/admin/stop-settings', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const { data } = await response.json()
      setStopSettings(data || [])
    } catch (error) {
      toast.error('Failed to load stop settings')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchRoutes() {
    try {
      const response = await fetch('/api/admin/routes', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch routes')
      const { data } = await response.json()
      setRoutes(data || [])
    } catch (error) {
      console.error('Failed to fetch routes:', error)
    }
  }

  async function fetchCheckpoints() {
    try {
      const response = await fetch('/api/admin/checkpoints', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch checkpoints')
      const { data } = await response.json()
      setCheckpoints(data || [])
    } catch (error) {
      console.error('Failed to fetch checkpoints:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/stop-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success('Stop setting created')
      setFormData({
        route_id: '',
        checkpoint_id: '',
        stop_order: 1,
        is_mandatory: false,
        stop_type: 'REGULAR',
        waiting_time_minutes: 2,
      })
      setIsDialogOpen(false)
      fetchStopSettings()
    } catch (error) {
      toast.error('Failed to create stop setting')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this stop setting?')) return

    try {
      const response = await fetch(`/api/admin/stop-settings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Stop setting deleted')
      fetchStopSettings()
    } catch (error) {
      toast.error('Failed to delete stop setting')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stop Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage stop configurations for routes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stop Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Stop Setting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Select value={formData.route_id} onValueChange={(value) => setFormData({ ...formData, route_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.route_code} - {route.route_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkpoint">Checkpoint</Label>
                <Select value={formData.checkpoint_id} onValueChange={(value) => setFormData({ ...formData, checkpoint_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select checkpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkpoints.map((checkpoint) => (
                      <SelectItem key={checkpoint.id} value={checkpoint.id}>
                        {checkpoint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Stop Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.stop_order}
                    onChange={(e) => setFormData({ ...formData, stop_order: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waiting">Waiting Time (min)</Label>
                  <Input
                    id="waiting"
                    type="number"
                    value={formData.waiting_time_minutes}
                    onChange={(e) => setFormData({ ...formData, waiting_time_minutes: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Stop Type</Label>
                <Select value={formData.stop_type} onValueChange={(value) => setFormData({ ...formData, stop_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                    <SelectItem value="TERMINAL">Terminal</SelectItem>
                    <SelectItem value="FLAG_DOWN">Flag Down Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="mandatory" className="font-normal">Mandatory Stop</Label>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stop Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {stopSettings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No stop settings found</p>
          ) : (
            <div className="space-y-2">
              {stopSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {setting.route?.route_code} - {setting.checkpoint?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={setting.is_mandatory ? 'default' : 'outline'} className="text-xs">
                        {setting.stop_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Stop #{setting.stop_order} • {setting.waiting_time_minutes}min wait
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(setting.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
