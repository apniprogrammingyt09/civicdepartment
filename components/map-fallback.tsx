"use client"

import { MapPin, AlertTriangle, Clock, CheckCircle } from "lucide-react"

const indoreIssues = [
  { id: 1, type: "critical", title: "Water supply disruption", area: "Vijay Nagar", time: "10:30 AM" },
  { id: 2, type: "medium", title: "Traffic signal malfunction", area: "Palasia Square", time: "9:15 AM" },
  { id: 3, type: "low", title: "Road repair needed", area: "MG Road", time: "8:45 AM" },
  { id: 4, type: "critical", title: "Sewage overflow", area: "Bhawarkuan", time: "11:20 AM" },
  { id: 5, type: "medium", title: "Street light repair", area: "Scheme 78", time: "7:30 AM" },
  { id: 6, type: "low", title: "Park maintenance", area: "Nehru Park", time: "6:00 AM" },
]

export default function MapFallback() {
  return (
    <div className="w-full h-full bg-muted rounded border p-4">
      <div className="text-center mb-4">
        <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-sm font-medium text-foreground font-orbitron tracking-wide">INDORE LIVE ISSUES</h3>
        <p className="text-xs text-muted-foreground font-orbitron tracking-wide">INTERACTIVE MAP TEMPORARILY UNAVAILABLE</p>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {indoreIssues.map((issue) => (
          <div key={issue.id} className="flex items-center gap-2 p-2 bg-background rounded text-xs">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              issue.type === "critical" ? "bg-red-500 animate-pulse" :
              issue.type === "medium" ? "bg-orange-500" : "bg-green-500"
            }`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate font-orbitron tracking-wide">{issue.title.toUpperCase()}</div>
              <div className="text-muted-foreground font-orbitron tracking-wide">{issue.area.toUpperCase()} • {issue.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}