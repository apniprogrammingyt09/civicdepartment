"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Settings, Users, Shield, Database, Clock, Activity, Plus, Edit, Trash2 } from "lucide-react"

export default function AdminPage() {
  const users = [
    {
      id: "USR-001",
      name: "John Doe",
      email: "john.doe@city.gov",
      role: "Senior Inspector",
      department: "Water & Sanitation",
      status: "active",
      lastLogin: "2024-01-15 09:30",
    },
    {
      id: "USR-002",
      name: "Sarah Wilson",
      email: "sarah.wilson@city.gov",
      role: "Department Head",
      department: "Parks & Recreation",
      status: "active",
      lastLogin: "2024-01-15 08:15",
    },
    {
      id: "USR-003",
      name: "Mike Johnson",
      email: "mike.johnson@city.gov",
      role: "Field Engineer",
      department: "Water & Sanitation",
      status: "inactive",
      lastLogin: "2024-01-10 14:22",
    },
  ]

  const auditLogs = [
    {
      timestamp: "2024-01-15 14:30:22",
      user: "John Doe",
      action: "Resolved Issue",
      details: "Marked WD-2024-0892 as resolved",
      ip: "192.168.1.45",
    },
    {
      timestamp: "2024-01-15 14:25:15",
      user: "Sarah Wilson",
      action: "User Created",
      details: "Added new inspector: Lisa Chen",
      ip: "192.168.1.23",
    },
    {
      timestamp: "2024-01-15 14:20:08",
      user: "Admin System",
      action: "Settings Updated",
      details: "Modified SLA timing for critical issues",
      ip: "127.0.0.1",
    },
    {
      timestamp: "2024-01-15 14:15:33",
      user: "Mike Johnson",
      action: "Task Assigned",
      details: "Assigned TR-2024-0234 to field team",
      ip: "192.168.1.67",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Admin Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-foreground text-2xl font-bold">47</p>
                <p className="text-green-500 text-xs">+3 this month</p>
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
                <p className="text-foreground text-2xl font-bold">23</p>
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
                <p className="text-foreground text-2xl font-bold">99.9%</p>
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
                <p className="text-foreground text-2xl font-bold">0</p>
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
              USER MANAGEMENT
            </CardTitle>
            <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-accent rounded border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-foreground font-semibold">{user.name}</h3>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                    <p className="text-muted-foreground text-xs font-mono">{user.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent min-w-fit">
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 bg-transparent min-w-fit"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Role:</span>
                    <p className="text-foreground">{user.role}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="text-foreground">{user.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Login:</span>
                    <p className="text-foreground">{user.lastLogin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4" />
            DEPARTMENT SETTINGS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">SLA Timings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent rounded">
                  <div>
                    <span className="text-foreground text-sm">Critical Issues</span>
                    <p className="text-muted-foreground text-xs">Emergency response time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-16 h-8 text-center" defaultValue="2" />
                    <span className="text-muted-foreground text-sm">hours</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent rounded">
                  <div>
                    <span className="text-foreground text-sm">High Priority</span>
                    <p className="text-muted-foreground text-xs">Standard response time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-16 h-8 text-center" defaultValue="24" />
                    <span className="text-muted-foreground text-sm">hours</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent rounded">
                  <div>
                    <span className="text-foreground text-sm">Medium Priority</span>
                    <p className="text-muted-foreground text-xs">Regular response time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-16 h-8 text-center" defaultValue="72" />
                    <span className="text-muted-foreground text-sm">hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">Escalation Rules</h4>
              <div className="space-y-3">
                <div className="p-3 bg-accent rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground text-sm">Auto-escalate overdue tasks</span>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">Automatically escalate tasks that exceed SLA</p>
                </div>
                <div className="p-3 bg-accent rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground text-sm">Budget approval threshold</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">$</span>
                      <Input className="w-20 h-8 text-center" defaultValue="5000" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">Issues requiring higher approval</p>
                </div>
                <div className="p-3 bg-accent rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground text-sm">Cross-department notifications</span>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">Notify related departments of issues</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button className="bg-primary hover:bg-primary/90">Save Settings</Button>
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
