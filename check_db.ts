import { createClient } from '@supabase/supabase-js'

const url = 'https://rmtajqtgrokwxogvyifi.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdGFqcXRncm9rd3hvZ3Z5aWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc5MzAsImV4cCI6MjA5NDM4MzkzMH0.EjrpjpDz2oG3cmKGWO2stG4qj9R3ODdvIUs60vEuT58'

const supabase = createClient(url, key)

async function checkDb() {
  console.log("Checking database...")

  // 1. Check if 01K route exists
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('route_code', '01K')
    .single()

  if (routeError) {
    console.error("Error fetching 01K route:", routeError.message)
    return
  } else {
    console.log("Found 01K route:", route.route_name)
  }

  // 2. Check stop_settings for 01K
  if (route) {
    const { data: stops, error: stopsError } = await supabase
      .from('stop_settings')
      .select('*, checkpoint:checkpoints(*)')
      .eq('route_id', route.id)
      .order('stop_order')

    if (stopsError) {
      console.error("Error fetching stops:", stopsError.message)
    } else {
      console.log(`Found ${stops?.length || 0} stops for 01K.`)
      if (stops && stops.length > 0) {
        console.log("First stop distance:", stops[0].distance_meters)
        console.log("First stop est time:", stops[0].estimated_time_minutes)
      }
    }
    
    // Check what the actual getRouteByCode query does
    const { data: fullRoute, error: fullError } = await supabase
      .from('routes')
      .select(`
        *,
        stop_settings(
          *,
          checkpoint:checkpoints(
            *,
            barangay:barangays(*)
          )
        )
      `)
      .eq('route_code', '01K')
      .eq('is_active', true)
      .single()
      
    if (fullError) {
      console.error("Error with full query:", fullError.message)
    } else {
      console.log("Full query returned stop_settings count:", fullRoute?.stop_settings?.length)
    }
  }
}

checkDb()
