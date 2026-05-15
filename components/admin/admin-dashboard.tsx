'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  LogOut, 
  Map, 
  MapPin, 
  Building2,
  Route as RouteIcon,
  Loader2,
  Search
} from 'lucide-react'
import type { Route, Checkpoint, Barangay } from '@/lib/types/database'

interface AdminDashboardProps {
  initialRoutes: Route[]
  initialCheckpoints: (Checkpoint & { barangay?: { name: string } | null })[]
  initialBarangays: Barangay[]
  userEmail: string
}

export function AdminDashboard({ 
  initialRoutes, 
  initialCheckpoints, 
  initialBarangays,
  userEmail 
}: AdminDashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [routes, setRoutes] = useState(initialRoutes)
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints)
  const [barangays, setBarangays] = useState(initialBarangays)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const refreshData = async () => {
    const [
      { data: newRoutes },
      { data: newCheckpoints },
      { data: newBarangays }
    ] = await Promise.all([
      supabase.from('routes').select('*').order('route_code'),
      supabase.from('checkpoints').select('*, barangay:barangays(name)').order('name'),
      supabase.from('barangays').select('*').order('name')
    ])
    
    if (newRoutes) setRoutes(newRoutes)
    if (newCheckpoints) setCheckpoints(newCheckpoints)
    if (newBarangays) setBarangays(newBarangays)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">NaviCebu Admin</h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="routes" className="gap-2">
              <RouteIcon className="h-4 w-4" />
              Routes ({routes.length})
            </TabsTrigger>
            <TabsTrigger value="checkpoints" className="gap-2">
              <MapPin className="h-4 w-4" />
              Checkpoints ({checkpoints.length})
            </TabsTrigger>
            <TabsTrigger value="barangays" className="gap-2">
              <Building2 className="h-4 w-4" />
              Barangays ({barangays.length})
            </TabsTrigger>
          </TabsList>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <RoutesManager 
              routes={routes} 
              searchTerm={searchTerm}
              onRefresh={refreshData}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>

          {/* Checkpoints Tab */}
          <TabsContent value="checkpoints">
            <CheckpointsManager 
              checkpoints={checkpoints}
              barangays={barangays}
              searchTerm={searchTerm}
              onRefresh={refreshData}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>

          {/* Barangays Tab */}
          <TabsContent value="barangays">
            <BarangaysManager 
              barangays={barangays}
              searchTerm={searchTerm}
              onRefresh={refreshData}
              loading={loading}
              setLoading={setLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Routes Manager Component
function RoutesManager({ 
  routes, 
  searchTerm, 
  onRefresh,
  loading,
  setLoading
}: { 
  routes: Route[]
  searchTerm: string
  onRefresh: () => Promise<void>
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const supabase = createClient()
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredRoutes = routes.filter(route => 
    route.route_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddRoute = async (formData: FormData) => {
    setLoading(true)
    const newRoute = {
      route_code: formData.get('route_code') as string,
      route_name: formData.get('route_name') as string,
      route_type: formData.get('route_type') as 'TRADITIONAL' | 'MODERNIZED',
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      base_fare: parseFloat(formData.get('base_fare') as string) || 13.00,
      is_active: formData.get('is_active') === 'on',
    }

    const { error } = await supabase.from('routes').insert(newRoute)
    
    if (error) {
      toast.error('Failed to add route: ' + error.message)
    } else {
      toast.success('Route added successfully')
      setIsAddDialogOpen(false)
      await onRefresh()
    }
    setLoading(false)
  }

  const handleUpdateRoute = async (formData: FormData) => {
    if (!editingRoute) return
    setLoading(true)

    const updates = {
      route_code: formData.get('route_code') as string,
      route_name: formData.get('route_name') as string,
      route_type: formData.get('route_type') as 'TRADITIONAL' | 'MODERNIZED',
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      base_fare: parseFloat(formData.get('base_fare') as string) || 13.00,
      is_active: formData.get('is_active') === 'on',
    }

    const { error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', editingRoute.id)
    
    if (error) {
      toast.error('Failed to update route: ' + error.message)
    } else {
      toast.success('Route updated successfully')
      setEditingRoute(null)
      await onRefresh()
    }
    setLoading(false)
  }

  const handleDeleteRoute = async (id: string) => {
    setLoading(true)
    const { error } = await supabase.from('routes').delete().eq('id', id)
    
    if (error) {
      toast.error('Failed to delete route: ' + error.message)
    } else {
      toast.success('Route deleted successfully')
      await onRefresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Jeepney Routes</CardTitle>
          <CardDescription>Manage PUJ routes across Cebu City</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={handleAddRoute}>
              <DialogHeader>
                <DialogTitle>Add New Route</DialogTitle>
                <DialogDescription>Create a new jeepney route</DialogDescription>
              </DialogHeader>
              <RouteFormFields />
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Route
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-mono font-semibold">{route.route_code}</TableCell>
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
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editingRoute?.id === route.id} onOpenChange={(open) => !open && setEditingRoute(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditingRoute(route)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form action={handleUpdateRoute}>
                          <DialogHeader>
                            <DialogTitle>Edit Route</DialogTitle>
                            <DialogDescription>Update route details</DialogDescription>
                          </DialogHeader>
                          <RouteFormFields defaultValues={editingRoute || undefined} />
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Route?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete route {route.route_code}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRoute(route.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredRoutes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No routes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RouteFormFields({ defaultValues }: { defaultValues?: Route }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="route_code">Route Code</Label>
          <Input id="route_code" name="route_code" defaultValue={defaultValues?.route_code} placeholder="e.g., 01K" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="route_type">Type</Label>
          <Select name="route_type" defaultValue={defaultValues?.route_type || 'TRADITIONAL'}>
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
        <Input id="route_name" name="route_name" defaultValue={defaultValues?.route_name} placeholder="e.g., Lahug - Colon via JY Square" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" name="origin" defaultValue={defaultValues?.origin} placeholder="Starting point" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" name="destination" defaultValue={defaultValues?.destination} placeholder="End point" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base_fare">Base Fare (PHP)</Label>
          <Input id="base_fare" name="base_fare" type="number" step="0.01" defaultValue={defaultValues?.base_fare || 13.00} required />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch id="is_active" name="is_active" defaultChecked={defaultValues?.is_active ?? true} />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>
    </div>
  )
}

// Checkpoints Manager Component
function CheckpointsManager({ 
  checkpoints, 
  barangays,
  searchTerm, 
  onRefresh,
  loading,
  setLoading
}: { 
  checkpoints: (Checkpoint & { barangay?: { name: string } | null })[]
  barangays: Barangay[]
  searchTerm: string
  onRefresh: () => Promise<void>
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const supabase = createClient()
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredCheckpoints = checkpoints.filter(cp => 
    cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cp.barangay?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCheckpoint = async (formData: FormData) => {
    setLoading(true)
    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)
    
    const newCheckpoint = {
      name: formData.get('name') as string,
      barangay_id: formData.get('barangay_id') as string || null,
      checkpoint_type: formData.get('checkpoint_type') as Checkpoint['checkpoint_type'],
      coordinates: { lat, lng },
      description: formData.get('description') as string || null,
      radius_meters: parseInt(formData.get('radius_meters') as string) || 500,
    }

    const { error } = await supabase.from('checkpoints').insert(newCheckpoint)
    
    if (error) {
      toast.error('Failed to add checkpoint: ' + error.message)
    } else {
      toast.success('Checkpoint added successfully')
      setIsAddDialogOpen(false)
      await onRefresh()
    }
    setLoading(false)
  }

  const handleUpdateCheckpoint = async (formData: FormData) => {
    if (!editingCheckpoint) return
    setLoading(true)

    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)

    const updates = {
      name: formData.get('name') as string,
      barangay_id: formData.get('barangay_id') as string || null,
      checkpoint_type: formData.get('checkpoint_type') as Checkpoint['checkpoint_type'],
      coordinates: { lat, lng },
      description: formData.get('description') as string || null,
      radius_meters: parseInt(formData.get('radius_meters') as string) || 500,
    }

    const { error } = await supabase
      .from('checkpoints')
      .update(updates)
      .eq('id', editingCheckpoint.id)
    
    if (error) {
      toast.error('Failed to update checkpoint: ' + error.message)
    } else {
      toast.success('Checkpoint updated successfully')
      setEditingCheckpoint(null)
      await onRefresh()
    }
    setLoading(false)
  }

  const handleDeleteCheckpoint = async (id: string) => {
    setLoading(true)
    const { error } = await supabase.from('checkpoints').delete().eq('id', id)
    
    if (error) {
      toast.error('Failed to delete checkpoint: ' + error.message)
    } else {
      toast.success('Checkpoint deleted successfully')
      await onRefresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Checkpoints</CardTitle>
          <CardDescription>Manage landmarks, terminals, and stops</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Checkpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form action={handleAddCheckpoint}>
              <DialogHeader>
                <DialogTitle>Add New Checkpoint</DialogTitle>
                <DialogDescription>Create a new landmark or stop</DialogDescription>
              </DialogHeader>
              <CheckpointFormFields barangays={barangays} />
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Checkpoint
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCheckpoints.map((checkpoint) => (
              <TableRow key={checkpoint.id}>
                <TableCell className="font-medium">{checkpoint.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{checkpoint.checkpoint_type}</Badge>
                </TableCell>
                <TableCell>{checkpoint.barangay?.name || '-'}</TableCell>
                <TableCell className="font-mono text-xs">
                  {checkpoint.coordinates.lat.toFixed(4)}, {checkpoint.coordinates.lng.toFixed(4)}
                </TableCell>
                <TableCell>{checkpoint.radius_meters}m</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editingCheckpoint?.id === checkpoint.id} onOpenChange={(open) => !open && setEditingCheckpoint(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditingCheckpoint(checkpoint)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <form action={handleUpdateCheckpoint}>
                          <DialogHeader>
                            <DialogTitle>Edit Checkpoint</DialogTitle>
                            <DialogDescription>Update checkpoint details</DialogDescription>
                          </DialogHeader>
                          <CheckpointFormFields barangays={barangays} defaultValues={editingCheckpoint || undefined} />
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Checkpoint?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {checkpoint.name}. Routes using this checkpoint will be affected.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCheckpoint(checkpoint.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCheckpoints.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No checkpoints found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CheckpointFormFields({ barangays, defaultValues }: { barangays: Barangay[], defaultValues?: Checkpoint }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="e.g., SM City Cebu" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="checkpoint_type">Type</Label>
          <Select name="checkpoint_type" defaultValue={defaultValues?.checkpoint_type || 'LANDMARK'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LANDMARK">Landmark</SelectItem>
              <SelectItem value="TERMINAL">Terminal</SelectItem>
              <SelectItem value="LOADING_ZONE">Loading Zone</SelectItem>
              <SelectItem value="INTERSECTION">Intersection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="barangay_id">Barangay</Label>
          <Select name="barangay_id" defaultValue={defaultValues?.barangay_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select barangay" />
            </SelectTrigger>
            <SelectContent>
              {barangays.map((barangay) => (
                <SelectItem key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input id="lat" name="lat" type="number" step="0.0001" defaultValue={defaultValues?.coordinates.lat || 10.3157} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" name="lng" type="number" step="0.0001" defaultValue={defaultValues?.coordinates.lng || 123.8854} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="radius_meters">Radius (meters)</Label>
        <Input id="radius_meters" name="radius_meters" type="number" defaultValue={defaultValues?.radius_meters || 500} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description || ''} placeholder="Brief description of this checkpoint" />
      </div>
    </div>
  )
}

// Barangays Manager Component
function BarangaysManager({ 
  barangays, 
  searchTerm, 
  onRefresh,
  loading,
  setLoading
}: { 
  barangays: Barangay[]
  searchTerm: string
  onRefresh: () => Promise<void>
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const supabase = createClient()
  const [editingBarangay, setEditingBarangay] = useState<Barangay | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredBarangays = barangays.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.district?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddBarangay = async (formData: FormData) => {
    setLoading(true)
    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)
    
    const newBarangay = {
      name: formData.get('name') as string,
      district: formData.get('district') as string || null,
      coordinates: isNaN(lat) || isNaN(lng) ? null : { lat, lng },
    }

    const { error } = await supabase.from('barangays').insert(newBarangay)
    
    if (error) {
      toast.error('Failed to add barangay: ' + error.message)
    } else {
      toast.success('Barangay added successfully')
      setIsAddDialogOpen(false)
      await onRefresh()
    }
    setLoading(false)
  }

  const handleUpdateBarangay = async (formData: FormData) => {
    if (!editingBarangay) return
    setLoading(true)

    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)

    const updates = {
      name: formData.get('name') as string,
      district: formData.get('district') as string || null,
      coordinates: isNaN(lat) || isNaN(lng) ? null : { lat, lng },
    }

    const { error } = await supabase
      .from('barangays')
      .update(updates)
      .eq('id', editingBarangay.id)
    
    if (error) {
      toast.error('Failed to update barangay: ' + error.message)
    } else {
      toast.success('Barangay updated successfully')
      setEditingBarangay(null)
      await onRefresh()
    }
    setLoading(false)
  }

  const handleDeleteBarangay = async (id: string) => {
    setLoading(true)
    const { error } = await supabase.from('barangays').delete().eq('id', id)
    
    if (error) {
      toast.error('Failed to delete barangay: ' + error.message)
    } else {
      toast.success('Barangay deleted successfully')
      await onRefresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Barangays</CardTitle>
          <CardDescription>Manage Cebu City barangays and districts</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Barangay
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={handleAddBarangay}>
              <DialogHeader>
                <DialogTitle>Add New Barangay</DialogTitle>
                <DialogDescription>Create a new barangay entry</DialogDescription>
              </DialogHeader>
              <BarangayFormFields />
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Barangay
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBarangays.map((barangay) => (
              <TableRow key={barangay.id}>
                <TableCell className="font-medium">{barangay.name}</TableCell>
                <TableCell>
                  {barangay.district && <Badge variant="outline">{barangay.district}</Badge>}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {barangay.coordinates 
                    ? `${barangay.coordinates.lat.toFixed(4)}, ${barangay.coordinates.lng.toFixed(4)}`
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editingBarangay?.id === barangay.id} onOpenChange={(open) => !open && setEditingBarangay(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditingBarangay(barangay)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form action={handleUpdateBarangay}>
                          <DialogHeader>
                            <DialogTitle>Edit Barangay</DialogTitle>
                            <DialogDescription>Update barangay details</DialogDescription>
                          </DialogHeader>
                          <BarangayFormFields defaultValues={editingBarangay || undefined} />
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Barangay?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {barangay.name}. Checkpoints in this barangay will have their barangay reference removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteBarangay(barangay.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredBarangays.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No barangays found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function BarangayFormFields({ defaultValues }: { defaultValues?: Barangay }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="e.g., Lahug" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="district">District</Label>
        <Select name="district" defaultValue={defaultValues?.district || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="North">North</SelectItem>
            <SelectItem value="South">South</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude (optional)</Label>
          <Input id="lat" name="lat" type="number" step="0.0001" defaultValue={defaultValues?.coordinates?.lat || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude (optional)</Label>
          <Input id="lng" name="lng" type="number" step="0.0001" defaultValue={defaultValues?.coordinates?.lng || ''} />
        </div>
      </div>
    </div>
  )
}
