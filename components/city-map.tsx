"use client"

import { useEffect, useRef } from "react"

// Mock issues data for Indore, MP
const mockIssues = [
  {
    id: 1,
    lat: 22.7196,
    lng: 75.8577,
    type: "critical",
    title: "Water supply disruption",
    description: "Major water supply issue in Vijay Nagar area",
  },
  {
    id: 2,
    lat: 22.7532,
    lng: 75.8937,
    type: "medium",
    title: "Traffic signal malfunction",
    description: "Traffic light not working at Palasia Square",
  },
  {
    id: 3,
    lat: 22.6708,
    lng: 75.9063,
    type: "low",
    title: "Road repair needed",
    description: "Pothole on MG Road near Rajwada",
  },
  {
    id: 4,
    lat: 22.7042,
    lng: 75.8794,
    type: "critical",
    title: "Sewage overflow",
    description: "Sewage overflow reported in Bhawarkuan area",
  },
  {
    id: 5,
    lat: 22.7279,
    lng: 75.8723,
    type: "medium",
    title: "Street light repair",
    description: "Multiple street lights not working in Scheme 78",
  },
  {
    id: 6,
    lat: 22.6890,
    lng: 75.8567,
    type: "low",
    title: "Park maintenance",
    description: "Cleaning required at Nehru Park",
  },
]

export default function CityMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css")
    ]).then(([L]) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Create map centered on Indore, MP
      const map = L.default.map(mapRef.current).setView([22.7196, 75.8577], 12)
      mapInstanceRef.current = map

      // Add tile layer
      L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Custom marker icons
      const createCustomIcon = (color: string) => {
        return L.default.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ${color === "#ef4444" ? "animation: pulse 2s infinite;" : ""}
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
      }

      // Add markers for each issue
      mockIssues.forEach((issue) => {
        const color = issue.type === "critical" ? "#ef4444" : issue.type === "medium" ? "#eab308" : "#22c55e"

        const marker = L.default.marker([issue.lat, issue.lng], {
          icon: createCustomIcon(color),
        }).addTo(map)

        // Add popup with issue details
        marker.bindPopup(`
          <div style="font-family: system-ui; font-size: 12px; min-width: 200px;">
            <strong style="color: ${color}; text-transform: uppercase; font-size: 10px; font-weight: 700;">
              ${issue.type} PRIORITY
            </strong>
            <h4 style="margin: 4px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">
              ${issue.title}
            </h4>
            <p style="margin: 0; color: #666; font-size: 11px; line-height: 1.4;">
              ${issue.description}
            </p>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee; font-size: 10px; color: #888;">
              Issue ID: #${issue.id} • Indore Municipal Corporation
            </div>
          </div>
        `)
      })

      // Add CSS for pulse animation
      const style = document.createElement("style")
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `
      document.head.appendChild(style)
    }).catch((error) => {
      console.error("Failed to load map:", error)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return <div ref={mapRef} className="w-full h-full" />
}
