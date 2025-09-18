"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"

interface AnalyticsPageProps {
  selectedDepartment: string
}

export default function AnalyticsPage({ selectedDepartment }: AnalyticsPageProps) {
  const { theme } = useTheme()
  
  const colors = {
    primary: theme === 'dark' ? '#f97316' : '#ea580c',
    secondary: theme === 'dark' ? '#64748b' : '#475569',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0ea5e9'
  }

  const barData = [
    { name: 'Water', issues: 247, resolved: 189 },
    { name: 'Sanitation', issues: 189, resolved: 156 },
    { name: 'Transport', issues: 156, resolved: 134 },
    { name: 'Health', issues: 203, resolved: 178 },
    { name: 'Parks', issues: 98, resolved: 87 }
  ]

  const lineData = [
    { month: 'Jan', issues: 120, resolved: 98 },
    { month: 'Feb', issues: 145, resolved: 112 },
    { month: 'Mar', issues: 167, resolved: 134 },
    { month: 'Apr', issues: 189, resolved: 156 },
    { month: 'May', issues: 203, resolved: 178 },
    { month: 'Jun', issues: 247, resolved: 189 }
  ]

  const pieData = [
    { name: 'Critical', value: 23, color: colors.danger },
    { name: 'High', value: 45, color: colors.warning },
    { name: 'Medium', value: 67, color: colors.info },
    { name: 'Low', value: 89, color: colors.success }
  ]

  const areaData = [
    { time: '00:00', active: 12, resolved: 8 },
    { time: '04:00', active: 8, resolved: 15 },
    { time: '08:00', active: 25, resolved: 18 },
    { time: '12:00', active: 45, resolved: 32 },
    { time: '16:00', active: 38, resolved: 28 },
    { time: '20:00', active: 22, resolved: 19 }
  ]

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-orbitron tracking-wide">ANALYTICS DASHBOARD</h1>
        <p className="text-muted-foreground font-orbitron">Comprehensive data visualization and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-orbitron tracking-wide">DEPARTMENT PERFORMANCE</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
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
              <LineChart data={lineData}>
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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
              <AreaChart data={areaData}>
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