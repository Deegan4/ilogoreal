"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResponsiveImageProps {
  src: string
  alt: string
  sizes?: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  fill?: boolean
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  onLoad?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  sizes = "100vw",
  className,
  width,
  height,
  priority = false,
  quality = 80,
  fill = false,
  objectFit = "cover",
  onLoad,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Generate srcSet for different screen sizes
  const generateSrcSet = () => {
    // Extract base URL and extension
    const urlParts = src.split(".")
    const extension = urlParts.pop() || "jpg"
    const baseUrl = urlParts.join(".")

    // If it's a placeholder or SVG, don't generate srcset
    if (src.includes("placeholder.svg") || extension === "svg") {
      return undefined
    }

    // For external URLs that we can't resize
    if (src.startsWith("http") && !src.includes("vercel-storage.com")) {
      return undefined
    }

    return undefined // We'll handle srcSet through Next.js Image component
  }

  const handleImageLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          fill ? "object-cover" : "",
        )}
        style={{ objectFit }}
        onLoad={handleImageLoad}
      />
      {!isLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
    </div>
  )
}
