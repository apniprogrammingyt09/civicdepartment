"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAuth } from "firebase/auth"
import { AlertTriangle, Clock, Users, MessageSquare, ArrowUp } from "lucide-react"

interface EscalationPageProps {
  selectedDepartment: string
}

export default function EscalationPage({ selectedDepartment }: EscalationPageProps) {
  const [escalatedTasks, setEscalatedTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [approvedEscalations, setApprovedEscalations] = useState<any[]>([])
  const [rejectedEscalations, setRejectedEscalations] = useState<any[]>([])

  useEffect(() => {
    // Pending escalations - filter by department
    const pendingRef = collection(db, 'issues')
    let pendingQuery = query(pendingRef, where('escalation.status', '==', 'pending'))
    
    if (selectedDepartment !== 'all') {
      pendingQuery = query(pendingRef, 
        where('escalation.status', '==', 'pending'),
        where('department', '==', selectedDepartment)
      )
    }
    
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.summary || 'Issue reported',
          department: data.department || 'Unknown',
          assignee: data.assignedPersonnel?.name || 'Unassigned',
          escalatedBy: data.escalation?.escalatedBy || 'Worker',
          escalatedAt: data.escalation?.escalatedAt?.toDate?.()?.toLocaleString() || 'Recently',
          priority: data.priority?.toLowerCase() || 'medium',
          reason: data.escalation?.reason || 'No reason provided',
          status: 'pending-approval',
          location: data.geoData?.address || 'Unknown location'
        }
      })
      setEscalatedTasks(tasks)
      setLoading(false)
    })

    // Approved escalations - filter by department
    let approvedQuery = query(pendingRef, where('escalation.status', '==', 'approved'))
    
    if (selectedDepartment !== 'all') {
      approvedQuery = query(pendingRef, 
        where('escalation.status', '==', 'approved'),
        where('department', '==', selectedDepartment)
      )
    }
    const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.summary || 'Issue reported',
          escalatedBy: data.escalation?.escalatedBy || 'Worker',
          approvedBy: data.escalation?.approvedBy || 'Admin',
          approvedAt: data.escalation?.approvedAt?.toDate?.()?.toLocaleString() || 'Recently',
          reason: data.escalation?.reason || 'No reason provided'
        }
      })
      setApprovedEscalations(tasks)
    })

    // Rejected escalations - filter by department
    let rejectedQuery = query(pendingRef, where('escalation.status', '==', 'rejected'))
    
    if (selectedDepartment !== 'all') {
      rejectedQuery = query(pendingRef, 
        where('escalation.status', '==', 'rejected'),
        where('department', '==', selectedDepartment)
      )
    }
    const unsubscribeRejected = onSnapshot(rejectedQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.summary || 'Issue reported',
          escalatedBy: data.escalation?.escalatedBy || 'Worker',
          rejectedBy: data.escalation?.rejectedBy || 'Admin',
          rejectedAt: data.escalation?.rejectedAt?.toDate?.()?.toLocaleString() || 'Recently',
          reason: data.escalation?.reason || 'No reason provided'
        }
      })
      setRejectedEscalations(tasks)
    })

    return () => {
      unsubscribePending()
      unsubscribeApproved()
      unsubscribeRejected()
    }
  }, [selectedDepartment])

  const handleApproveEscalation = async (taskId: string) => {
    try {
      const auth = getAuth()
      const task = escalatedTasks.find(t => t.id === taskId)
      
      const issueRef = doc(db, 'issues', taskId)
      await updateDoc(issueRef, {
        'escalation.status': 'approved',
        'escalation.approvedBy': 'Department Admin',
        'escalation.approvedAt': serverTimestamp(),
        status: 'assign',
        lastUpdated: serverTimestamp()
      })
      
      // Create social media post
      if (task) {
        await createEscalationPost(task)
        await notifyOriginalUser(task)
      }
    } catch (error) {
      console.error('Error approving escalation:', error)
    }
  }

  const createEscalationPost = async (task: any) => {
    try {
      const auth = getAuth()
      const postsRef = collection(db, 'posts')
      await addDoc(postsRef, {
        description: `🚨 Escalation Approved: ${task.title} at ${task.location}. This issue has been escalated and approved for priority handling by the department.`,
        imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/delete-task-3d-icon-png-download-12470285.png',
        createdAt: serverTimestamp(),
        reportedTime: serverTimestamp(),
        geoData: {
          address: task.location,
          city: task.location,
          region: 'Madhya Pradesh',
          country: 'India'
        },
        userId: auth.currentUser?.uid,
        uid: auth.currentUser?.uid,
        userName: 'Civic Department',
        userAvatar: 'https://ui-avatars.com/api/?name=Dept&background=0066cc&color=fff',
        isEscalated: true,
        originalIssueId: task.id,
        status: 'escalated-approved',
        tags: ['#EscalationApproved', '#PriorityIssue']
      })
    } catch (error) {
      console.error('Error creating escalation post:', error)
    }
  }

  const notifyOriginalUser = async (task: any) => {
    try {
      // Get original issue to find user who posted it
      const issuesRef = collection(db, 'issues')
      const issueQuery = query(issuesRef, where('__name__', '==', task.id))
      const issueSnapshot = await getDocs(issueQuery)
      
      if (!issueSnapshot.empty) {
        const issueData = issueSnapshot.docs[0].data()
        const originalUserId = issueData.userId
        const originalPostId = issueData.originalPostId
        
        if (originalUserId) {
          // Create notification for original user
          const notificationsRef = collection(db, 'notifications')
          await addDoc(notificationsRef, {
            userId: originalUserId,
            title: 'Escalation Approved',
            message: `Your reported issue "${task.title}" has been escalated and approved for priority handling.`,
            type: 'escalation_approved',
            issueId: task.id,
            createdAt: serverTimestamp(),
            read: false
          })
        }
        
        // Update original post status to show escalation approved
        if (originalPostId) {
          const postRef = doc(db, 'posts', originalPostId)
          await updateDoc(postRef, {
            status: 'escalated-approved',
            escalationApproved: true,
            escalationApprovedAt: serverTimestamp()
          })
        }
      }
    } catch (error) {
      console.error('Error notifying user:', error)
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
    } catch (error) {
      console.error('Error rejecting escalation:', error)
    }
  }

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
                <p className="text-foreground text-xl md:text-2xl font-bold">{escalatedTasks.length}</p>
                <p className="text-red-500 text-xs">Requires attention</p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs md:text-sm">Approved Escalations</p>
                <p className="text-foreground text-xl md:text-2xl font-bold">{approvedEscalations.length}</p>
                <p className="text-green-500 text-xs">Successfully approved</p>
              </div>
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs md:text-sm">Rejected Escalations</p>
                <p className="text-foreground text-xl md:text-2xl font-bold">{rejectedEscalations.length}</p>
                <p className="text-red-500 text-xs">Declined requests</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading escalated tasks...</p>
            </div>
          ) : escalatedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No escalated tasks found</p>
            </div>
          ) : (
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
                        ESCALATED
                      </Badge>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {task.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4">
                    <div>
                      <span className="text-muted-foreground text-xs">Department:</span>
                      <p className="text-foreground text-sm">{task.department}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Assignee:</span>
                      <p className="text-foreground text-sm">{task.assignee}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Escalated By:</span>
                      <p className="text-foreground text-sm">{task.escalatedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Location:</span>
                      <p className="text-foreground text-sm">{task.location}</p>
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
                        className="text-red-500 hover:text-red-400 bg-transparent min-w-fit text-xs"
                        onClick={() => handleRejectEscalation(task.id)}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 min-w-fit text-xs"
                        onClick={() => handleApproveEscalation(task.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Escalations History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            ✅ APPROVED ESCALATIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedEscalations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No approved escalations</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {approvedEscalations.map((task) => (
                <div key={task.id} className="p-3 bg-green-50 dark:bg-green-950 rounded border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-foreground font-medium text-sm">{task.title}</h4>
                      <p className="text-muted-foreground text-xs font-mono">{task.id}</p>
                    </div>
                    <Badge variant="default" className="text-xs bg-green-600">
                      APPROVED
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Escalated by:</span>
                      <p className="text-foreground">{task.escalatedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approved by:</span>
                      <p className="text-foreground">{task.approvedBy}</p>
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded mb-2">
                    <span className="text-muted-foreground text-xs">Reason:</span>
                    <p className="text-foreground text-xs">{task.reason}</p>
                  </div>
                  <span className="text-muted-foreground text-xs">Approved: {task.approvedAt}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected Escalations History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            ❌ REJECTED ESCALATIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rejectedEscalations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rejected escalations</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {rejectedEscalations.map((task) => (
                <div key={task.id} className="p-3 bg-red-50 dark:bg-red-950 rounded border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-foreground font-medium text-sm">{task.title}</h4>
                      <p className="text-muted-foreground text-xs font-mono">{task.id}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      REJECTED
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Escalated by:</span>
                      <p className="text-foreground">{task.escalatedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rejected by:</span>
                      <p className="text-foreground">{task.rejectedBy}</p>
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded mb-2">
                    <span className="text-muted-foreground text-xs">Reason:</span>
                    <p className="text-foreground text-xs">{task.reason}</p>
                  </div>
                  <span className="text-muted-foreground text-xs">Rejected: {task.rejectedAt}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}