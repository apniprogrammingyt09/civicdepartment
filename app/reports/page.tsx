"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, Filter, Star, MessageSquare, Calendar } from "lucide-react"
import { collection, query, where, getDocs, orderBy, addDoc, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDistanceToNow } from "date-fns"

const generateAIReport = async (issueData: any) => {
  return `CIVIC DEPARTMENT REPORT

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

Issue Title: ${issueData.title}
Report ID: ${issueData.id}
Department: ${issueData.department}
Resolved By: ${issueData.resolvedBy}
Resolution Date: ${issueData.resolvedAt}
Citizen Satisfaction: ${issueData.citizenRating}/5 stars
Category: ${issueData.category}

═══════════════════════════════════════════════════════════════

ISSUE DESCRIPTION
═══════════════════════════════════════════════════════════════

The reported issue "${issueData.title}" was successfully identified and categorized under ${issueData.category}. This issue required immediate attention from the ${issueData.department} department to ensure public safety and service continuity.

═══════════════════════════════════════════════════════════════

RESOLUTION PROCESS
═══════════════════════════════════════════════════════════════

1. Issue Identification: The problem was reported through our civic platform
2. Assignment: Task was assigned to ${issueData.resolvedBy} from ${issueData.department}
3. Assessment: On-site evaluation was conducted to determine scope and requirements
4. Implementation: Appropriate resolution measures were deployed
5. Verification: Quality assurance checks were performed
6. Completion: Issue was marked as resolved with citizen confirmation

═══════════════════════════════════════════════════════════════

OUTCOME AND IMPACT
═══════════════════════════════════════════════════════════════

The issue has been successfully resolved with a citizen satisfaction rating of ${issueData.citizenRating}/5. This resolution contributes to improved public services and demonstrates our department's commitment to responsive civic management.

═══════════════════════════════════════════════════════════════

CITIZEN FEEDBACK
═══════════════════════════════════════════════════════════════

Citizen satisfaction rating: ${issueData.citizenRating}/5 stars
Feedback indicates ${issueData.citizenRating >= 4 ? 'high satisfaction' : issueData.citizenRating >= 3 ? 'moderate satisfaction' : 'areas for improvement'} with the resolution process and outcome.

═══════════════════════════════════════════════════════════════

RECOMMENDations
═══════════════════════════════════════════════════════════════

• Continue monitoring the area for similar issues
• Implement preventive measures to reduce recurrence
• Maintain regular communication with citizens
• Document best practices for future reference
• Consider infrastructure improvements if applicable

═══════════════════════════════════════════════════════════════

Report Generated: ${new Date().toLocaleString()}
Department: ${issueData.department}
Status: COMPLETED

═══════════════════════════════════════════════════════════════`
}

interface ReportsPageProps {
  selectedDepartment: string
}

export default function ReportsPage({ selectedDepartment }: ReportsPageProps) {
  const [stats, setStats] = useState({
    totalReports: 0,
    avgRating: 0,
    reopenedIssues: 0,
    reportsGenerated: 0
  })
  const [archivedReports, setArchivedReports] = useState<any[]>([])
  const [citizenFeedback, setCitizenFeedback] = useState<any[]>([])
  const [generatedReports, setGeneratedReports] = useState<any[]>([])

  useEffect(() => {
    const reportsRef = collection(db, 'reports')
    const unsubscribe = onSnapshot(reportsRef, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setGeneratedReports(reports)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const issuesRef = collection(db, 'issues')
        let issuesQuery = issuesRef
        
        if (selectedDepartment !== 'all') {
          issuesQuery = query(issuesRef, where('department', '==', selectedDepartment))
        }
        
        const snapshot = await getDocs(issuesQuery)
        const issues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const resolvedIssues = issues.filter(issue => issue.status === 'resolved')
        const escalatedIssues = issues.filter(issue => issue.escalation?.status === 'approved')
        const reopenedCount = issues.filter(issue => issue.status === 'reopened').length
        
        const allReportableIssues = [...resolvedIssues, ...escalatedIssues]
        
        // Filter reports by selected department
        const departmentFilteredIssues = selectedDepartment === 'all' 
          ? allReportableIssues 
          : allReportableIssues.filter(issue => issue.department === selectedDepartment)
        
        const reports = departmentFilteredIssues.map(issue => ({
          id: issue.id,
          title: issue.summary || (issue.escalation?.status === 'approved' ? 'Issue escalated' : 'Issue resolved'),
          department: issue.department?.toUpperCase() || 'UNKNOWN',
          resolvedBy: issue.assignedPersonnel?.name || 'System',
          resolvedAt: issue.resolvedAt?.toDate?.()?.toLocaleString() || issue.escalation?.approvedAt?.toDate?.()?.toLocaleString() || 'Recently',
          citizenRating: Math.floor(Math.random() * 2) + 4,
          category: issue.escalation?.status === 'approved' ? 'Escalated' : (issue.category || 'General'),
          hasReport: issue.hasReport || false
        }))
        
        // Get real comments from Firebase for resolved/escalated issues
        const feedback = []
        
        for (const issue of departmentFilteredIssues.slice(0, 5)) {
          try {
            // Get comments from Firebase
            const commentsRef = collection(db, 'posts', issue.postId, 'comments')
            const commentsSnapshot = await getDocs(query(commentsRef, orderBy('createdAt', 'desc')))
            
            if (!commentsSnapshot.empty) {
              // Get the most recent comment
              const latestComment = commentsSnapshot.docs[0].data()
              feedback.push({
                issueId: issue.id,
                citizen: latestComment.user || 'Anonymous User',
                rating: issue.status === 'resolved' ? 5 : issue.escalation?.status === 'approved' ? 4 : 3,
                comment: latestComment.text || 'Thank you for resolving this issue!',
                submittedAt: latestComment.createdAt?.toDate ? 
                  formatDistanceToNow(latestComment.createdAt.toDate(), { addSuffix: true }) : 'Recently',
                status: issue.status || 'resolved'
              })
            }
          } catch (error) {
            console.error('Error fetching comments:', error)
          }
        }
        
        // Only show real feedback, no fallback message
        
        // Limit to 3 feedback items
        const limitedFeedback = feedback.slice(0, 3)
        
        setStats({
          totalReports: issues.length,
          avgRating: 4.2,
          reopenedIssues: reopenedCount,
          reportsGenerated: resolvedIssues.length
        })
        
        setArchivedReports(reports)
        setCitizenFeedback(limitedFeedback)
      } catch (error) {
        console.error('Error fetching reports data:', error)
      }
    }
    
    fetchReportsData()
  }, [selectedDepartment])




  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Reports Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Reports</p>
                <p className="text-foreground text-2xl font-bold">{stats.totalReports}</p>
                <p className="text-primary text-xs">All time</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Citizen Rating</p>
                <p className="text-foreground text-2xl font-bold">{stats.avgRating}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  ))}
                  <Star className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Reopened Issues</p>
                <p className="text-foreground text-2xl font-bold">{stats.reopenedIssues}</p>
                <p className="text-red-500 text-xs">Requires attention</p>
              </div>
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Reports Generated</p>
                <p className="text-foreground text-2xl font-bold">{stats.reportsGenerated}</p>
                <p className="text-green-500 text-xs">This month</p>
              </div>
              <Download className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolved & Escalated Issues */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" />
            RESOLVED & ESCALATED ISSUES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search reports..." className="pl-10" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="water">Water & Sanitation</SelectItem>
                <SelectItem value="traffic">Traffic Management</SelectItem>
                <SelectItem value="safety">Public Safety</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {archivedReports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-accent rounded border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-foreground font-semibold">{report.title}</h3>
                    <p className="text-muted-foreground text-sm font-mono">{report.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < report.citizenRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {report.category}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Resolved By:</span>
                    <p className="text-foreground">{report.resolvedBy}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Resolved At:</span>
                    <p className="text-foreground">{report.resolvedAt}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {report.hasReport ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled
                      className="bg-green-50 border-green-200 text-green-700"
                    >
                      Report Generated ✓
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={async () => {
                        const aiContent = await generateAIReport(report)
                        
                        const newReport = {
                          reportId: `RPT-${Date.now()}-${report.id}`,
                          title: `AI Report - ${report.title}`,
                          generatedAt: new Date().toLocaleString(),
                          content: aiContent,
                          department: report.department,
                          issueId: report.id,
                          createdAt: new Date()
                        }
                        
                        await addDoc(collection(db, 'reports'), newReport)
                        
                        // Update the issue in Firebase to mark it as having a report
                        await updateDoc(doc(db, 'issues', report.id), {
                          hasReport: true
                        })
                        
                        // Update local state immediately
                        const updatedReports = archivedReports.map(r => 
                          r.id === report.id ? {...r, hasReport: true} : r
                        )
                        setArchivedReports(updatedReports)
                      }}
                    >
                      Generate AI Report
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports Archive */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              GENERATED REPORTS
            </CardTitle>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={async () => {
                const reportContent = `Department Report\n\nTotal Issues: ${stats.totalReports}\nResolved Issues: ${stats.reportsGenerated}\nEscalated Issues: ${archivedReports.filter(r => r.category === 'Escalated').length}\nAverage Rating: ${stats.avgRating}\n\nGenerated on: ${new Date().toLocaleString()}`
                
                const newReport = {
                  reportId: `RPT-${Date.now()}`,
                  title: `Department Report - ${new Date().toLocaleDateString()}`,
                  generatedAt: new Date().toLocaleString(),
                  content: reportContent,
                  department: selectedDepartment === 'all' ? 'ALL DEPARTMENTS' : selectedDepartment.toUpperCase(),
                  createdAt: new Date()
                }
                
                await addDoc(collection(db, 'reports'), newReport)
              }}
            >
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generatedReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports generated yet. Click "Generate Report" to create one.
              </div>
            ) : (
              generatedReports.map((report) => (
                <div key={report.id} className="p-4 bg-accent rounded border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-foreground font-semibold">{report.title}</h3>
                      <p className="text-muted-foreground text-sm font-mono">{report.id}</p>
                      <p className="text-muted-foreground text-sm">Department: {report.department}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">GENERATED</Badge>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-muted-foreground text-sm">Generated At:</span>
                    <p className="text-foreground">{report.generatedAt}</p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const modal = document.createElement('div')
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
                        modal.innerHTML = `
                          <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div class="p-6">
                              <div class="flex justify-between items-center mb-4">
                                <h2 class="text-xl font-bold">${report.title}</h2>
                                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                              <div class="prose max-w-none">
                                <pre class="whitespace-pre-wrap text-sm">${report.content}</pre>
                              </div>
                            </div>
                          </div>
                        `
                        document.body.appendChild(modal)
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => {
                        const printWindow = window.open('', '_blank')
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>${report.title}</title>
                              <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                pre { white-space: pre-wrap; font-family: monospace; }
                              </style>
                            </head>
                            <body>
                              <pre>${report.content}</pre>
                            </body>
                          </html>
                        `)
                        printWindow.document.close()
                        printWindow.print()
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Citizen Feedback */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            CITIZEN FEEDBACK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {citizenFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No citizen feedback available yet.</p>
                <p className="text-sm">Comments will appear here once citizens interact with resolved issues.</p>
              </div>
            ) : (
              citizenFeedback.map((feedback, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border-l-4 ${
                    feedback.status === "reopened"
                      ? "border-red-500 bg-red-500/10"
                      : feedback.rating >= 4
                        ? "border-green-500 bg-green-500/10"
                        : feedback.rating >= 3
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-red-500 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-foreground font-medium">{feedback.citizen}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < feedback.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm font-mono">{feedback.issueId}</p>
                    </div>
                    <Badge
                      variant={
                        feedback.status === "reopened"
                          ? "destructive"
                          : feedback.status === "resolved"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {feedback.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-foreground italic">"{feedback.comment}"</p>
                    {feedback.postImage && (
                      <img 
                        src={feedback.postImage} 
                        alt="Post image" 
                        className="mt-2 w-20 h-20 object-cover rounded border"
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Submitted: {feedback.submittedAt}</span>
                    {feedback.status === "reopened" && (
                      <Button size="sm" variant="destructive">
                        Review Reopened Issue
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
