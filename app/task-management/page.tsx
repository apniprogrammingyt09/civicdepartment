"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, arrayUnion, addDoc, getDocs } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "@/lib/firebase"
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
  X,
} from "lucide-react"

const DEPARTMENTS = {
  'pwd': { name: 'Public Works Department' },
  'water': { name: 'Water Supply & Sewage' },
  'swm': { name: 'Solid Waste Management' },
  'traffic': { name: 'Traffic Police / Transport' },
  'health': { name: 'Health & Sanitation' },
  'environment': { name: 'Environment & Parks' },
  'electricity': { name: 'Electricity Department' },
  'disaster': { name: 'Disaster Management' }
}

interface TaskManagementPageProps {
  selectedDepartment: string
}

export default function TaskManagementPage({ selectedDepartment }: TaskManagementPageProps) {
  const auth = getAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [issues, setIssues] = useState<any[]>([])
  const [civicWorkers, setCivicWorkers] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState("")
  const [selectedWorker, setSelectedWorker] = useState("")
  const [loading, setLoading] = useState(true)
  const [evidenceModal, setEvidenceModal] = useState<{open: boolean, task: any}>({open: false, task: null})
  const [assignModal, setAssignModal] = useState<{open: boolean, taskId: string}>({open: false, taskId: ''})
  const [assignSuccess, setAssignSuccess] = useState(false)


  useEffect(() => {
    const issuesRef = collection(db, 'issues')
    let q
    
    if (selectedDepartment && selectedDepartment !== 'all') {
      q = query(issuesRef, where('department', '==', selectedDepartment))
    } else {
      q = query(issuesRef)
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        title: doc.data().summary || 'Issue reported',
        description: doc.data().summary || 'No description',
        severity: doc.data().priority?.toLowerCase() === 'high' ? 'critical' : 
                 doc.data().priority?.toLowerCase() === 'medium' ? 'medium' : 'low',
        assignee: doc.data().assignedPersonnel?.name || null,
        reportedBy: 'Citizen',
        location: doc.data().geoData?.address || doc.data().geoData?.city || 'Unknown',
        createdAt: doc.data().reportedTime || 'Recently',
        estimatedTime: doc.data().eta || 'TBD'
      }))
      // Sort by reportedAt in JavaScript instead of Firestore
      issuesData.sort((a, b) => {
        const aTime = a.reportedAt?.toDate?.() || new Date(0)
        const bTime = b.reportedAt?.toDate?.() || new Date(0)
        return bTime - aTime
      })

      setIssues(issuesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedDepartment])

  useEffect(() => {
    const civicUsersRef = collection(db, 'civicUsers')
    let q = query(civicUsersRef, where('active', '==', true))
    
    if (selectedDepartment && selectedDepartment !== 'all') {
      q = query(civicUsersRef, where('active', '==', true), where('departmentId', '==', selectedDepartment))
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const workersData = await Promise.all(snapshot.docs.map(async (doc) => {
        const workerData = { id: doc.id, ...doc.data() }
        
        // Count actual assigned tasks
        const issuesRef = collection(db, 'issues')
        const assignedQuery = query(issuesRef, where('assignedPersonnel.id', '==', workerData.uid || workerData.id))
        const assignedSnapshot = await getDocs(assignedQuery)
        
        return {
          ...workerData,
          currentTasks: assignedSnapshot.size
        }
      }))

      setCivicWorkers(workersData)
    })

    return () => unsubscribe()
  }, [selectedDepartment])

  const tasks = issues

  const updateUserPostStatus = async (taskId: string, newStatus: string) => {
    try {
      const issuesRef = collection(db, 'issues')
      const issueQuery = query(issuesRef, where('__name__', '==', taskId))
      const issueSnapshot = await getDocs(issueQuery)
      
      if (!issueSnapshot.empty) {
        const issueData = issueSnapshot.docs[0].data()
        const originalPostId = issueData.originalPostId
        
        if (originalPostId) {
          const postRef = doc(db, 'posts', originalPostId)
          await updateDoc(postRef, {
            status: newStatus,
            lastStatusUpdate: serverTimestamp()
          })
        }
      }
    } catch (error) {
      console.error('Error updating user post status:', error)
    }
  }

  const assignTask = async (taskId: string, workerId?: string) => {
    try {
      const worker = workerId ? civicWorkers.find(w => w.id === workerId) : civicWorkers[0]
      if (!worker) return
      
      const assignedId = worker.uid || worker.id
      
      const issueRef = doc(db, 'issues', taskId)
      await updateDoc(issueRef, {
        status: 'assign',
        assignedAt: serverTimestamp(),
        assignedTime: new Date().toLocaleString(),
        assignedPersonnel: {
          name: worker.name,
          department: worker.departmentId || worker.department || 'Unknown',
          contact: worker.email,
          id: assignedId
        },
        updateHistory: arrayUnion({
          status: 'assign',
          timestamp: new Date().toLocaleString(),
          updatedBy: 'Department Admin'
        })
      })
      
      // Update user post status
      await updateUserPostStatus(taskId, 'assigned')

    } catch (error) {
      console.error('Error assigning task:', error)
    }
  }

  const handleQuickAssign = async () => {
    if (selectedTask && selectedWorker) {
      await assignTask(selectedTask, selectedWorker)
      setAssignSuccess(true)
      setTimeout(() => setAssignSuccess(false), 2000)
      setSelectedTask("")
      setSelectedWorker("")
    }
  }

  const handleApproveProof = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      const issueRef = doc(db, 'issues', taskId)
      await updateDoc(issueRef, {
        status: 'resolved',
        proofStatus: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: 'Department Admin'
      })
      
      // Update user post status
      await updateUserPostStatus(taskId, 'resolved')
      
      // Award civic score to worker and update badges
      if (task?.assignedPersonnel?.id) {
        const civicUsersRef = collection(db, 'civicUsers')
        const workerQuery = query(civicUsersRef, where('uid', '==', task.assignedPersonnel.id))
        const workerSnapshot = await getDocs(workerQuery)
        
        if (!workerSnapshot.empty) {
          const workerDoc = workerSnapshot.docs[0]
          const workerData = workerDoc.data()
          const currentScore = workerData.civicScore || 0
          const tasksCompleted = (workerData.tasksCompleted || 0) + 1
          const newScore = currentScore + 100
          
          // Calculate badges based on performance
          let badgeCount = 0
          if (tasksCompleted >= 50) badgeCount++
          if (tasksCompleted >= 10) badgeCount++
          if (tasksCompleted >= 20) badgeCount++
          if (newScore >= 1000) badgeCount++
          if (newScore >= 5000) badgeCount++
          
          await updateDoc(doc(db, 'civicUsers', workerDoc.id), {
            civicScore: newScore,
            tasksCompleted: tasksCompleted,
            earnedBadges: badgeCount,
            lastScoreUpdate: serverTimestamp()
          })
        }
      }
      
      // Create social media post
      await createSocialMediaPost(taskId)
    } catch (error) {
      console.error('Error approving proof:', error)
    }
  }

  const handleRejectProof = async (taskId: string) => {
    try {
      const issueRef = doc(db, 'issues', taskId)
      await updateDoc(issueRef, {
        status: 'assign',
        proofStatus: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: 'Department Admin'
      })
      
      // Update user post status
      await updateUserPostStatus(taskId, 'assign')
    } catch (error) {
      console.error('Error rejecting proof:', error)
    }
  }

  const handleApproveEscalation = async (taskId: string) => {
    try {
      const issueRef = doc(db, 'issues', taskId)
      await updateDoc(issueRef, {
        'escalation.status': 'approved',
        'escalation.approvedBy': 'Department Admin',
        'escalation.approvedAt': serverTimestamp(),
        status: 'assign',
        lastUpdated: serverTimestamp()
      })
      
      // Update user post status
      await updateUserPostStatus(taskId, 'escalated-approved')
      
      // Create social media post for escalation approval
      await createEscalationPost(taskId)
    } catch (error) {
      console.error('Error approving escalation:', error)
    }
  }
  
  const createEscalationPost = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      
      const postsRef = collection(db, 'posts')
      await addDoc(postsRef, {
        description: `🚨 Escalation Approved: ${task.title} at ${task.location}. This issue has been escalated and approved for priority handling by the department${task.userRating ? `. Citizen Feedback: ${task.userRating}/5 ⭐` : ''}.`,
        imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/delete-task-3d-icon-png-download-12470285.png',
        createdAt: serverTimestamp(),
        reportedTime: serverTimestamp(),
        geoData: {
          address: task.geoData?.address || task.location,
          city: task.geoData?.city || task.location,
          region: task.geoData?.region || 'Madhya Pradesh',
          country: task.geoData?.country || 'India'
        },
        userId: auth.currentUser?.uid,
        uid: auth.currentUser?.uid,
        userName: DEPARTMENTS[selectedDepartment]?.name || 'Civic Department',
        userAvatar: 'https://ui-avatars.com/api/?name=Dept&background=0066cc&color=fff',
        isEscalated: true,
        originalIssueId: taskId,
        status: 'escalated-approved',
        userRating: task.userRating,
        tags: ['#EscalationApproved', '#PriorityIssue']
      })
    } catch (error) {
      console.error('Error creating escalation post:', error)
    }
  }

  const handleRejectEscalation = async (taskId: string) => {
    try {
      const issueRef = doc(db, 'issues', taskId)
      await updateDoc(issueRef, {
        'escalation.status': 'rejected',
        'escalation.rejectedBy': 'Department Admin',
        'escalation.rejectedAt': serverTimestamp(),
        status: 'assign',
        lastUpdated: serverTimestamp()
      })
      
      // Update user post status
      await updateUserPostStatus(taskId, 'assign')
    } catch (error) {
      console.error('Error rejecting escalation:', error)
    }
  }

  const createSocialMediaPost = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      
      // Use proof of work image if available
      const proofImage = task.proofOfWork?.[0]?.mediaUrl || 'https://picsum.photos/400/300?random=' + Date.now()
      
      const postsRef = collection(db, 'posts')
      await addDoc(postsRef, {
        description: `✅ Issue Resolved: ${task.title} at ${task.location}. Thank you for reporting this civic issue. Our team has successfully completed the work${task.userRating ? `. Citizen Satisfaction: ${task.userRating}/5 ⭐` : ''}.`,
        imageUrl: proofImage,
        createdAt: serverTimestamp(),
        reportedTime: serverTimestamp(),
        geoData: {
          address: task.geoData?.address || task.location,
          city: task.geoData?.city || task.location,
          region: task.geoData?.region || 'Madhya Pradesh',
          country: task.geoData?.country || 'India',
          latitude: task.geoData?.latitude,
          longitude: task.geoData?.longitude
        },
        userId: auth.currentUser?.uid,
        uid: auth.currentUser?.uid,
        userName: DEPARTMENTS[selectedDepartment]?.name || 'Civic Department',
        userAvatar: 'https://ui-avatars.com/api/?name=Dept&background=0066cc&color=fff',
        isResolved: true,
        originalIssueId: taskId,
        proofOfWork: task.proofOfWork || [],
        status: 'resolved',
        tags: ['#IssueResolved', '#CivicUpdate']
      })
    } catch (error) {
      console.error('Error creating social media post:', error)
      // Continue with approval even if post creation fails
    }
  }



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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading issues...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No issues found for this department</p>
              </div>
            ) : (
              tasks.map((task) => (
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
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 min-w-fit"
                            onClick={() => setAssignModal({open: true, taskId: task.id})}
                          >
                            <span className="hidden sm:inline">Assign </span>Task
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
                  {civicWorkers.map((member) => (
                    <Card
                      key={member.id}
                      className={`bg-accent border-border ${member.active ? "hover:border-primary/50" : "opacity-60"}`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-foreground font-medium">{member.name}</h4>
                          <Badge variant={member.active ? "default" : "secondary"} className="text-xs">
                            {member.active ? "AVAILABLE" : "BUSY"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{member.role}</p>
                        <p className="text-muted-foreground text-xs">{member.department}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">Current Tasks: {member.currentTasks}</span>
                          <Button size="sm" disabled={!member.active} className="text-xs min-w-fit">
                            <span className="hidden sm:inline">View </span>Profile
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
                      <Select value={selectedTask} onValueChange={setSelectedTask}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose unassigned task" />
                        </SelectTrigger>
                        <SelectContent>
                          {tasks.filter(task => !task.assignee).map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.id} - {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Assign To</label>
                      <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {civicWorkers.filter(worker => worker.active).map(worker => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} - {worker.role}
                            </SelectItem>
                          ))}
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
                  <Button 
                    className={`${assignSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'} transition-all duration-300`}
                    onClick={handleQuickAssign}
                    disabled={!selectedTask || !selectedWorker}
                  >
                    {assignSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 animate-bounce" />
                        Assigned!
                      </>
                    ) : (
                      'Assign Task'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Board tab */}
        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Pending", status: "working" },
              { label: "In Progress", status: "assign" },
              { label: "Escalated", status: "escalated" },
              { label: "Resolved", status: "resolved" }
            ].map((column) => (
              <Card key={column.status} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider">
                    {column.label.toUpperCase()}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {tasks.filter(task => task.status === column.status).length} tasks
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks
                      .filter((task) => {
                        if (column.status === 'escalated') {
                          return task.escalation && task.escalation.status === 'pending'
                        }
                        return task.status === column.status
                      })
                      .map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 bg-accent rounded border-l-4 ${column.status === 'escalated' ? 'border-orange-500' : 'border-primary'} hover:bg-accent/80 transition-colors cursor-pointer`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(task.severity)}`}></div>
                          </div>
                          <h4 className="text-foreground text-sm font-medium mb-1">{task.title}</h4>
                          <p className="text-muted-foreground text-xs">{task.location}</p>
                          {task.assignee && (
                            <p className="text-muted-foreground text-xs mt-1">Assigned to: {task.assignee}</p>
                          )}
                          {task.escalation && (
                            <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950 rounded text-xs">
                              <p className="text-orange-700 dark:text-orange-300 font-medium">Escalated by: {task.escalation.escalatedBy}</p>
                              <p className="text-orange-600 dark:text-orange-400">{task.escalation.reason}</p>

                            </div>
                          )}
                        </div>
                      ))}
                    {tasks.filter(task => task.status === column.status).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No {column.label.toLowerCase()} tasks
                      </div>
                    )}
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
                  {tasks
                    .filter(task => task.status === 'pending-review')
                    .map((task) => (
                    <Card key={task.id} className="bg-accent border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-foreground font-medium">{task.title}</h4>
                            <p className="text-muted-foreground text-sm font-mono">{task.id}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            PENDING REVIEW
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Submitted By:</span>
                            <p className="text-foreground">{task.assignee || 'Worker'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="text-foreground">{task.location}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <p className="text-foreground">{task.createdAt}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 bg-transparent min-w-fit"
                              onClick={() => setEvidenceModal({open: true, task})}
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">View </span>Evidence
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-400 bg-transparent min-w-fit"
                              onClick={() => handleRejectProof(task.id)}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 min-w-fit"
                              onClick={() => handleApproveProof(task.id)}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasks.filter(task => task.status === 'pending-review').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending proof reviews
                    </div>
                  )}
                </div>
              </div>

              {/* Approved Proof History */}
              <div className="border-t border-border pt-6">
                <h3 className="text-foreground font-semibold mb-4">✅ Approved Proof of Work</h3>
                <div className="space-y-4">
                  {tasks
                    .filter(task => task.proofStatus === 'approved')
                    .map((task) => (
                    <Card key={task.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-foreground font-medium">{task.title}</h4>
                            <p className="text-muted-foreground text-sm font-mono">{task.id}</p>
                          </div>
                          <Badge variant="default" className="text-xs">
                            APPROVED
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Worker:</span>
                            <p className="text-foreground">{task.assignee || 'Worker'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="text-foreground">{task.location}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Approved:</span>
                            <p className="text-foreground">{task.approvedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Approved By:</span>
                            <p className="text-foreground">{task.approvedBy || 'Department Admin'}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 min-w-fit"
                            onClick={() => setEvidenceModal({open: true, task})}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View </span>Evidence
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasks.filter(task => task.proofStatus === 'approved').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved proof of work yet
                    </div>
                  )}
                </div>
              </div>

              {/* Rejected Proof History */}
              <div className="border-t border-border pt-6">
                <h3 className="text-foreground font-semibold mb-4">❌ Rejected Proof of Work</h3>
                <div className="space-y-4">
                  {tasks
                    .filter(task => task.proofStatus === 'rejected')
                    .map((task) => (
                    <Card key={task.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-foreground font-medium">{task.title}</h4>
                            <p className="text-muted-foreground text-sm font-mono">{task.id}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            REJECTED
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Worker:</span>
                            <p className="text-foreground">{task.assignee || 'Worker'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="text-foreground">{task.location}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rejected:</span>
                            <p className="text-foreground">{task.rejectedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rejected By:</span>
                            <p className="text-foreground">{task.rejectedBy || 'Department Admin'}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 min-w-fit"
                            onClick={() => setEvidenceModal({open: true, task})}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View </span>Evidence
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 min-w-fit"
                            onClick={() => handleApproveProof(task.id)}
                          >
                            Re-approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasks.filter(task => task.proofStatus === 'rejected').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No rejected proof of work
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Evidence Modal */}
      {evidenceModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Proof of Work Evidence</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEvidenceModal({open: false, task: null})}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Task Details</h3>
                <div className="bg-muted p-3 rounded space-y-1 text-sm">
                  <div><strong>ID:</strong> {evidenceModal.task?.id}</div>
                  <div><strong>Title:</strong> {evidenceModal.task?.title}</div>
                  <div><strong>Location:</strong> {evidenceModal.task?.location}</div>
                  <div><strong>Assigned to:</strong> {evidenceModal.task?.assignee}</div>
                </div>
              </div>
              
              {evidenceModal.task?.proofOfWork?.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">Submitted Evidence</h3>
                  {evidenceModal.task.proofOfWork.map((proof: any, index: number) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <img 
                        src={proof.mediaUrl} 
                        alt="Proof of work" 
                        className="w-full h-64 object-cover rounded"
                      />
                      <div className="space-y-2 text-sm">
                        <div><strong>Submitted:</strong> {new Date(proof.timestamp).toLocaleString()}</div>
                        {proof.location && (
                          <div><strong>Location:</strong> {proof.location.lat.toFixed(6)}, {proof.location.lng.toFixed(6)}</div>
                        )}
                        {proof.geoVerified && (
                          <div className="text-green-600"><strong>✓ Location Verified</strong> (Accuracy: {proof.accuracy?.toFixed(0)}m)</div>
                        )}
                        {proof.notes && (
                          <div><strong>Notes:</strong> {proof.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No proof of work submitted yet
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t">
              {evidenceModal.task?.proofStatus !== 'approved' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleRejectProof(evidenceModal.task?.id)
                      setEvidenceModal({open: false, task: null})
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      handleApproveProof(evidenceModal.task?.id)
                      setEvidenceModal({open: false, task: null})
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <div className="text-green-600 font-medium">
                  ✓ Already Approved
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Assign Task Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Assign Task</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAssignModal({open: false, taskId: ''})}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <h3 className="font-medium">Select Team Member</h3>
              <div className="space-y-2">
                {civicWorkers.filter(worker => worker.active).map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={async () => {
                      await assignTask(assignModal.taskId, worker.id)
                      setAssignModal({open: false, taskId: ''})
                    }}
                  >
                    <div>
                      <h4 className="font-medium">{worker.name}</h4>
                      <p className="text-sm text-muted-foreground">{worker.role}</p>
                      <p className="text-xs text-muted-foreground">Current tasks: {worker.currentTasks}</p>
                    </div>
                    <Badge variant={worker.currentTasks < 3 ? "default" : "secondary"}>
                      {worker.currentTasks < 3 ? "Available" : "Busy"}
                    </Badge>
                  </div>
                ))}
                {civicWorkers.filter(worker => worker.active).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No available team members
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  )
}
