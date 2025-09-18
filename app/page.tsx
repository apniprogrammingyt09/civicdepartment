"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Inbox, BarChart3, AlertTriangle, Trophy, FileText, Settings, Menu, X, Sun, Moon, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { departments } from "@/lib/auth"
import TaskManagementPage from "./task-management/page"
import MonitoringPage from "./monitoring/page"
import EscalationPage from "./escalation/page"
import GamificationPage from "./gamification/page"
import ReportsPage from "./reports/page"
import AdminPage from "./admin/page"

export default function CivicDashboard() {
  const [activeSection, setActiveSection] = useState("monitoring")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout, hasPermission, selectedDepartment, setSelectedDepartment } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const navigationItems = [
    { id: "tasks", icon: Inbox, label: "TASK MANAGEMENT" },
    { id: "monitoring", icon: BarChart3, label: "MONITORING" },
    { id: "escalation", icon: AlertTriangle, label: "ESCALATION" },
    { id: "gamification", icon: Trophy, label: "LEADERBOARD" },
    { id: "reports", icon: FileText, label: "REPORTS" },
    { id: "admin", icon: Settings, label: "ADMIN" },
  ]

  if (!mounted || !user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-primary font-bold text-lg tracking-widest font-orbitron">CIVIC MANAGER</h1>
              <p className="text-muted-foreground text-xs font-orbitron tracking-wide">{user.department.code} - {user.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-lg glow-orange"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium font-orbitron tracking-wide">{item.label}</span>
              </button>
            ))}
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start gap-3 p-4 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium font-orbitron tracking-wide">LOGOUT</span>
            </Button>
          </nav>

          <div className="mt-8 p-4 bg-accent border border-border rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-foreground font-orbitron tracking-wider">SYSTEM ONLINE</span>
            </div>
            <div className="text-xs text-muted-foreground font-orbitron tracking-wide">
              <div>DEPT: {user.department.name}</div>
              <div>ROLE: {user.role.toUpperCase()}</div>
              <div>ACCESS: {user.department.permissions.length} MODULES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="text-muted-foreground hover:text-primary"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-sm text-muted-foreground hidden sm:block font-orbitron tracking-wide">
              CIVIC MANAGEMENT / <span className="text-primary">DASHBOARD</span>
            </div>
            <div className="text-sm text-primary sm:hidden font-medium font-orbitron tracking-wide">
              {navigationItems.find((item) => item.id === activeSection)?.label}
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48 border-primary glow-orange">
                <SelectValue placeholder="Select Department" />
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
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-primary"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="text-xs text-muted-foreground hidden sm:block font-orbitron tracking-wide">
              LAST UPDATE: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-background">
          {activeSection === "tasks" && <TaskManagementPage selectedDepartment={selectedDepartment} />}
          {activeSection === "monitoring" && <MonitoringPage selectedDepartment={selectedDepartment} />}
          {activeSection === "escalation" && <EscalationPage selectedDepartment={selectedDepartment} />}
          {activeSection === "gamification" && <GamificationPage selectedDepartment={selectedDepartment} />}
          {activeSection === "reports" && <ReportsPage selectedDepartment={selectedDepartment} />}
          {activeSection === "admin" && <AdminPage selectedDepartment={selectedDepartment} />}
        </div>
      </div>
    </div>
  )
}
