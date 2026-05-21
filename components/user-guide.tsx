'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, MapPin, Smartphone, Clock, Users, Info } from 'lucide-react'

interface GuideCardProps {
  icon: React.ReactNode
  title: string
  description: string
  tips: string[]
}

function GuideCard({ icon, title, description, tips }: GuideCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function UserGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Welcome to NaviCebu!</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Your guide to navigating Cebu City&apos;s public jeepney system. Learn how to ride comfortably and safely.
            </p>
          </div>
        </div>
      </div>

      <GuideCard
        icon={<MapPin className="h-5 w-5" />}
        title="How to Ride a Jeepney"
        description="Riding a jeepney is easy once you know the basics. Here's everything you need to know."
        tips={[
          '1. Wait at a designated terminal or along the route',
          '2. Wave at an approaching jeepney to signal you want to ride',
          '3. Enter from the back and move toward the front as you settle in',
          '4. Tell the conductor your destination',
          '5. Sit and hold on to overhead handles during travel',
          '6. Pay the fare to the conductor (usually ₱7-₱15 depending on distance)',
          '7. Signal the conductor to stop at your destination by tapping twice',
          '8. Exit safely from the back when the jeepney slows down',
        ]}
      />

      <GuideCard
        icon={<Smartphone className="h-5 w-5" />}
        title="Payment Methods"
        description="Understanding payment options helps you travel prepared."
        tips={[
          'Cash is the primary payment method - bring coins and small bills',
          'Most drivers accept ₱20, ₱50, and ₱100 notes',
          'Bring exact change when possible to avoid delays',
          'Student IDs can get 20% discount on most routes',
          'Senior citizens and PWD cards receive 50% discount',
          'No credit cards or e-wallets accepted on traditional jeepneys',
          'Modernized jeepneys may accept digital payments',
        ]}
      />

      <GuideCard
        icon={<Clock className="h-5 w-5" />}
        title="Best Times to Travel"
        description="Plan your trips strategically to avoid crowds and travel comfortably."
        tips={[
          'Morning (5-7 AM): Start of service, newer jeepneys available',
          'Off-peak (10 AM-3 PM): Fewer passengers, more comfortable rides',
          'Evening (7-9 PM): Peak hour, expect crowded jeepneys and delays',
          'Weekends: Generally less crowded than weekdays',
          'Holidays: Very light traffic, fastest travel times',
          'Rainy days: Fewer jeepneys operate, expect longer wait times',
          'Avoid traveling during 8-9 AM and 5-7 PM peak hours',
        ]}
      />

      <GuideCard
        icon={<Users className="h-5 w-5" />}
        title="Jeepney Etiquette"
        description="Show respect to drivers, conductors, and fellow passengers."
        tips={[
          'Greet the driver and conductor when boarding',
          'Say thank you when exiting',
          'Give up seats for elderly, pregnant, and disabled passengers',
          'Keep conversations at a low volume',
          'Don\'t eat messy foods on the jeepney',
          'Help elderly passengers board safely',
          'Don\'t block the aisle with luggage',
          'Be patient during heavy traffic',
        ]}
      />

      <GuideCard
        icon={<AlertCircle className="h-5 w-5" />}
        title="Safety Tips"
        description="Stay safe while traveling on public jeepneys."
        tips={[
          'Keep valuables in your pocket or secure bag',
          'Avoid traveling alone very late at night',
          'Stay alert and aware of your surroundings',
          'Don\'t display large amounts of cash',
          'Travel with a friend when possible',
          'Use official terminals and designated bus stops',
          'Report suspicious behavior to authorities',
          'Trust your instincts - if something feels wrong, change jeepneys',
        ]}
      />

      <GuideCard
        icon={<Info className="h-5 w-5" />}
        title="Frequently Asked Questions"
        description="Common questions about using NaviCebu and riding jeepneys."
        tips={[
          'Q: Can I request to be dropped off anywhere? A: Yes, but only at safe locations along the route',
          'Q: Do jeepneys run 24 hours? A: Most routes operate 5 AM - 9 PM; some night routes available',
          'Q: What if I don\'t have exact change? A: The conductor may give change, but it\'s better to prepare',
          'Q: Are jeepneys air-conditioned? A: Some modernized jeepneys are; most traditional ones have open sides',
          'Q: Is it safe to travel with children? A: Yes, keep them close and seated safely',
          'Q: How do I report a problem? A: Contact the PUJ Regulatory Office or file a complaint',
        ]}
      />
    </div>
  )
}
