"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award, Target, TrendingUp, Medal, Crown, Zap, Users, Goal as Owl, Search } from "lucide-react"
import { collection, query, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

interface GamificationPageProps {
  selectedDepartment?: string
}

export default function GamificationPage({ selectedDepartment = 'all' }: GamificationPageProps) {
  const [departmentScores, setDepartmentScores] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateDepartmentScores = () => {
      const issuesRef = collection(db, 'issues')
      const postsRef = collection(db, 'posts')
      
      const unsubscribeIssues = onSnapshot(issuesRef, async () => {
        const unsubscribePosts = onSnapshot(postsRef, async () => {
          try {
            const scores = await Promise.all(
              Object.entries(DEPARTMENTS).map(async ([deptId, dept]) => {
                // Get resolved issues
                const resolvedQuery = query(issuesRef, where('department', '==', deptId), where('status', '==', 'resolved'))
                const resolvedSnapshot = await getDocs(resolvedQuery)
                const resolvedCount = resolvedSnapshot.size

                // Get escalated issues (these reduce points as they indicate department failure)
                const escalatedQuery = query(issuesRef, where('department', '==', deptId), where('escalation.status', 'in', ['pending', 'approved']))
                const escalatedSnapshot = await getDocs(escalatedQuery)
                const escalatedCount = escalatedSnapshot.size

                // Get department posts and calculate rating-based scores
                // Try multiple possible usernames for each department
                const possibleUserNames = [
                  DEPARTMENTS[deptId]?.name, // Standard department name
                  `${deptId}_deptverified`,   // Pattern like swm_deptverified
                  `${deptId}_dept`,           // Pattern like swm_dept
                  deptId.toUpperCase(),       // Department ID in caps
                ]
                
                // Get all posts and filter by possible usernames
                const allPostsSnapshot = await getDocs(postsRef)
                console.log(`Checking ${deptId} with possible names:`, possibleUserNames)
                const deptPosts = allPostsSnapshot.docs.filter(doc => {
                  const data = doc.data()
                  const matches = possibleUserNames.includes(data.userName)
                  if (matches) console.log(`Found matching post for ${deptId}:`, data.userName)
                  return matches
                })
                console.log(`Found ${deptPosts.length} posts for ${deptId}`)
                let totalLikes = 0
                let ratingScore = 0
                
                deptPosts.forEach(doc => {
                  const data = doc.data()
                  console.log(`Processing post:`, data.userName, data.isResolved, data.publicRatings)
                  totalLikes += data.likes?.length || 0
                  
                  // Rating-based scoring for resolved tasks
                  if (data.isResolved && data.publicRatings?.work?.average) {
                    const rating = data.publicRatings.work.average
                    if (rating >= 4) {
                      ratingScore += 50 // High rating bonus
                    } else if (rating >= 3) {
                      ratingScore += 20 // Medium rating bonus
                    } else if (rating >= 2) {
                      ratingScore += 5 // Low-medium rating small bonus
                    } else {
                      ratingScore -= 30 // Very low rating penalty
                    }
                  }
                  
                  // Rating-based scoring for escalated tasks
                  if (data.isEscalated && data.publicRatings?.escalation?.average) {
                    const rating = data.publicRatings.escalation.average
                    if (rating >= 4) {
                      ratingScore -= 40 // High validity rating means department failed
                    } else if (rating <= 2) {
                      ratingScore += 20 // Low validity rating means escalation was unjustified
                    }
                  }
                })

                // Calculate score: base points + rating adjustments
                const baseScore = (resolvedCount * 100) + (totalLikes * 10) - (escalatedCount * 50)
                const score = baseScore + ratingScore

                return {
                  id: deptId,
                  name: dept.name,
                  score: Math.max(0, score), // Ensure score doesn't go negative
                  baseScore: baseScore,
                  ratingScore: ratingScore,
                  resolvedIssues: resolvedCount,
                  escalatedIssues: escalatedCount,
                  likes: totalLikes,
                  trend: ratingScore > 0 ? `+${ratingScore}` : ratingScore < 0 ? `${ratingScore}` : "0"
                }
              })
            )

            // Sort by score and assign ranks
            const sortedScores = scores.sort((a, b) => b.score - a.score).map((dept, index) => ({
              ...dept,
              rank: index + 1,
              badge: index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""
            }))

            setDepartmentScores(sortedScores)
            setLoading(false)
          } catch (error) {
            console.error('Error calculating department scores:', error)
          }
        })
        
        return unsubscribePosts
      })
      
      return unsubscribeIssues
    }

    const fetchTopPerformers = () => {
      const civicUsersRef = collection(db, 'civicUsers')
      
      const unsubscribe = onSnapshot(civicUsersRef, (snapshot) => {
        const performers = snapshot.docs.map(doc => {
          const data = doc.data()
          
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            dept: DEPARTMENTS[data.departmentId]?.name || 'Unknown Department',
            score: data.civicScore || 0,
            resolved: data.tasksCompleted || 0,
            rating: 4.5 + Math.random() * 0.5,
            badges: data.earnedBadges || 0
          }
        })

        const sortedPerformers = performers.sort((a, b) => b.score - a.score).slice(0, 10)
        setTopPerformers(sortedPerformers)
      })
      
      return unsubscribe
    }

    const unsubscribeScores = calculateDepartmentScores()
    const unsubscribePerformers = fetchTopPerformers()
    
    return () => {
      unsubscribeScores()
      unsubscribePerformers()
    }
  }, [])

  const badges = [
    { name: "Issue Resolver", description: "Resolve 50 issues", icon: Target, earned: true },
    { name: "Escalation Master", description: "Approve 10 escalations", icon: Zap, earned: true },
    { name: "Community Favorite", description: "Get 100 post likes", icon: Star, earned: true },
    { name: "Department Leader", description: "Top department score", icon: Crown, earned: false },
    { name: "Rapid Response", description: "Resolve issues within 24h", icon: Owl, earned: false },
    { name: "Quality Inspector", description: "High approval rate", icon: Search, earned: false },
  ]

  const getRankIcon = (badge: string, rank: number) => {
    switch (badge) {
      case "gold":
        return <Crown className="w-6 h-6 text-yellow-500" />
      case "silver":
        return <Medal className="w-6 h-6 text-gray-400" />
      case "bronze":
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading gamification data...</p>
        </div>
      </div>
    )
  }

  const currentDept = departmentScores.find(dept => dept.id === selectedDepartment) || departmentScores[0] || { score: 0, rank: 1, resolvedIssues: 0, escalatedIssues: 0, likes: 0, ratingScore: 0 }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Gamification Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Department Score</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">{currentDept.score}</p>
                <p className="text-green-500 text-xs">Rank #{currentDept.rank}</p>
              </div>
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Issues Resolved</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">{currentDept.resolvedIssues}</p>
                <p className="text-primary text-xs">+{currentDept.resolvedIssues * 100} points</p>
              </div>
              <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Issues Escalated</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">{currentDept.escalatedIssues}</p>
                <p className="text-red-500 text-xs">-{currentDept.escalatedIssues * 50} points</p>
              </div>
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Post Likes</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">{currentDept.likes}</p>
                <p className="text-pink-500 text-xs">+{currentDept.likes * 10} points</p>
              </div>
              <Star className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Rating Score</p>
                <p className={`text-lg md:text-2xl font-bold ${
                  currentDept.ratingScore > 0 ? 'text-green-600' : 
                  currentDept.ratingScore < 0 ? 'text-red-600' : 'text-foreground'
                }`}>
                  {currentDept.ratingScore > 0 ? '+' : ''}{currentDept.ratingScore || 0}
                </p>
                <p className="text-muted-foreground text-xs">Public ratings</p>
              </div>
              <TrendingUp className={`w-6 h-6 md:w-8 md:h-8 ${
                currentDept.ratingScore > 0 ? 'text-green-600' : 
                currentDept.ratingScore < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Department Scoreboard */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
              <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
              DEPARTMENT SCOREBOARD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
              {departmentScores.map((dept, index) => (
                <div key={dept.id} className="flex items-center justify-between p-2 md:p-3 bg-accent rounded">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
                      {getRankIcon(dept.badge, dept.rank)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground font-medium text-xs md:text-sm truncate">{dept.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{dept.resolvedIssues} resolved</span>
                        <span>•</span>
                        <span>{dept.escalatedIssues} escalated</span>
                        {dept.ratingScore !== 0 && (
                          <>
                            <span>•</span>
                            <span className={dept.ratingScore > 0 ? 'text-green-600' : 'text-red-600'}>
                              Rating: {dept.ratingScore > 0 ? '+' : ''}{dept.ratingScore}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-foreground font-bold text-sm md:text-lg">{dept.score}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              TOP PERFORMERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
              {topPerformers.map((employee, index) => (
                <div key={employee.id} className="flex items-center justify-between p-2 md:p-3 bg-accent rounded">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-xs">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground font-medium text-xs md:text-sm truncate">{employee.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{employee.dept}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-foreground font-bold text-sm md:text-base">{employee.score}</div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs text-muted-foreground">
                      <span>Civic Score</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-2 h-2 md:w-3 md:h-3 text-purple-500" />
                        <span>{employee.badges} badges</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges & Rewards */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
            BADGES & REWARDS SYSTEM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`p-3 md:p-4 rounded border-2 transition-all ${
                  badge.earned ? "border-green-500 bg-green-500/10" : "border-border bg-accent"
                }`}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <badge.icon
                    className={`w-5 h-5 md:w-6 md:h-6 ${badge.earned ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`font-medium text-xs md:text-sm ${badge.earned ? "text-green-400" : "text-foreground"}`}
                    >
                      {badge.name}
                    </h4>
                    {badge.earned && (
                      <Badge variant="default" className="text-xs bg-green-500 mt-1">
                        EARNED
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
            <Target className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
            ACHIEVEMENT PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {[
              { name: "Issue Master", progress: Math.min((currentDept.resolvedIssues / 100) * 100, 100), target: 100, current: currentDept.resolvedIssues, unit: "issues resolved" },
              { name: "Quality Control", progress: Math.min(((100 - currentDept.escalatedIssues) / 100) * 100, 100), target: 0, current: currentDept.escalatedIssues, unit: "escalated issues (lower is better)" },
              { name: "Community Champion", progress: Math.min((currentDept.likes / 500) * 100, 100), target: 500, current: currentDept.likes, unit: "post likes" },
            ].map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-foreground font-medium text-xs md:text-sm">{achievement.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {achievement.current}/{achievement.target} {achievement.unit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">{Math.round(achievement.progress)}% complete</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}