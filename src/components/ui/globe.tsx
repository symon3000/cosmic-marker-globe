
"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

// Add location information for each marker
interface LocationInfo {
  name: string
  description: string
  location: [number, number]
  size: number
}

const LOCATIONS: LocationInfo[] = [
  { 
    name: "Manila, Philippines", 
    description: "Capital city of the Philippines",
    location: [14.5995, 120.9842], 
    size: 0.03 
  },
  { 
    name: "Mumbai, India", 
    description: "Financial center of India",
    location: [19.076, 72.8777], 
    size: 0.1 
  },
  { 
    name: "Dhaka, Bangladesh", 
    description: "Capital of Bangladesh",
    location: [23.8103, 90.4125], 
    size: 0.05 
  },
  { 
    name: "Cairo, Egypt", 
    description: "Capital of Egypt, near the Nile Delta",
    location: [30.0444, 31.2357], 
    size: 0.07 
  },
  { 
    name: "Beijing, China", 
    description: "Capital of China",
    location: [39.9042, 116.4074], 
    size: 0.08 
  },
  { 
    name: "São Paulo, Brazil", 
    description: "Brazil's vibrant financial center",
    location: [-23.5505, -46.6333], 
    size: 0.1 
  },
  { 
    name: "Mexico City, Mexico", 
    description: "Capital city of Mexico",
    location: [19.4326, -99.1332], 
    size: 0.1 
  },
  { 
    name: "New York City, USA", 
    description: "Major US metropolitan and financial center",
    location: [40.7128, -74.006], 
    size: 0.1 
  },
  { 
    name: "Osaka, Japan", 
    description: "Major commercial center in Japan",
    location: [34.6937, 135.5022], 
    size: 0.05 
  },
  { 
    name: "Istanbul, Turkey", 
    description: "Transcontinental city straddling Europe and Asia",
    location: [41.0082, 28.9784], 
    size: 0.06 
  },
]

// Create GLOBE_CONFIG with updated markers
const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: LOCATIONS.map(loc => ({ location: loc.location, size: loc.size })),
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)
  const lastX = useRef(0)
  const [activeLocation, setActiveLocation] = useState<LocationInfo | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const globeContainerRef = useRef<HTMLDivElement>(null)

  const updatePointerInteraction = (clientX: number | null) => {
    pointerInteracting.current = clientX
    if (canvasRef.current) {
      canvasRef.current.style.cursor = clientX !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      lastX.current = clientX
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (pointerInteracting.current === null) {
        // Auto rotation when not being dragged
        phi += 0.005
      }
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  // Check if mouse is over a marker
  const checkMarkerHover = (mouseX: number, mouseY: number) => {
    if (!canvasRef.current || !globeContainerRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate normalized mouse position relative to the globe center
    const normalizedX = (mouseX - centerX) / (rect.width / 2)
    const normalizedY = (mouseY - centerY) / (rect.height / 2)
    
    // Check distance from center (simple approximation)
    const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)
    
    // Only proceed if mouse is on the globe
    if (distanceFromCenter <= 1) {
      // Convert screen position to approximate spherical coordinates
      // This is a simplified version and not geographically accurate
      const mouseTheta = Math.atan2(normalizedY, normalizedX)
      const mousePhi = Math.PI / 2 * distanceFromCenter
      
      // Current rotation of the globe
      const currentPhi = phi + r
      
      // Check each location
      for (const location of LOCATIONS) {
        const [lat, lon] = location.location
        
        // Convert lat/lon to spherical coordinates
        // This is simplified and not geographically accurate
        const locationPhi = (90 - lat) * (Math.PI / 180)
        const locationTheta = (lon + 180) * (Math.PI / 180) - currentPhi
        
        // Calculate distance between points on the sphere (simplified)
        const angularDistance = Math.acos(
          Math.sin(mousePhi) * Math.sin(locationPhi) +
          Math.cos(mousePhi) * Math.cos(locationPhi) * Math.cos(mouseTheta - locationTheta)
        )
        
        // If close enough to a marker, show info
        if (angularDistance < 0.3) {
          setActiveLocation(location)
          setTooltipPosition({ x: mouseX, y: mouseY })
          return
        }
      }
    }
    
    // If not hovering over any marker
    setActiveLocation(null)
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1"
      }
    })

    return () => {
      window.removeEventListener("resize", onResize)
      globe.destroy()
    }
  }, [])

  return (
    <div
      ref={globeContainerRef}
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
      onMouseMove={(e) => {
        // Only check for marker hover if not dragging
        if (pointerInteracting.current === null) {
          checkMarkerHover(e.clientX, e.clientY)
        }
        
        // Handle dragging
        if (pointerInteracting.current !== null) {
          const delta = e.clientX - lastX.current
          phi += delta / 200
          lastX.current = e.clientX
        }
      }}
      onMouseLeave={() => setActiveLocation(null)}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size] cursor-grab"
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          updatePointerInteraction(e.clientX)
          lastX.current = e.clientX
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onTouchMove={(e) => {
          if (e.touches[0] && pointerInteracting.current !== null) {
            const delta = e.touches[0].clientX - lastX.current
            phi += delta / 200
            lastX.current = e.touches[0].clientX
          }
        }}
      />
      
      {activeLocation && (
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-none max-w-[200px] text-left"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <h3 className="font-semibold text-sm">{activeLocation.name}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{activeLocation.description}</p>
        </div>
      )}
    </div>
  )
}
