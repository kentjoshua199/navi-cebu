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
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Barangay {
  id: string
  name: string
  district: string | null
  coordinates: { lat: number; lng: number } | null
  created_at: string
}

const districts = ['North', 'South', 'East', 'West', 'Central']

const initialFormData = {
  name: '',
  district: '',
  coordinates: { lat: 10.3157, lng: 123.8854 },
}

export default function BarangaysManagementPage() {
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchBarangays()
  }, [])

  async function fetchBarangays() {
    try {
      const response = await fetch('/api/admin/barangays')
      if (!response.ok) throw new Error('Failed to fetch barangays')
      const { data } = await response.json()
      setBarangays(data || [])
    } catch (error) {
      toast.error('Failed to load barangays')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateDialog() {
    setSelectedBarangay(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  function openEditDialog(barangay: Barangay) {
    setSelectedBarangay(barangay)
    setFormData({
      name: barangay.name,
      district: barangay.district || '',
      coordinates: barangay.coordinates || { lat: 10.3157, lng: 123.8854 },
    })
    setIsDialogOpen(true)
  }

  function openDeleteDialog(barangay: Barangay) {
    setSelectedBarangay(barangay)
    setIsDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = selectedBarangay
        ? `/api/admin/barangays/${selectedBarangay.id}`
        : '/api/admin/barangays'
      const method = selectedBarangay ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        district: formData.district || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save barangay')
      }

      toast.success(selectedBarangay ? 'Barangay updated' : 'Barangay created')
      setIsDialogOpen(false)
      fetchBarangays()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save barangay')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedBarangay) return

    try {
      const response = await fetch(`/api/admin/barangays/${selectedBarangay.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete barangay')

      toast.success('Barangay deleted')
      setIsDeleteDialogOpen(false)
      fetchBarangays()
    } catch (error) {
      toast.error('Failed to delete barangay')
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
          <h1 className="text-3xl font-bold tracking-tight">Barangays</h1>
          <p className="text-muted-foreground">Manage Cebu City barangays and districts</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Barangay
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barangays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No barangays found. Click &quot;Add Barangay&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              barangays.map((barangay) => (
                <TableRow key={barangay.id}>
                  <TableCell className="font-medium">{barangay.name}</TableCell>
                  <TableCell>
                    {barangay.district ? (
                      <Badge variant="outline">{barangay.district}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {barangay.coordinates
                      ? `${barangay.coordinates.lat.toFixed(4)}, ${barangay.coordinates.lng.toFixed(4)}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(barangay)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(barangay)}
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
            <DialogTitle>{selectedBarangay ? 'Edit Barangay' : 'Add New Barangay'}</DialogTitle>
            <DialogDescription>
              {selectedBarangay ? 'Update the barangay details below.' : 'Fill in the details to create a new barangay.'}
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
                  placeholder="e.g., Lahug"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  />
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
            <AlertDialogTitle>Delete Barangay</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedBarangay?.name}&quot;? This may affect checkpoints associated with this barangay.
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
