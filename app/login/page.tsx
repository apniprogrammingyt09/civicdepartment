"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { departments } from '@/lib/auth'
import { setupDepartmentUsers } from '@/lib/setup-users'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [error, setError] = useState('')
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const success = await login(email, password, selectedDepartment)
      if (success) {
        router.push('/')
      } else {
        setError('Invalid credentials')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md glow-orange">
        <CardHeader>
          <CardTitle className="text-center text-primary text-glow-orange">
            CIVIC DEPARTMENT LOGIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Department Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="border-primary glow-orange">
                <SelectValue placeholder="Select Department View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full glow-orange">
              LOGIN
            </Button>
          </form>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Demo accounts:</p>
            <p>pwd@civic.gov / password123</p>
            <p>water@civic.gov / password123</p>
            <p>swm@civic.gov / password123</p>
            <p>traffic@civic.gov / password123</p>
            <p>health@civic.gov / password123</p>
            <p>environment@civic.gov / password123</p>
            <p>disaster@civic.gov / password123</p>
            <Button 
              onClick={setupDepartmentUsers} 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full text-xs"
            >
              Setup Demo Users (First Time)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}