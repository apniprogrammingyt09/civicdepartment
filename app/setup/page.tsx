"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { setupDepartmentUsers } from '@/lib/setup-users'

export default function SetupPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setStatus('Creating users...')
    try {
      await setupDepartmentUsers()
      setStatus('✅ Demo users created successfully!')
    } catch (error) {
      setStatus('❌ Error creating users')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Setup Demo Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSetup} disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Demo Users'}
          </Button>
          {status && <p className="text-sm text-center">{status}</p>}
          <div className="text-xs text-muted-foreground">
            <p>This will create:</p>
            <p>• pwd@civic.gov / password123</p>
            <p>• water@civic.gov / password123</p>
            <p>• swm@civic.gov / password123</p>
            <p>• traffic@civic.gov / password123</p>
            <p>• health@civic.gov / password123</p>
            <p>• environment@civic.gov / password123</p>
            <p>• disaster@civic.gov / password123</p>
            <p>• admin@civic.gov / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}