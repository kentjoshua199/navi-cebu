'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Route {
  id: string
  route_code: string
  route_name: string
  route_type: 'TRADITIONAL' | 'MODERNIZED'
  origin: string
  destination: string
  base_fare: number
  is_active: boolean
  created_at: string
}

const initialFormData = {
  route_code: '',
  route_name: '',
  route_type: 'TRADITIONAL' as 'TRADITIONAL' | 'MODERNIZED',
  origin: '',
  destination: '',
  base_fare: 13,
  is_active: true,
}

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchRoutes()
  }, [])

  async function fetchRoutes() {
    try {
      const response = await fetch('/api/admin/routes', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch routes')
      const { data } = await response.json()
      setRoutes(data || [])
    } catch (error) {
      toast.error('Failed to load routes')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateDialog() {
    setSelectedRoute(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  function openEditDialog(route: Route) {
    setSelectedRoute(route)
    setFormData({
      route_code: route.route_code,
      route_name: route.route_name,
      route_type: route.route_type,
      origin: route.origin,
      destination: route.destination,
      base_fare: route.base_fare,
      is_active: route.is_active,
    })
    setIsDialogOpen(true)
  }

  function openDeleteDialog(route: Route) {
    setSelectedRoute(route)
    setIsDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = selectedRoute
        ? `/api/admin/routes/${selectedRoute.id}`
        : '/api/admin/routes'
      const method = selectedRoute ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save route')
      }

      toast.success(selectedRoute ? 'Route updated' : 'Route created')
      setIsDialogOpen(false)
      fetchRoutes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save route')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedRoute) return

    try {
      const response = await fetch(`/api/admin/routes/${selectedRoute.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete route')

      toast.success('Route deleted')
      setIsDeleteDialogOpen(false)
      fetchRoutes()
    } catch (error) {
      toast.error('Failed to delete route')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
          <p className="text-muted-foreground">Manage jeepney routes in Cebu City</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No routes found. Click &quot;Add Route&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-mono font-medium">{route.route_code}</TableCell>
                  <TableCell>{route.route_name}</TableCell>
                  <TableCell>
                    <Badge variant={route.route_type === 'MODERNIZED' ? 'default' : 'secondary'}>
                      {route.route_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>P{route.base_fare.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={route.is_active ? 'default' : 'outline'}>
                      {route.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(route)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(route)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
            <DialogDescription>
              {selectedRoute ? 'Update the route details below.' : 'Fill in the details to create a new route.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="route_code">Route Code</Label>
                  <Input
                    id="route_code"
                    value={formData.route_code}
                    onChange={(e) => setFormData({ ...formData, route_code: e.target.value })}
                    placeholder="e.g., 01K"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route_type">Type</Label>
                  <Select
                    value={formData.route_type}
                    onValueChange={(value: 'TRADITIONAL' | 'MODERNIZED') =>
                      setFormData({ ...formData, route_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRADITIONAL">Traditional</SelectItem>
                      <SelectItem value="MODERNIZED">Modernized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="route_name">Route Name</Label>
                <Input
                  id="route_name"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  placeholder="e.g., Lahug - Colon via JY Square"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Starting point"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="End point"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_fare">Base Fare (PHP)</Label>
                  <Input
                    id="base_fare"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_fare}
                    onChange={(e) => setFormData({ ...formData, base_fare: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <span className="text-sm">{formData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete route &quot;{selectedRoute?.route_code}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
