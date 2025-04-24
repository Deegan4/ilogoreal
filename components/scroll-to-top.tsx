"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button-custom"
import { useScrollPosition } from "@/hooks/use-scroll"

export function ScrollToTop() {
  const { scrollY } = useScrollPosition()
  const [showButton, setShowButton] = useState(false)

  // Show button when scrolled down 300px
  useEffect(() => {
    setShowButton(scrollY > 300)
  }, [scrollY])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!showButton) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-opacity duration-300 opacity-80 hover:opacity-100">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  )
}
