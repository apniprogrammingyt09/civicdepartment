"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, MapPin, CheckCircle, AlertTriangle } from "lucide-react"
import dynamic from "next/dynamic"
import { departments } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDistanceToNow } from "date-fns"

const IndoreMap = dynamic(() => import("@/components/indore-map"), {
  ssr: false,
  loading: () => (
    <div className="h-48 md:h-64 bg-accent rounded border border-border flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-xs md:text-sm">Loading Indore map...</p>
      </div>
    </div>
  ),
})

interface MonitoringPageProps {
  selectedDepartment: string
}

export default function MonitoringPage({ selectedDepartment }: MonitoringPageProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedThisWeek: 0,
    avgResolutionTime: 0,
    pendingEscalations: 0,
    highStatus: 0,
    mediumStatus: 0,
    lowStatus: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const issuesRef = collection(db, 'issues')
        const issuesQuery = selectedDepartment !== 'all' 
          ? query(issuesRef, where('department', '==', selectedDepartment))
          : issuesRef
        
        const snapshot = await getDocs(issuesQuery)
        const issues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
        
        const totalIssues = issues.length
        const resolved = issues.filter((issue: any) => issue.status === 'resolved')
        const escalations = issues.filter((issue: any) => issue.escalation?.status === 'pending')
        const pending = issues.filter((issue: any) => issue.status === 'pending')
        const working = issues.filter((issue: any) => issue.status === 'assign' || issue.status === 'in-progress')
        const escalated = issues.filter((issue: any) => issue.escalation?.status === 'approved')
        
        setStats({
          totalIssues,
          resolvedThisWeek: resolved.length,
          avgResolutionTime: 2.3,
          pendingEscalations: escalations.length,
          highStatus: resolved.length,
          mediumStatus: pending.length,
          lowStatus: working.length
        })
        
        const recent = issues
          .sort((a: any, b: any) => (b.reportedAt?.toDate?.() || new Date()).getTime() - (a.reportedAt?.toDate?.() || new Date()).getTime())
          .slice(0, 5)
          .map((issue: any) => ({
            time: formatDistanceToNow(issue.reportedAt?.toDate?.() || new Date(), { addSuffix: true }),
            user: issue.assignedPersonnel?.name || 'System',
            action: `${issue.status === 'resolved' ? 'resolved' : 'received'} ${issue.category || 'civic'} issue`,
            location: issue.geoData?.address || 'Unknown location',
            type: issue.status || 'new'
          }))
        
        setRecentActivity(recent)
      } catch (error) {
        console.error('Error fetching monitoring stats:', error)
      }
    }
    
    fetchStats()
  }, [selectedDepartment])
  const selectedDept = departments.find(d => d.id === selectedDepartment)
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Key Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-orbitron tracking-wide">TOTAL ISSUES</p>
                <p className="text-foreground text-lg md:text-2xl font-bold font-orbitron tracking-wider">{stats.totalIssues.toLocaleString()}</p>
                <p className="text-green-500 text-xs font-orbitron tracking-wide">+12% FROM LAST MONTH</p>
              </div>
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-orbitron tracking-wide">RESOLVED THIS WEEK</p>
                <p className="text-foreground text-lg md:text-2xl font-bold font-orbitron tracking-wider">{stats.resolvedThisWeek}</p>
                <p className="text-green-500 text-xs font-orbitron tracking-wide">+5% FROM LAST WEEK</p>
              </div>
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-orbitron tracking-wide">AVG RESOLUTION TIME</p>
                <p className="text-foreground text-lg md:text-2xl font-bold font-orbitron tracking-wider">{stats.avgResolutionTime}</p>
                <p className="text-muted-foreground text-xs font-orbitron tracking-wide">DAYS</p>
              </div>
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-orbitron tracking-wide">PENDING ESCALATIONS</p>
                <p className="text-foreground text-lg md:text-2xl font-bold font-orbitron tracking-wider">{stats.pendingEscalations}</p>
                <p className="text-red-500 text-xs font-orbitron tracking-wide">REQUIRES ATTENTION</p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-widest font-orbitron">
              {selectedDepartment === 'all' ? 'DEPARTMENT PERFORMANCE' : `${selectedDept?.code || ''} PERFORMANCE`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
              {[
                { dept: "Water & Sanitation", resolved: 247, pending: 23, score: 92, trend: "up" },
                { dept: "Traffic Management", resolved: 189, pending: 31, score: 87, trend: "up" },
                { dept: "Parks & Recreation", resolved: 156, pending: 12, score: 94, trend: "up" },
                { dept: "Public Safety", resolved: 203, pending: 45, score: 78, trend: "down" },
                { dept: "Waste Management", resolved: 178, pending: 19, score: 89, trend: "up" },
              ].map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-accent rounded">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground font-medium text-xs md:text-sm truncate font-orbitron tracking-wide">{dept.dept}</h4>
                    <div className="flex items-center gap-2 md:gap-4 mt-1">
                      <span className="text-xs text-muted-foreground font-orbitron">RESOLVED: {dept.resolved}</span>
                      <span className="text-xs text-muted-foreground font-orbitron">PENDING: {dept.pending}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 ml-2">
                    <div className="text-right">
                      <div className="text-foreground font-bold text-sm md:text-base font-orbitron tracking-wider">{dept.score}%</div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-3 h-3 ${dept.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                        <span className={`text-xs ${dept.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                          {dept.trend === "up" ? "+2%" : "-1%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Issues Map */}
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-widest font-orbitron flex items-center gap-2">
              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
              LIVE ISSUES MAP - INDORE, MP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-48 md:h-64 rounded border border-border overflow-hidden">
              <IndoreMap selectedDepartment={selectedDepartment} />
            </div>


          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-widest font-orbitron">
            RECENT ACTIVITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 md:p-3 bg-accent rounded hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === "resolved"
                        ? "bg-green-500"
                        : activity.type === "escalated"
                          ? "bg-red-500"
                          : activity.type === "assigned"
                            ? "bg-blue-500"
                            : activity.type === "completed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                    }`}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-xs md:text-sm">
                      <span className="text-primary font-medium">{activity.user}</span> {activity.action} in{" "}
                      <span className="text-foreground">{activity.location}</span>
                    </p>
                    <p className="text-muted-foreground text-xs">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                  {activity.type.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
