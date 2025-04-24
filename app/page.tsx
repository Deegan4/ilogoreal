"use client"

import { useState, useEffect, useRef } from "react"
import { LogoGeneratorWithAuth } from "@/components/logo-generator-with-auth"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"
import { useInView } from "@/hooks/use-scroll"

export default function Page() {
  const [demoMode, setDemoMode] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Refs for scroll animations
  const [heroRef, heroInView] = useInView()

  // Add this useEffect for the cyber background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Mouse/touch position tracking
    let pointerX = 0
    let pointerY = 0
    const pointerRadius = 150

    // Add cursor glow effect variables
    let glowIntensity = 0
    let glowDirection = 0.02
    const maxGlowIntensity = 0.4
    const minGlowIntensity = 0.2

    // iOS detection
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

    // Set canvas dimensions with device pixel ratio consideration for Retina displays
    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1

      // Get display size
      const displayWidth = window.innerWidth
      const displayHeight = window.innerHeight

      // Set canvas size in display pixels
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`

      // Set actual size in memory (scaled for retina)
      canvas.width = Math.floor(displayWidth * devicePixelRatio)
      canvas.height = Math.floor(displayHeight * devicePixelRatio)

      // Scale context to match device pixel ratio
      ctx.scale(devicePixelRatio, devicePixelRatio)

      // Reset the context after resize
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    setCanvasDimensions()

    // Throttled resize handler for better performance
    let resizeTimeout
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(setCanvasDimensions, 200)
    })

    // Optimize number of particles based on device
    const getOptimalParticleCount = () => {
      if (isIOS) {
        // Reduce particle count on iOS devices
        const iosVersion = Number.parseInt((navigator.userAgent.match(/OS (\d+)_/) || [])[1], 10)

        if (window.innerWidth <= 375) {
          // iPhone SE, 6, 7, 8 size
          return 40
        } else if (iosVersion && iosVersion < 15) {
          // Older iOS versions
          return 60
        } else {
          // Newer iOS versions
          return 80
        }
      }

      // Default for other devices
      return 100
    }

    // Pointer event handlers (unified mouse/touch)
    const handlePointerMove = (e) => {
      // Prevent scrolling on iOS when interacting with canvas
      if (e.cancelable) e.preventDefault()

      // Get pointer position
      if (e.touches) {
        pointerX = e.touches[0].clientX
        pointerY = e.touches[0].clientY
      } else {
        pointerX = e.clientX
        pointerY = e.clientY
      }
    }

    const handlePointerLeave = () => {
      pointerX = undefined
      pointerY = undefined
    }

    // Add passive: false for iOS to allow preventDefault
    canvas.addEventListener("mousemove", handlePointerMove)
    canvas.addEventListener("touchmove", handlePointerMove, { passive: false })
    canvas.addEventListener("mouseleave", handlePointerLeave)
    canvas.addEventListener("touchend", handlePointerLeave)

    // Particles configuration
    const particlesArray = []
    const numberOfParticles = getOptimalParticleCount()

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.baseSize = Math.random() * 2.5 + 0.5 // Slightly smaller for better performance
        this.size = this.baseSize
        this.speedX = (Math.random() - 0.5) * 0.8 // Slightly slower for better performance
        this.speedY = (Math.random() - 0.5) * 0.8
        this.baseColor = `rgba(120, 79, 255, ${Math.random() * 0.4 + 0.2})`
        this.color = this.baseColor

        // Add slight variation to make it more interesting
        this.oscillationSpeed = Math.random() * 0.02
        this.oscillationDistance = Math.random() * 0.5
        this.oscillationOffset = Math.random() * Math.PI * 2
      }

      update() {
        // Normal movement
        this.x += this.speedX
        this.y += this.speedY

        // Add slight oscillation for more organic movement
        this.x += Math.sin(Date.now() * this.oscillationSpeed + this.oscillationOffset) * this.oscillationDistance

        // Screen boundaries
        if (this.x > window.innerWidth) this.x = 0
        if (this.x < 0) this.x = window.innerWidth
        if (this.y > window.innerHeight) this.y = 0
        if (this.y < 0) this.y = window.innerHeight

        // Pointer interaction
        if (pointerX !== undefined && pointerY !== undefined) {
          const dx = this.x - pointerX
          const dy = this.y - pointerY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < pointerRadius) {
            // Calculate force (closer = stronger)
            const force = (pointerRadius - distance) / pointerRadius

            // Move particles away from pointer
            const angle = Math.atan2(dy, dx)
            this.x += Math.cos(angle) * force * 2
            this.y += Math.sin(angle) * force * 2

            // Increase size and change color when near pointer
            this.size = this.baseSize + force * 3
            this.color = `rgba(160, 120, 255, ${Math.min(0.8, force + 0.2)})`
          } else {
            // Return to normal size and color when away from pointer
            this.size = this.baseSize
            this.color = this.baseColor
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }
    init()

    // Connect particles with lines - optimized version
    function connect() {
      // Adjust connection distance based on device
      const maxDistance = isIOS ? 120 : 150

      // Use a more efficient approach to avoid checking every particle pair
      const gridSize = maxDistance
      const grid = {}

      // Place particles in grid cells
      particlesArray.forEach((particle, index) => {
        const cellX = Math.floor(particle.x / gridSize)
        const cellY = Math.floor(particle.y / gridSize)
        const cellKey = `${cellX},${cellY}`

        if (!grid[cellKey]) {
          grid[cellKey] = []
        }

        grid[cellKey].push(index)
      })

      // Check particles in nearby cells only
      particlesArray.forEach((particleA, a) => {
        const cellX = Math.floor(particleA.x / gridSize)
        const cellY = Math.floor(particleA.y / gridSize)

        // Check neighboring cells
        for (let nx = cellX - 1; nx <= cellX + 1; nx++) {
          for (let ny = cellY - 1; ny <= cellY + 1; ny++) {
            const neighborCellKey = `${nx},${ny}`
            const neighborIndices = grid[neighborCellKey] || []

            // Check particles in this cell
            neighborIndices.forEach((b) => {
              // Skip if we've already checked this pair or it's the same particle
              if (b <= a) return

              const particleB = particlesArray[b]
              const dx = particleA.x - particleB.x
              const dy = particleA.y - particleB.y
              const distance = Math.sqrt(dx * dx + dy * dy)

              if (distance < maxDistance) {
                // Base connection opacity
                let opacity = 1 - distance / maxDistance

                // Enhance connections near pointer
                if (pointerX !== undefined && pointerY !== undefined) {
                  const mdx = (particleA.x + particleB.x) / 2 - pointerX
                  const mdy = (particleA.y + particleB.y) / 2 - pointerY
                  const pointerDistance = Math.sqrt(mdx * mdx + mdy * mdy)

                  if (pointerDistance < pointerRadius) {
                    opacity = Math.min(0.8, opacity + ((pointerRadius - pointerDistance) / pointerRadius) * 0.5)
                  }
                }

                ctx.strokeStyle = `rgba(120, 79, 255, ${opacity * 0.2})`
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(particleA.x, particleA.y)
                ctx.lineTo(particleB.x, particleB.y)
                ctx.stroke()
              }
            })
          }
        }
      })
    }

    // Draw cursor glow effect
    function drawCursorGlow() {
      if (pointerX === undefined || pointerY === undefined) return

      // Update glow intensity for pulsing effect
      if (glowIntensity >= maxGlowIntensity || glowIntensity <= minGlowIntensity) {
        glowDirection *= -1
      }
      glowIntensity += glowDirection

      // Create radial gradient for glow effect
      const gradient = ctx.createRadialGradient(pointerX, pointerY, 5, pointerX, pointerY, pointerRadius)

      gradient.addColorStop(0, `rgba(160, 120, 255, ${glowIntensity})`)
      gradient.addColorStop(0.5, `rgba(120, 79, 255, ${glowIntensity * 0.5})`)
      gradient.addColorStop(1, "rgba(120, 79, 255, 0)")

      ctx.beginPath()
      ctx.arc(pointerX, pointerY, pointerRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Animation variables for RAF optimization
    let animationFrameId
    let lastFrameTime = 0
    const targetFPS = isIOS ? 30 : 60 // Lower target FPS for iOS to save battery
    const frameInterval = 1000 / targetFPS

    // Animation loop with timing control
    function animate(currentTime) {
      animationFrameId = requestAnimationFrame(animate)

      // Calculate time elapsed since last frame
      const elapsed = currentTime - lastFrameTime

      // Only render if enough time has passed (frame rate control)
      if (elapsed > frameInterval) {
        // Adjust for frame rate
        lastFrameTime = currentTime - (elapsed % frameInterval)

        // Clear with composite operation for better performance
        ctx.clearRect(
          0,
          0,
          canvas.width / (window.devicePixelRatio || 1),
          canvas.height / (window.devicePixelRatio || 1),
        )

        // Draw cursor glow first (behind particles)
        drawCursorGlow()

        // Update and draw particles
        for (let i = 0; i < particlesArray.length; i++) {
          particlesArray[i].update()
          particlesArray[i].draw()
        }

        // Connect particles
        connect()
      }
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", () => {})
      canvas.removeEventListener("mousemove", handlePointerMove)
      canvas.removeEventListener("touchmove", handlePointerMove)
      canvas.removeEventListener("mouseleave", handlePointerLeave)
      canvas.removeEventListener("touchend", handlePointerLeave)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Custom background gradient overlay */}
      <div className="fixed inset-0 -z-10 bg-background">
        {/* Dark mode gradient */}
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,79,255,0.3),rgba(255,255,255,0))] dark:opacity-100 opacity-0 transition-opacity duration-300" />

        {/* Light mode gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(192,168,255,0.15),rgba(255,255,255,0))] dark:opacity-0 opacity-100 transition-opacity duration-300" />

        {/* Secondary accent gradients */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-purple-500/[0.02] to-transparent dark:from-purple-500/[0.05]" />
        <div className="absolute top-0 left-0 w-[30vw] h-[30vh] bg-gradient-to-br from-indigo-500/[0.03] to-transparent dark:from-indigo-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[40vw] h-[40vh] bg-gradient-to-bl from-purple-600/[0.03] to-transparent dark:from-purple-600/[0.07] rounded-full blur-3xl" />
      </div>

      <SiteHeader demoMode={demoMode} setDemoMode={setDemoMode} />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 pt-24 relative z-10">
        {/* Cyber animated background - optimized for iOS */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 -z-10 w-full h-full cursor-none"
          style={{
            pointerEvents: "auto",
            touchAction: "none", // Prevent default touch actions on iOS
            WebkitTapHighlightColor: "transparent", // Remove tap highlight on iOS
            transform: "translateZ(0)", // Enable hardware acceleration
          }}
          aria-hidden="true"
        />

        {/* Digital grid overlay */}
        <div
          className="absolute inset-0 -z-10 bg-grid-pattern opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(120, 79, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(120, 79, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Logo generator with scroll animation */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <LogoGeneratorWithAuth demoMode={demoMode} />
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  )
}
