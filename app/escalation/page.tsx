"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Users, MessageSquare, ArrowUp } from "lucide-react"

export default function EscalationPage() {
  const escalatedTasks = [
    {
      id: "WD-2024-0875",
      title: "Major water main break affecting 500+ residents",
      department: "Water & Sanitation",
      assignee: "Mike Johnson",
      escalatedBy: "John Doe",
      escalatedAt: "2024-01-15 14:30",
      overdueDays: 3,
      priority: "critical",
      reason: "Exceeds department budget limit ($50,000)",
      status: "pending-approval",
    },
    {
      id: "TR-2024-0234",
      title: "Traffic light system failure at major intersection",
      department: "Traffic Management",
      assignee: "Sarah Wilson",
      escalatedBy: "Traffic Control",
      escalatedAt: "2024-01-15 10:15",
      overdueDays: 1,
      priority: "high",
      reason: "Requires coordination with power company",
      status: "in-review",
    },
    {
      id: "PS-2024-0156",
      title: "Repeated noise complaints - commercial district",
      department: "Public Safety",
      assignee: "Lisa Chen",
      escalatedBy: "Community Relations",
      escalatedAt: "2024-01-14 16:45",
      overdueDays: 2,
      priority: "medium",
      reason: "Legal action threatened by business owner",
      status: "pending-approval",
    },
  ]

  const crossDepartmentTasks = [
    {
      id: "CD-2024-0012",
      title: "Road construction affecting water line access",
      departments: ["Traffic Management", "Water & Sanitation"],
      coordinator: "John Doe",
      status: "active",
      progress: 65,
    },
    {
      id: "CD-2024-0013",
      title: "Park renovation with new lighting installation",
      departments: ["Parks & Recreation", "Public Works"],
      coordinator: "Sarah Wilson",
      status: "planning",
      progress: 25,
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-500 border-red-500"
      case "high":
        return "text-orange-500 border-orange-500"
      case "medium":
        return "text-yellow-500 border-yellow-500"
      default:
        return "text-blue-500 border-blue-500"
    }
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Escalation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs md:text-sm">Pending Escalations</p>
                <p className="text-foreground text-xl md:text-2xl font-bold">23</p>
                <p className="text-red-500 text-xs">+3 since yesterday</p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs md:text-sm">Overdue Tasks</p>
                <p className="text-foreground text-xl md:text-2xl font-bold">8</p>
                <p className="text-orange-500 text-xs">Requires immediate attention</p>
              </div>
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs md:text-sm">Cross-Dept Tasks</p>
                <p className="text-foreground text-xl md:text-2xl font-bold">12</p>
                <p className="text-blue-500 text-xs">Active collaborations</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalated Tasks */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <ArrowUp className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            ESCALATED TASKS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4 max-h-96 md:max-h-[500px] overflow-y-auto">
            {escalatedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 md:p-4 border-l-4 ${getPriorityColor(task.priority)} bg-accent rounded`}
              >
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-semibold text-sm md:text-base leading-tight">{task.title}</h3>
                    <p className="text-muted-foreground text-xs font-mono">{task.id}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 ml-2">
                    <Badge variant="destructive" className="text-xs whitespace-nowrap">
                      {task.overdueDays} DAYS OVERDUE
                    </Badge>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {task.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
                  <div>
                    <span className="text-muted-foreground text-xs">Department:</span>
                    <p className="text-foreground text-sm">{task.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Assignee:</span>
                    <p className="text-foreground text-sm">{task.assignee}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <span className="text-muted-foreground text-xs">Escalated By:</span>
                    <p className="text-foreground text-sm">{task.escalatedBy}</p>
                  </div>
                </div>

                <div className="bg-muted p-2 md:p-3 rounded mb-3 md:mb-4">
                  <span className="text-muted-foreground text-xs">Escalation Reason:</span>
                  <p className="text-foreground text-xs md:text-sm mt-1">{task.reason}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-muted-foreground text-xs">Escalated: {task.escalatedAt}</span>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent min-w-fit text-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span className="hidden sm:inline">Add </span>Note
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 min-w-fit text-xs">
                      <span className="hidden sm:inline">Review & </span>Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Department Collaboration */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            CROSS-DEPARTMENT COLLABORATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {crossDepartmentTasks.map((task) => (
              <div key={task.id} className="p-3 md:p-4 bg-accent rounded border border-border">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-semibold text-sm md:text-base leading-tight">{task.title}</h3>
                    <p className="text-muted-foreground text-xs font-mono">{task.id}</p>
                  </div>
                  <Badge variant={task.status === "active" ? "default" : "secondary"} className="text-xs ml-2">
                    {task.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                  {task.departments.map((dept, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {dept}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 md:mb-3 gap-2">
                  <div>
                    <span className="text-muted-foreground text-xs">Coordinator:</span>
                    <span className="text-foreground ml-2 text-sm">{task.coordinator}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-muted-foreground text-xs">Progress:</span>
                    <span className="text-foreground ml-2 font-bold text-sm">{task.progress}%</span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-2 md:mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-end gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent min-w-fit text-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span className="hidden sm:inline">Communication </span>Hub
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 min-w-fit text-xs">
                      <span className="hidden sm:inline">View </span>Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
