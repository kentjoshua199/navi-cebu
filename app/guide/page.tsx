import { UserGuide } from '@/components/user-guide'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Lightbulb } from 'lucide-react'

export const metadata = {
  title: 'NaviCebu Guide - How to Ride Jeepneys in Cebu',
  description: 'Learn how to ride jeepneys in Cebu City safely and comfortably with our comprehensive guide.',
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Routes
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Lightbulb className="h-8 w-8" />
              NaviCebu Jeepney Guide
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about riding jeepneys in Cebu City.
            </p>
          </div>

          <UserGuide />
        </div>
      </div>
    </main>
  )
}
