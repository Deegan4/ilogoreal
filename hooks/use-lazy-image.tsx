"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"

interface UseLazyImageOptions {
  threshold?: number
  triggerOnce?: boolean
  rootMargin?: string
}

export function useLazyImage(options: UseLazyImageOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { threshold = 0.1, triggerOnce = true, rootMargin = "200px" } = options

  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  })

  useEffect(() => {
    if (inView) {
      setIsLoaded(true)
    }
  }, [inView])

  return { ref, isLoaded, inView }
}
