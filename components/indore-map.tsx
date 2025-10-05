"use client"

import { useEffect, useRef, useState } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

type DepartmentKey = 'pwd' | 'water' | 'swm' | 'traffic' | 'health' | 'environment' | 'electricity' | 'disaster'

type DepartmentLocations = {
  [K in DepartmentKey]: [number, number]
}

interface Issue {
  id: string
  geoData?: {
    latitude: number
    longitude: number
    address?: string
    city?: string
  }
  priority?: 'high' | 'medium' | 'low'
  status?: string
  summary?: string
  department?: string
  assignedPersonnel?: {
    name: string
  }
  reportedAt?: {
    toDate(): Date
  }
  escalation?: {
    status: string
  }
}

interface IndoreMapProps {
  selectedDepartment?: string
}

export default function IndoreMap({ selectedDepartment }: IndoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    if (!selectedDepartment) return

    const issuesRef = collection(db, 'issues')
    const q = selectedDepartment !== 'all' 
      ? query(issuesRef, where('department', '==', selectedDepartment))
      : query(issuesRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Issue)).filter(issue => issue.geoData?.latitude && issue.geoData?.longitude)
      
      setIssues(issuesData)
    })

    return () => unsubscribe()
  }, [selectedDepartment])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    let isUnmounted = false
    let isInitializing = false

    const initMap = async () => {
      // Prevent multiple simultaneous initializations
      if (isInitializing) return
      isInitializing = true

      try {
        // Dynamic import of Leaflet
        const L = (await import('leaflet')).default
        
        // Add Leaflet CSS if not already present
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
          
          // Wait for CSS to load properly
          await new Promise(resolve => {
            link.onload = () => resolve(true)
            setTimeout(() => resolve(true), 1000) // fallback timeout
          })
        }

        // Additional wait for DOM stability
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Clean up existing map instance if it exists
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove()
          } catch (e) {
            console.warn('Error removing previous map instance:', e)
          }
          mapInstanceRef.current = null
        }

        // Check if component is still mounted and ref exists
        if (isUnmounted || !mapRef.current) return

        // Ensure the container has dimensions
        const container = mapRef.current
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn('Map container has no dimensions, waiting...')
          await new Promise(resolve => setTimeout(resolve, 200))
          if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            console.error('Map container still has no dimensions')
            return
          }
        }

        // Initialize map with animations completely disabled
        const map = L.map(container, {
          preferCanvas: false,
          attributionControl: true,
          zoomControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          trackResize: true,
          boxZoom: true,
          doubleClickZoom: true,
          dragging: true
        })
        
        // Set initial view without animation
        map.setView([22.7196, 75.8577], 12, { animate: false })
        
        mapInstanceRef.current = map

        // Force map to invalidate size to ensure proper initialization
        setTimeout(() => {
          if (map && !isUnmounted && mapRef.current) {
            try {
              map.invalidateSize({ animate: false })
            } catch (e) {
              console.warn('Error invalidating map size:', e)
            }
          }
        }, 100)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Auto-center map based on issues or department
        if (issues.length > 0) {
          const bounds: [number, number][] = []
          issues.forEach(issue => {
            if (issue.geoData?.latitude && issue.geoData?.longitude) {
              bounds.push([issue.geoData.latitude, issue.geoData.longitude])
            }
          })
          if (bounds.length > 0) {
            setTimeout(() => {
              if (map && !isUnmounted) {
                try {
                  map.fitBounds(bounds, { 
                    padding: [10, 10],
                    animate: false
                  })
                } catch (e) {
                  console.warn('Error fitting bounds:', e)
                }
              }
            }, 500)
          }
        } else if (selectedDepartment && selectedDepartment !== 'all') {
          // Department-specific locations in Indore
          const deptLocations: DepartmentLocations = {
            'pwd': [22.7280, 75.8573],
            'water': [22.7150, 75.8650], 
            'swm': [22.7050, 75.8450],
            'traffic': [22.7350, 75.8750],
            'health': [22.7100, 75.8500],
            'environment': [22.7400, 75.8600],
            'electricity': [22.7200, 75.8800],
            'disaster': [22.7250, 75.8400]
          }
          const deptCoords = (selectedDepartment as DepartmentKey) in deptLocations 
            ? deptLocations[selectedDepartment as DepartmentKey] 
            : [22.7196, 75.8577] as [number, number]
          map.setView(deptCoords, 13, { animate: false })
          
          // Add department location marker
          L.circleMarker(deptCoords, {
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.7,
            radius: 15,
            weight: 3
          }).addTo(map).bindPopup(`
            <div style="padding: 8px; text-align: center;">
              <h3 style="margin: 0 0 4px 0; color: #3b82f6; font-weight: bold;">🏢 Department Location</h3>
              <p style="margin: 0; font-size: 12px;">${selectedDepartment.toUpperCase()} Department Office</p>
            </div>
          `)
        }
        
        // Add department marker for specific departments even with issues
        if (selectedDepartment && selectedDepartment !== 'all') {
          const deptLocations: DepartmentLocations = {
            'pwd': [22.7280, 75.8573],
            'water': [22.7150, 75.8650], 
            'swm': [22.7050, 75.8450],
            'traffic': [22.7350, 75.8750],
            'health': [22.7100, 75.8500],
            'environment': [22.7400, 75.8600],
            'electricity': [22.7200, 75.8800],
            'disaster': [22.7250, 75.8400]
          }
          const deptCoords = (selectedDepartment as DepartmentKey) in deptLocations 
            ? deptLocations[selectedDepartment as DepartmentKey] 
            : null
          if (deptCoords) {
            L.circleMarker(deptCoords, {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.7,
              radius: 15,
              weight: 3
            }).addTo(map).bindPopup(`
              <div style="padding: 8px; text-align: center;">
                <h3 style="margin: 0 0 4px 0; color: #3b82f6; font-weight: bold;">🏢 Department Location</h3>
                <p style="margin: 0; font-size: 12px;">${selectedDepartment.toUpperCase()} Department Office</p>
              </div>
            `)
          }
        }

        issues.forEach((issue, index) => {
          if (issue.geoData?.latitude && issue.geoData?.longitude) {
            const color = issue.priority === 'high' ? '#ef4444' : 
                         issue.priority === 'medium' ? '#f97316' : '#22c55e'
            
            const statusIcon = issue.status === 'resolved' ? '✅' : 
                              issue.status === 'assign' ? '🔧' : 
                              issue.status === 'pending-review' ? '⏳' : 
                              issue.escalation?.status === 'pending' ? '🚨' : '📍'
            
            const marker = L.circleMarker([issue.geoData.latitude, issue.geoData.longitude], {
              color: '#ffffff',
              fillColor: color,
              fillOpacity: 0.9,
              radius: 12,
              weight: 2
            }).addTo(map)
            
            // Add status icon as a divIcon overlay
            const iconMarker = L.marker([issue.geoData.latitude, issue.geoData.longitude], {
              icon: L.divIcon({
                html: `<div style="background: ${color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${statusIcon}</div>`,
                className: 'custom-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(map)

            iconMarker.bindPopup(`
              <div style="padding: 12px; min-width: 250px; font-family: system-ui;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1f2937;">${issue.summary || 'Civic Issue'}</h3>
                <div style="margin-bottom: 8px; padding: 4px 8px; background: ${color}20; border-left: 3px solid ${color}; border-radius: 4px;">
                  <strong style="color: ${color}; font-size: 12px;">${(issue.priority || 'medium').toUpperCase()} PRIORITY</strong>
                </div>
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #4b5563;"><strong>📍 Location:</strong> ${issue.geoData.address || issue.geoData.city || 'Unknown location'}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #4b5563;"><strong>🏢 Department:</strong> ${issue.department || 'N/A'}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #4b5563;"><strong>📊 Status:</strong> ${(issue.status || 'pending').replace('-', ' ').toUpperCase()}</p>
                ${issue.assignedPersonnel?.name ? `<p style="margin: 0 0 6px 0; font-size: 13px; color: #4b5563;"><strong>👤 Assigned:</strong> ${issue.assignedPersonnel.name}</p>` : ''}
                ${issue.reportedAt ? `<p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;"><strong>⏰ Reported:</strong> ${new Date(issue.reportedAt.toDate()).toLocaleDateString()}</p>` : ''}
                <p style="margin: 0; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 8px;">ID: ${issue.id}</p>
              </div>
            `)
          }
        })
      } catch (error) {
        console.error('Error initializing map:', error)
      } finally {
        isInitializing = false
      }
    }

    initMap()

    return () => {
      isUnmounted = true
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          console.warn('Error removing map instance:', e)
        }
        mapInstanceRef.current = null
      }
    }
  }, [issues, selectedDepartment])

  const priorityCounts = {
    high: issues.filter(issue => issue.priority === 'high').length,
    medium: issues.filter(issue => issue.priority === 'medium').length,
    low: issues.filter(issue => issue.priority === 'low').length
  }

  return (
    <div className="w-full h-full rounded border overflow-hidden flex flex-col">
      <div ref={mapRef} className="w-full flex-1" />
      <div className="bg-white border-t p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">HIGH ({priorityCounts.high})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">MEDIUM ({priorityCounts.medium})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">LOW ({priorityCounts.low})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">LIVE DATA</span>
          </div>
        </div>
      </div>
    </div>
  )
}