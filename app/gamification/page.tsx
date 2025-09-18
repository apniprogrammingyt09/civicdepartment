"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award, Target, TrendingUp, Medal, Crown, Zap, Users, Goal as Owl, Search } from "lucide-react"

export default function GamificationPage() {
  const departmentScores = [
    { name: "Parks & Recreation", score: 94, rank: 1, trend: "+2", badge: "gold" },
    { name: "Water & Sanitation", score: 92, rank: 2, trend: "+1", badge: "silver" },
    { name: "Waste Management", score: 89, rank: 3, trend: "0", badge: "bronze" },
    { name: "Traffic Management", score: 87, rank: 4, trend: "+3", badge: "" },
    { name: "Public Safety", score: 78, rank: 5, trend: "-2", badge: "" },
  ]

  const employeeScores = [
    { name: "Sarah Wilson", dept: "Parks & Recreation", score: 98, resolved: 45, rating: 4.9, badges: 12 },
    { name: "Mike Johnson", dept: "Water & Sanitation", score: 96, resolved: 42, rating: 4.8, badges: 10 },
    { name: "John Doe", dept: "Water & Sanitation", score: 94, resolved: 38, rating: 4.7, badges: 9 },
    { name: "Lisa Chen", dept: "Public Safety", score: 91, resolved: 35, rating: 4.6, badges: 8 },
    { name: "David Park", dept: "Traffic Management", score: 89, resolved: 33, rating: 4.5, badges: 7 },
  ]

  const badges = [
    { name: "Speed Demon", description: "Resolve 10 issues in one day", icon: Zap, earned: true },
    { name: "Problem Solver", description: "Resolve 100 issues total", icon: Target, earned: true },
    { name: "Team Player", description: "Complete 5 cross-department tasks", icon: Users, earned: true },
    { name: "Citizen Hero", description: "Achieve 4.8+ citizen rating", icon: Star, earned: true },
    { name: "Night Owl", description: "Resolve emergency after hours", icon: Owl, earned: false },
    { name: "Master Inspector", description: "Complete 50 inspections", icon: Search, earned: false },
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

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Gamification Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Your Score</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">94</p>
                <p className="text-green-500 text-xs">+2 this week</p>
              </div>
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Department Rank</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">#2</p>
                <p className="text-primary text-xs">Water & Sanitation</p>
              </div>
              <Medal className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Badges Earned</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">9</p>
                <p className="text-purple-500 text-xs">3 more available</p>
              </div>
              <Award className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Citizen Rating</p>
                <p className="text-foreground text-lg md:text-2xl font-bold">4.7</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-2 h-2 md:w-3 md:h-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
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
                <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-accent rounded">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
                      {getRankIcon(dept.badge, dept.rank)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground font-medium text-xs md:text-sm truncate">{dept.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Rank #{dept.rank}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`w-3 h-3 ${
                              dept.trend.startsWith("+")
                                ? "text-green-500"
                                : dept.trend.startsWith("-")
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              dept.trend.startsWith("+")
                                ? "text-green-500"
                                : dept.trend.startsWith("-")
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {dept.trend !== "0" ? dept.trend : "No change"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-foreground font-bold text-sm md:text-lg">{dept.score}</div>
                    <div className="text-xs text-muted-foreground">Civic Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Scoreboard */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground tracking-wider flex items-center gap-2">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              TOP PERFORMERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
              {employeeScores.map((employee, index) => (
                <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-accent rounded">
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
                      <span>{employee.resolved} resolved</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-2 h-2 md:w-3 md:h-3 fill-yellow-500 text-yellow-500" />
                        <span>{employee.rating}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-80 md:max-h-96 overflow-y-auto">
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
              { name: "Master Inspector", progress: 76, target: 50, current: 38, unit: "inspections" },
              { name: "Night Owl", progress: 40, target: 5, current: 2, unit: "after-hours responses" },
              { name: "Speed Master", progress: 90, target: 20, current: 18, unit: "same-day resolutions" },
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
                <div className="text-xs text-muted-foreground">{achievement.progress}% complete</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
