'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { MapPinPicker } from '@/components/admin/map-pin-picker'

interface Barangay {
  id: string
  name: string
}

interface Checkpoint {
  id: string
  name: string
  barangay_id: string | null
  barangay: Barangay | null
  checkpoint_type: 'LANDMARK' | 'TERMINAL' | 'LOADING_ZONE' | 'INTERSECTION'
  coordinates: { lat: number; lng: number }
  description: string | null
  radius_meters: number
  created_at: string
}

const checkpointTypes = ['LANDMARK', 'TERMINAL', 'LOADING_ZONE', 'INTERSECTION'] as const

const initialFormData = {
  name: '',
  barangay_id: '',
  checkpoint_type: 'LANDMARK' as const,
  coordinates: { lat: 10.3157, lng: 123.8854 },
  description: '',
  radius_meters: 500,
}

export default function CheckpointsManagementPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    Promise.all([fetchCheckpoints(), fetchBarangays()])
  }, [])

  async function fetchCheckpoints() {
    try {
      const response = await fetch('/api/admin/checkpoints', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch checkpoints')
      const { data } = await response.json()
      setCheckpoints(data || [])
    } catch (error) {
      toast.error('Failed to load checkpoints')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchBarangays() {
    try {
      const response = await fetch('/api/admin/barangays', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch barangays')
      const { data } = await response.json()
      setBarangays(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  function openCreateDialog() {
    setSelectedCheckpoint(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  function openEditDialog(checkpoint: Checkpoint) {
    setSelectedCheckpoint(checkpoint)
    setFormData({
      name: checkpoint.name,
      barangay_id: checkpoint.barangay_id || '',
      checkpoint_type: checkpoint.checkpoint_type,
      coordinates: checkpoint.coordinates,
      description: checkpoint.description || '',
      radius_meters: checkpoint.radius_meters,
    })
    setIsDialogOpen(true)
  }

  function openDeleteDialog(checkpoint: Checkpoint) {
    setSelectedCheckpoint(checkpoint)
    setIsDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = selectedCheckpoint
        ? `/api/admin/checkpoints/${selectedCheckpoint.id}`
        : '/api/admin/checkpoints'
      const method = selectedCheckpoint ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        barangay_id: formData.barangay_id || null,
        description: formData.description || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save checkpoint')
      }

      toast.success(selectedCheckpoint ? 'Checkpoint updated' : 'Checkpoint created')
      setIsDialogOpen(false)
      fetchCheckpoints()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save checkpoint')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedCheckpoint) return

    try {
      const response = await fetch(`/api/admin/checkpoints/${selectedCheckpoint.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete checkpoint')

      toast.success('Checkpoint deleted')
      setIsDeleteDialogOpen(false)
      fetchCheckpoints()
    } catch (error) {
      toast.error('Failed to delete checkpoint')
      console.error(error)
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'TERMINAL': return 'default'
      case 'LANDMARK': return 'secondary'
      case 'LOADING_ZONE': return 'outline'
      default: return 'outline'
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
          <h1 className="text-3xl font-bold tracking-tight">Checkpoints</h1>
          <p className="text-muted-foreground">Manage landmarks and stops along routes</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Checkpoint
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkpoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No checkpoints found. Click &quot;Add Checkpoint&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              checkpoints.map((checkpoint) => (
                <TableRow key={checkpoint.id}>
                  <TableCell className="font-medium">{checkpoint.name}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(checkpoint.checkpoint_type)}>
                      {checkpoint.checkpoint_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{checkpoint.barangay?.name || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {checkpoint.coordinates.lat.toFixed(4)}, {checkpoint.coordinates.lng.toFixed(4)}
                  </TableCell>
                  <TableCell>{checkpoint.radius_meters}m</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(checkpoint)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(checkpoint)}
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
            <DialogTitle>{selectedCheckpoint ? 'Edit Checkpoint' : 'Add New Checkpoint'}</DialogTitle>
            <DialogDescription>
              {selectedCheckpoint ? 'Update the checkpoint details below.' : 'Fill in the details to create a new checkpoint.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., SM City Cebu"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkpoint_type">Type</Label>
                  <Select
                    value={formData.checkpoint_type}
                    onValueChange={(value: typeof checkpointTypes[number]) =>
                      setFormData({ ...formData, checkpoint_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {checkpointTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Select
                    value={formData.barangay_id}
                    onValueChange={(value) => setFormData({ ...formData, barangay_id: value })}
                  >
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
              <div className="space-y-2">
                <Label>Location</Label>
                <MapPinPicker
                  coordinates={formData.coordinates}
                  onCoordinatesChange={(coords) => setFormData({
                    ...formData,
                    coordinates: coords
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                    })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius_meters">Radius (meters)</Label>
                <Input
                  id="radius_meters"
                  type="number"
                  min="100"
                  max="2000"
                  value={formData.radius_meters}
                  onChange={(e) => setFormData({ ...formData, radius_meters: parseInt(e.target.value) || 500 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this checkpoint"
                  rows={3}
                />
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
            <AlertDialogTitle>Delete Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCheckpoint?.name}&quot;? This action cannot be undone.
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
