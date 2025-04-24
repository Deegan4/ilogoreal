"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LogoImageProps {
  svgContent: string
  className?: string
}

export function LogoImage({ svgContent, className }: LogoImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (svgContent) {
      setIsLoaded(true)
    }
  }, [svgContent])

  if (!svgContent) {
    return <div className={cn("w-full h-full bg-muted animate-pulse rounded-md", className)} />
  }

  return (
    <div
      className={cn("w-full h-full transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0", className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
