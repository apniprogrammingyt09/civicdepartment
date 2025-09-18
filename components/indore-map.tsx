"use client"

import { useEffect, useRef } from "react"

export default function IndoreMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const iframe = document.createElement('iframe')
    iframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.21689499785!2d75.8577258!3d22.7195687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1642000000000!5m2!1sen!2sin"
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.style.border = "0"
    iframe.style.borderRadius = "8px"
    iframe.allowFullscreen = true
    iframe.loading = "lazy"
    iframe.referrerPolicy = "no-referrer-when-downgrade"

    mapRef.current.appendChild(iframe)

    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
    }
  }, [])

  return <div ref={mapRef} className="w-full h-full rounded border" />
}