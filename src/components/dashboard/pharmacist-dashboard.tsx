'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export function PharmacistDashboard() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pharmacist Dashboard</h1>
        <Button onClick={() => router.push('/inventory')}>
          View Inventory
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage your pharmacy inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Track medications that are expiring soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => router.push('/inventory/add')}>
              Add New Item
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/reports')}>
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
