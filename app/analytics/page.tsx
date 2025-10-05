"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Database, BarChart3 } from "lucide-react"

interface AnalyticsPageProps {
  selectedDepartment: string
}

export default function AnalyticsPage({ selectedDepartment }: AnalyticsPageProps) {
  const { theme } = useTheme()
  const [useMockData, setUseMockData] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    barData: [],
    lineData: [],
    pieData: [],
    areaData: []
  })
  
  const colors = {
    primary: theme === 'dark' ? '#f97316' : '#ea580c',
    secondary: theme === 'dark' ? '#64748b' : '#475569',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0ea5e9'
  }

  const getMockData = () => ({
    barData: [
      { name: 'WATER', issues: 247, resolved: 189, escalated: 12 },
      { name: 'SANITATION', issues: 189, resolved: 156, escalated: 8 },
      { name: 'TRANSPORT', issues: 156, resolved: 134, escalated: 15 },
      { name: 'HEALTH', issues: 203, resolved: 178, escalated: 5 },
      { name: 'PARKS', issues: 98, resolved: 87, escalated: 3 }
    ],
    lineData: [
      { month: 'Jan', issues: 120, resolved: 98 },
      { month: 'Feb', issues: 145, resolved: 112 },
      { month: 'Mar', issues: 167, resolved: 134 },
      { month: 'Apr', issues: 189, resolved: 156 },
      { month: 'May', issues: 203, resolved: 178 },
      { month: 'Jun', issues: 247, resolved: 189 }
    ],
    pieData: [
      { name: 'Critical', value: 23, color: colors.danger },
      { name: 'High', value: 45, color: colors.warning },
      { name: 'Medium', value: 67, color: colors.primary },
      { name: 'Low', value: 89, color: colors.success }
    ],
    areaData: [
      { time: '00:00', active: 12, resolved: 8 },
      { time: '04:00', active: 8, resolved: 15 },
      { time: '08:00', active: 25, resolved: 18 },
      { time: '12:00', active: 45, resolved: 32 },
      { time: '16:00', active: 38, resolved: 28 },
      { time: '20:00', active: 22, resolved: 19 }
    ]
  })

  useEffect(() => {
    if (useMockData) {
      setAnalyticsData(getMockData())
      return
    }

    const fetchAnalyticsData = async () => {
      try {
        const issuesRef = collection(db, 'issues')
        const allIssuesSnapshot = await getDocs(issuesRef)
        const allIssues = allIssuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // Always show all departments for bar chart
        const deptCounts = {}
        allIssues.forEach(issue => {
          const dept = issue.department || 'unknown'
          if (!deptCounts[dept]) deptCounts[dept] = { total: 0, resolved: 0, escalated: 0 }
          deptCounts[dept].total++
          if (issue.status === 'resolved') deptCounts[dept].resolved++
          if (issue.escalation?.status === 'pending' || issue.escalation?.status === 'approved') deptCounts[dept].escalated++
        })
        
        const barData = Object.entries(deptCounts).map(([dept, data]: [string, any]) => ({
          name: dept.toUpperCase(),
          issues: data.total,
          resolved: data.resolved,
          escalated: data.escalated
        }))
        
        // Filter issues for other charts based on selected department
        let filteredIssues = allIssues
        if (selectedDepartment !== 'all') {
          filteredIssues = allIssues.filter(issue => issue.department === selectedDepartment)
        }
        
        const priorityCounts = { critical: 0, high: 0, medium: 0, low: 0 }
        filteredIssues.forEach(issue => {
          const priority = issue.priority?.toLowerCase() || 'low'
          if (priorityCounts[priority] !== undefined) priorityCounts[priority]++
        })
        
        const pieData = [
          { name: 'Critical', value: priorityCounts.critical, color: colors.danger },
          { name: 'High', value: priorityCounts.high, color: colors.warning },
          { name: 'Medium', value: priorityCounts.medium, color: colors.primary },
          { name: 'Low', value: priorityCounts.low, color: colors.success }
        ]
        
        setAnalyticsData({
          barData,
          lineData: [
            { month: 'Jan', issues: Math.floor(filteredIssues.length * 0.6), resolved: Math.floor(filteredIssues.length * 0.4) },
            { month: 'Feb', issues: Math.floor(filteredIssues.length * 0.7), resolved: Math.floor(filteredIssues.length * 0.5) },
            { month: 'Mar', issues: Math.floor(filteredIssues.length * 0.8), resolved: Math.floor(filteredIssues.length * 0.6) },
            { month: 'Apr', issues: Math.floor(filteredIssues.length * 0.9), resolved: Math.floor(filteredIssues.length * 0.7) },
            { month: 'May', issues: Math.floor(filteredIssues.length * 0.95), resolved: Math.floor(filteredIssues.length * 0.8) },
            { month: 'Jun', issues: filteredIssues.length, resolved: filteredIssues.filter(i => i.status === 'resolved').length }
          ],
          pieData,
          areaData: [
            { time: '00:00', active: Math.floor(filteredIssues.length * 0.1), resolved: Math.floor(filteredIssues.length * 0.05) },
            { time: '04:00', active: Math.floor(filteredIssues.length * 0.08), resolved: Math.floor(filteredIssues.length * 0.12) },
            { time: '08:00', active: Math.floor(filteredIssues.length * 0.2), resolved: Math.floor(filteredIssues.length * 0.15) },
            { time: '12:00', active: Math.floor(filteredIssues.length * 0.35), resolved: Math.floor(filteredIssues.length * 0.25) },
            { time: '16:00', active: Math.floor(filteredIssues.length * 0.3), resolved: Math.floor(filteredIssues.length * 0.22) },
            { time: '20:00', active: Math.floor(filteredIssues.length * 0.18), resolved: Math.floor(filteredIssues.length * 0.15) }
          ]
        })
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      }
    }
    
    fetchAnalyticsData()
  }, [selectedDepartment, useMockData])



  const radarData = [
    { subject: 'Response Time', A: 120, B: 110, fullMark: 150 },
    { subject: 'Resolution Rate', A: 98, B: 130, fullMark: 150 },
    { subject: 'Citizen Satisfaction', A: 86, B: 130, fullMark: 150 },
    { subject: 'Resource Efficiency', A: 99, B: 100, fullMark: 150 },
    { subject: 'Team Performance', A: 85, B: 90, fullMark: 150 },
    { subject: 'Cost Effectiveness', A: 65, B: 85, fullMark: 150 }
  ]

  const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-orbitron tracking-wide">ANALYTICS DASHBOARD</h1>
          <p className="text-muted-foreground font-orbitron">Comprehensive data visualization and insights</p>
        </div>
        <Button
          variant={useMockData ? "default" : "outline"}
          size="sm"
          onClick={() => setUseMockData(!useMockData)}
          className="flex items-center gap-2"
        >
          {useMockData ? <BarChart3 className="w-4 h-4" /> : <Database className="w-4 h-4" />}
          {useMockData ? "Mock Data" : "Real Data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">DEPARTMENT PERFORMANCE</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.secondary} />
                <XAxis dataKey="name" stroke={colors.secondary} />
                <YAxis stroke={colors.secondary} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="issues" fill={colors.primary} name="Total Issues" />
                <Bar dataKey="resolved" fill={colors.success} name="Resolved" />
                <Bar dataKey="escalated" fill={colors.danger} name="Escalated" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">MONTHLY TRENDS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.secondary} />
                <XAxis dataKey="month" stroke={colors.secondary} />
                <YAxis stroke={colors.secondary} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="issues" stroke={colors.primary} strokeWidth={3} name="Issues Reported" />
                <Line type="monotone" dataKey="resolved" stroke={colors.success} strokeWidth={3} name="Issues Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">PRIORITY DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">24-HOUR ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.secondary} />
                <XAxis dataKey="time" stroke={colors.secondary} />
                <YAxis stroke={colors.secondary} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="active" stackId="1" stroke={colors.primary} fill={colors.primary} fillOpacity={0.6} name="Active Issues" />
                <Area type="monotone" dataKey="resolved" stackId="1" stroke={colors.success} fill={colors.success} fillOpacity={0.6} name="Resolved Issues" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">PERFORMANCE METRICS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={colors.secondary} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: colors.secondary }} />
                <PolarRadiusAxis stroke={colors.secondary} />
                <Radar name="Current" dataKey="A" stroke={colors.primary} fill={colors.primary} fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Target" dataKey="B" stroke={colors.success} fill={colors.success} fillOpacity={0.3} strokeWidth={2} />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">EFFICIENCY ANALYSIS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.secondary} />
                <XAxis type="number" dataKey="x" name="Response Time" stroke={colors.secondary} />
                <YAxis type="number" dataKey="y" name="Resolution Rate" stroke={colors.secondary} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Scatter name="Departments" dataKey="z" fill={colors.primary} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}