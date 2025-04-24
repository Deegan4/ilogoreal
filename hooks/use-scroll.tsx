"use client"

import { useState, useEffect, useRef, type RefObject } from "react"

// Hook to track scroll position
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)
  const [direction, setDirection] = useState<"up" | "down" | null>(null)
  const prevScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > prevScrollY.current) {
        setDirection("down")
      } else if (currentScrollY < prevScrollY.current) {
        setDirection("up")
      }

      setScrollY(currentScrollY)
      prevScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return { scrollY, direction }
}

// Hook to detect if element is in viewport
export function useInView<T extends HTMLElement = HTMLDivElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.1,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, isInView]
}

// Simplified parallax hook
export function useParallax() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.1)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return offset
}
