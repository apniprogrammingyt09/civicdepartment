"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Inbox,
  Users,
  Kanban,
  Camera,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Upload,
  Eye,
} from "lucide-react"

interface TaskManagementPageProps {
  selectedDepartment: string
}

export default function TaskManagementPage({ selectedDepartment }: TaskManagementPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")

  const allTasks = {
    water: [
      {
        id: "WTR-2024-0892",
        title: "Water main break on Oak Street",
        description: "Citizen reported water flooding the street near Oak & 5th intersection",
        severity: "critical",
        priority: "high",
        status: "pending",
        assignee: null,
        reportedBy: "Jane Smith",
        location: "Oak St & 5th Ave",
        createdAt: "2024-01-15 09:30",
        estimatedTime: "4 hours",
        department: "water"
      },
      {
        id: "WTR-2024-0893",
        title: "Low water pressure complaint",
        description: "Multiple residents reporting low water pressure in Maple Heights area",
        severity: "medium",
        priority: "medium",
        status: "in-progress",
        assignee: "Mike Johnson",
        reportedBy: "Multiple Citizens",
        location: "Maple Heights District",
        createdAt: "2024-01-15 08:15",
        estimatedTime: "2 hours",
        department: "water"
      }
    ],
    sanitation: [
      {
        id: "SAN-2024-0156",
        title: "Garbage collection delay",
        description: "Multiple complaints about missed garbage pickup in residential area",
        severity: "medium",
        priority: "high",
        status: "pending",
        assignee: null,
        reportedBy: "Citizens",
        location: "Residential District",
        createdAt: "2024-01-15 07:30",
        estimatedTime: "3 hours",
        department: "sanitation"
      }
    ],
    transport: [
      {
        id: "TRP-2024-0234",
        title: "Traffic light malfunction",
        description: "Traffic signal not working at major intersection",
        severity: "critical",
        priority: "high",
        status: "in-progress",
        assignee: "Sarah Wilson",
        reportedBy: "Traffic Control",
        location: "Main & 5th Ave",
        createdAt: "2024-01-15 06:45",
        estimatedTime: "2 hours",
        department: "transport"
      }
    ]
  }
  
  const tasks = selectedDepartment === 'all' 
    ? Object.values(allTasks).flat()
    : allTasks[selectedDepartment as keyof typeof allTasks] || []

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "in-progress":
        return <AlertCircle className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="inbox" className="flex items-center gap-2 text-xs sm:text-sm">
            <Inbox className="w-4 h-4" />
            <span className="hidden sm:inline">Task</span> Inbox
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Assign</span> Tasks
          </TabsTrigger>
          <TabsTrigger value="board" className="flex items-center gap-2 text-xs sm:text-sm">
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Task</span> Board
          </TabsTrigger>
          <TabsTrigger value="proof" className="flex items-center gap-2 text-xs sm:text-sm">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Proof</span> Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(task.severity)}`}></div>
                      <div>
                        <h3 className="text-foreground font-semibold">{task.title}</h3>
                        <p className="text-muted-foreground text-sm font-mono">{task.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge variant={task.status === "resolved" ? "default" : "secondary"}>
                        {task.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-foreground mb-4">{task.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="text-foreground">{task.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported By:</span>
                      <p className="text-foreground">{task.reportedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assignee:</span>
                      <p className="text-foreground">{task.assignee || "Unassigned"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Time:</span>
                      <p className="text-foreground">{task.estimatedTime}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <span className="text-muted-foreground text-sm">{task.createdAt}</span>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="min-w-fit bg-transparent">
                        <span className="hidden sm:inline">View </span>Details
                      </Button>
                      {!task.assignee && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90 min-w-fit">
                          <span className="hidden sm:inline">Assign </span>Task
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assign Tasks tab */}
        <TabsContent value="assign" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Assign Tasks to Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Members */}
              <div>
                <h3 className="text-foreground font-semibold mb-4">Available Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: "John Doe",
                      role: "Senior Inspector",
                      department: "Water & Sanitation",
                      available: true,
                      currentTasks: 3,
                    },
                    {
                      name: "Sarah Wilson",
                      role: "Department Head",
                      department: "Parks & Recreation",
                      available: true,
                      currentTasks: 1,
                    },
                    {
                      name: "Mike Johnson",
                      role: "Field Engineer",
                      department: "Water & Sanitation",
                      available: false,
                      currentTasks: 5,
                    },
                    {
                      name: "Lisa Chen",
                      role: "Inspector",
                      department: "Public Safety",
                      available: true,
                      currentTasks: 2,
                    },
                  ].map((member) => (
                    <Card
                      key={member.name}
                      className={`bg-accent border-border ${member.available ? "hover:border-primary/50" : "opacity-60"}`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-foreground font-medium">{member.name}</h4>
                          <Badge variant={member.available ? "default" : "secondary"} className="text-xs">
                            {member.available ? "AVAILABLE" : "BUSY"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{member.role}</p>
                        <p className="text-muted-foreground text-xs">{member.department}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">Current Tasks: {member.currentTasks}</span>
                          <Button size="sm" disabled={!member.available} className="text-xs min-w-fit">
                            <span className="hidden sm:inline">Assign </span>Task
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Assignment */}
              <div className="border-t border-border pt-6">
                <h3 className="text-foreground font-semibold mb-4">Quick Task Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Select Task</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose unassigned task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WD-2024-0892">WD-2024-0892 - Water main break</SelectItem>
                          <SelectItem value="TR-2024-0234">TR-2024-0234 - Traffic light failure</SelectItem>
                          <SelectItem value="PS-2024-0156">PS-2024-0156 - Noise complaints</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Assign To</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john">John Doe - Senior Inspector</SelectItem>
                          <SelectItem value="sarah">Sarah Wilson - Department Head</SelectItem>
                          <SelectItem value="lisa">Lisa Chen - Inspector</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Priority Level</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Set priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Assignment Notes</label>
                      <Textarea placeholder="Add any special instructions..." className="resize-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button className="bg-primary hover:bg-primary/90">Assign Task</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Board tab */}
        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Pending", "In Progress", "Resolved"].map((status) => (
              <Card key={status} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider">
                    {status.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks
                      .filter((task) => task.status === status.toLowerCase().replace(" ", "-"))
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-accent rounded border-l-4 border-primary hover:bg-accent/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(task.severity)}`}></div>
                          </div>
                          <h4 className="text-foreground text-sm font-medium mb-1">{task.title}</h4>
                          <p className="text-muted-foreground text-xs">{task.location}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Proof Review tab */}
        <TabsContent value="proof" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Proof-of-Work Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pending Reviews */}
              <div>
                <h3 className="text-foreground font-semibold mb-4">Pending Reviews</h3>
                <div className="space-y-4">
                  {[
                    {
                      taskId: "WD-2024-0890",
                      title: "Pipe repair on Main Street",
                      submittedBy: "John Doe",
                      submittedAt: "2024-01-15 14:30",
                      proofType: "Photo Evidence",
                      status: "pending-review",
                    },
                    {
                      taskId: "TR-2024-0231",
                      title: "Traffic signal maintenance",
                      submittedBy: "Sarah Wilson",
                      submittedAt: "2024-01-15 13:15",
                      proofType: "Video + Report",
                      status: "pending-review",
                    },
                    {
                      taskId: "PS-2024-0154",
                      title: "Park bench installation",
                      submittedBy: "Mike Johnson",
                      submittedAt: "2024-01-15 11:45",
                      proofType: "Photo Evidence",
                      status: "approved",
                    },
                  ].map((proof) => (
                    <Card key={proof.taskId} className="bg-accent border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-foreground font-medium">{proof.title}</h4>
                            <p className="text-muted-foreground text-sm font-mono">{proof.taskId}</p>
                          </div>
                          <Badge variant={proof.status === "approved" ? "default" : "secondary"} className="text-xs">
                            {proof.status.toUpperCase().replace("-", " ")}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Submitted By:</span>
                            <p className="text-foreground">{proof.submittedBy}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Proof Type:</span>
                            <p className="text-foreground">{proof.proofType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <p className="text-foreground">{proof.submittedAt}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 bg-transparent min-w-fit"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">View </span>Evidence
                            </Button>
                            {proof.status === "pending-review" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-400 bg-transparent min-w-fit"
                                >
                                  Reject
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 min-w-fit">
                                  Approve
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Upload New Proof */}
              <div className="border-t border-border pt-6">
                <h3 className="text-foreground font-semibold mb-4">Submit Proof of Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Task ID</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select completed task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WD-2024-0895">WD-2024-0895 - Valve replacement</SelectItem>
                          <SelectItem value="TR-2024-0235">TR-2024-0235 - Road marking</SelectItem>
                          <SelectItem value="PS-2024-0157">PS-2024-0157 - Equipment check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Proof Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proof type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photo">Photo Evidence</SelectItem>
                          <SelectItem value="video">Video Evidence</SelectItem>
                          <SelectItem value="document">Document/Report</SelectItem>
                          <SelectItem value="combined">Combined Evidence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Upload Files</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Drag & drop files here or click to browse</p>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Choose Files
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">Work Summary</label>
                  <Textarea
                    placeholder="Describe the work completed and any relevant details..."
                    className="resize-none mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button className="bg-primary hover:bg-primary/90">Submit Proof</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
