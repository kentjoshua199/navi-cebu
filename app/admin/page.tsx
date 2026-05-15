import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Verify user is admin
  const isAdmin = user.user_metadata?.is_admin === true
  if (!isAdmin) {
    redirect('/admin/login')
  }

  // Fetch initial data for the dashboard
  const [
    { data: routes },
    { data: checkpoints },
    { data: barangays }
  ] = await Promise.all([
    supabase.from('routes').select('*').order('route_code'),
    supabase.from('checkpoints').select('*, barangay:barangays(name)').order('name'),
    supabase.from('barangays').select('*').order('name')
  ])

  return (
    <AdminDashboard
      initialRoutes={routes || []}
      initialCheckpoints={checkpoints || []}
      initialBarangays={barangays || []}
      userEmail={user.email || ''}
    />
  )
}
