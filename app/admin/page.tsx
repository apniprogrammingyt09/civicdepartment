"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Settings, Users, Shield, Database, Clock, Activity, Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { db, auth } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy, limit, serverTimestamp, updateDoc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeSessions: 0,
    systemUptime: 99.9,
    securityAlerts: 0
  })


  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'inspector',
    phone: '',
    location: ''
  })

  // Fetch civic workers and calculate stats
  useEffect(() => {
    if (!user?.department.id) return

    const q = query(
      collection(db, 'civicUsers'),
      where('departmentId', '==', user.department.id)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(userList)
      
      // Calculate stats
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const newUsersThisMonth = userList.filter(user => 
        new Date(user.createdAt) >= thisMonth
      ).length
      
      const activeUsers = userList.filter(user => user.active).length
      
      setStats({
        totalUsers: userList.length,
        newUsersThisMonth,
        activeSessions: activeUsers,
        systemUptime: 99.9,
        securityAlerts: 0
      })
    }, (error) => {
      console.error('Error fetching users:', error)
      setUsers([])
    })

    return () => unsubscribe()
  }, [user])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      
      // Store user data in civicUsers collection
      await addDoc(collection(db, 'civicUsers'), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        location: formData.location,
        profileImage: '',
        departmentId: user?.department.id,
        departmentName: user?.department.name,
        createdBy: user?.id,
        createdAt: new Date().toISOString(),
        active: true
      })
      
      // Log audit activity
      await logAuditActivity('User Created', `Added new ${formData.role}: ${formData.name}`)

      setFormData({ name: '', email: '', password: '', role: 'inspector', phone: '', location: '' })
      setShowForm(false)
    } catch (error: any) {
      console.error('Error creating user:', error)
      if (error.code === 'auth/email-already-in-use') {
        alert('Email is already in use. Please use a different email.')
      } else {
        alert('Error creating user: ' + error.message)
      }
    }
    setLoading(false)
  }

  const handleBulkUpload = async () => {
    if (!csvFile || !user?.department.id) return

    setBulkLoading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',')
      
      let successCount = 0
      let errorCount = 0

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 6) {
          try {
            const [name, email, password, role, phone, location] = values.map(v => v.trim())
            
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            
            // Store user data in civicUsers collection
            await addDoc(collection(db, 'civicUsers'), {
              uid: userCredential.user.uid,
              name,
              email,
              role,
              phone,
              location,
              profileImage: '',
              departmentId: user.department.id,
              departmentName: user.department.name,
              createdBy: user.id,
              createdAt: new Date().toISOString(),
              active: true
            })
            
            successCount++
          } catch (error) {
            console.error(`Error creating user ${values[1]}:`, error)
            errorCount++
          }
        }
      }
      
      alert(`Bulk upload completed: ${successCount} users created, ${errorCount} errors`)
      setCsvFile(null)
      setShowBulkUpload(false)
    } catch (error) {
      console.error('Error processing CSV:', error)
      alert('Error processing CSV file')
    }
    setBulkLoading(false)
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const userToDelete = users.find(u => u.id === userId)
        await deleteDoc(doc(db, 'civicUsers', userId))
        
        // Log audit activity
        if (userToDelete) {
          await logAuditActivity('User Deleted', `Removed user: ${userToDelete.name}`)
        }
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }



  // Fetch audit logs
  useEffect(() => {
    const auditRef = collection(db, 'auditLogs')
    const auditQuery = query(auditRef, orderBy('timestamp', 'desc'), limit(20))
    
    const unsubscribe = onSnapshot(auditQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toLocaleString() || 'Recently'
        }
      })
      setAuditLogs(logs)
    }, (error) => {
      console.error('Error fetching audit logs:', error)
      setAuditLogs([])
    })
    
    return () => unsubscribe()
  }, [])
  

  
  // Log audit activity
  const logAuditActivity = async (action: string, details: string) => {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        user: user?.name || 'Admin',
        action,
        details,
        timestamp: serverTimestamp(),
        ip: '192.168.1.100',
        departmentId: user?.department.id
      })
    } catch (error) {
      console.error('Error logging audit activity:', error)
    }
  }


  return (
    <div className="p-6 space-y-6">
      {/* Admin Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-foreground text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-green-500 text-xs">+{stats.newUsersThisMonth} this month</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Sessions</p>
                <p className="text-foreground text-2xl font-bold">{stats.activeSessions}</p>
                <p className="text-blue-500 text-xs">Currently online</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">System Uptime</p>
                <p className="text-foreground text-2xl font-bold">{stats.systemUptime}%</p>
                <p className="text-green-500 text-xs">24/7 availability</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Security Alerts</p>
                <p className="text-foreground text-2xl font-bold">{stats.securityAlerts}</p>
                <p className="text-green-500 text-xs">All systems secure</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              USER MANAGEMENT ({users.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowBulkUpload(!showBulkUpload)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Upload Form */}
          {showBulkUpload && (
            <div className="mb-6 p-4 bg-accent rounded border">
              <h4 className="font-semibold mb-4">Bulk Upload Civic Workers</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV format: name,email,password,role,phone,location
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleBulkUpload} 
                    disabled={!csvFile || bulkLoading} 
                    size="sm"
                  >
                    {bulkLoading ? 'Uploading...' : 'Upload Users'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowBulkUpload(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Create User Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-accent rounded border">
              <h4 className="font-semibold mb-4">Create New Civic Worker</h4>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Location/Area"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                  <select
                    className="px-3 py-2 border rounded-md bg-background"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="inspector">Inspector</option>
                    <option value="senior inspector">Senior Inspector</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading || !formData.name || !formData.email || !formData.password || !formData.phone || !formData.location} size="sm">
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-accent rounded border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-foreground font-semibold">{user.name}</h3>
                      <Badge variant={user.active ? "default" : "secondary"} className="text-xs">
                        {user.active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                    <p className="text-muted-foreground text-xs font-mono">{user.uid}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 bg-transparent min-w-fit"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Role:</span>
                    <p className="text-foreground">{user.role}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="text-foreground">{user.departmentName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Audit Logs */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            AUDIT LOGS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log, index) => (
              <div key={index} className="p-3 bg-accent rounded border-l-4 border-primary">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-foreground font-medium text-sm">{log.user}</span>
                      <Badge variant="secondary" className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-foreground text-sm">{log.details}</p>
                  </div>
                  <span className="text-muted-foreground text-xs font-mono">{log.timestamp}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>IP: {log.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
