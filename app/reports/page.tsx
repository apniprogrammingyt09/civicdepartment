"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, Filter, Star, MessageSquare, Calendar } from "lucide-react"

export default function ReportsPage() {
  const archivedReports = [
    {
      id: "WD-2024-0850",
      title: "Water main repair on Elm Street",
      department: "Water & Sanitation",
      resolvedBy: "Mike Johnson",
      resolvedAt: "2024-01-10 14:30",
      citizenRating: 5,
      category: "Infrastructure",
    },
    {
      id: "TR-2024-0201",
      title: "Traffic light synchronization downtown",
      department: "Traffic Management",
      resolvedBy: "Sarah Wilson",
      resolvedAt: "2024-01-09 16:45",
      citizenRating: 4,
      category: "Traffic",
    },
    {
      id: "PS-2024-0134",
      title: "Noise complaint resolution - Restaurant District",
      department: "Public Safety",
      resolvedBy: "Lisa Chen",
      resolvedAt: "2024-01-08 11:20",
      citizenRating: 3,
      category: "Public Safety",
    },
  ]

  const citizenFeedback = [
    {
      issueId: "WD-2024-0892",
      citizen: "John Smith",
      rating: 5,
      comment: "Excellent response time! The water issue was fixed within 2 hours of reporting.",
      submittedAt: "2024-01-15 16:30",
      status: "resolved",
    },
    {
      issueId: "TR-2024-0234",
      citizen: "Mary Johnson",
      rating: 2,
      comment: "The traffic light is still malfunctioning. This issue was marked as resolved but the problem persists.",
      submittedAt: "2024-01-15 14:20",
      status: "reopened",
    },
    {
      issueId: "PS-2024-0156",
      citizen: "David Wilson",
      rating: 4,
      comment: "Good communication throughout the process. The noise issue has been addressed.",
      submittedAt: "2024-01-14 19:45",
      status: "closed",
    },
  ]

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
                <p className="text-foreground text-2xl font-bold">1,247</p>
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
                <p className="text-foreground text-2xl font-bold">4.2</p>
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
                <p className="text-foreground text-2xl font-bold">12</p>
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
                <p className="text-foreground text-2xl font-bold">45</p>
                <p className="text-green-500 text-xs">This month</p>
              </div>
              <Download className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Archive */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              REPORTS ARCHIVE
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export All
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Generate Report
              </Button>
            </div>
          </div>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Department:</span>
                    <p className="text-foreground">{report.department}</p>
                  </div>
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
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
              </div>
            ))}
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
            {citizenFeedback.map((feedback, index) => (
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

                <p className="text-foreground mb-3 italic">"{feedback.comment}"</p>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Submitted: {feedback.submittedAt}</span>
                  {feedback.status === "reopened" && (
                    <Button size="sm" variant="destructive">
                      Review Reopened Issue
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
