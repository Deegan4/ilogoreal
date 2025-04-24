"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Download, Loader2, Save, Share2, Edit, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "./ui/button-custom"
import { Textarea } from "./ui/textarea-custom"
import { LogoSkeleton } from "./logo-skeleton"
import { suggestCategoriesFromPrompt } from "./logo-categories"
import { StyleSuggestions } from "./style-suggestions"
import {
  LogoCustomizationOptions,
  type LogoCustomizationOptions as CustomizationOptions,
} from "./logo-customization-options"
import { PromptExamples } from "./prompt-examples"
import { LogoEditor } from "./logo-editor"
import { ExportOptions } from "./export-options"
import { ShareLogo } from "./share-logo"
import { useInView } from "react-intersection-observer"
import { LogoImage } from "@/components/logo-image"
import { generateSizes } from "@/lib/image-service"
import { uploadLogoSvg } from "@/lib/supabase/storage"
import { useAuth } from "@/contexts/auth-context"

const ALL_LOGOS = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron9-Y3pXUcOEVxS1uigCghBiFQ5AKgmJyb.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron2-8DYgGIGSuIi9Et0nAls0ZMNeHN1BWa.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron3-wqYE1vqaP99GwdpvrZup9RDuZcjY2Q.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron10-MMdk3W31ODyUVOAKVawn22UEIIfw0G.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron1-bkrfihf4FsFs5PL0C8EkW8W983v5jG.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron11-kmyEVfO8VUZIZXMukaEkTmtsDjq04O.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron4-jMcU4p1IeQaXkBlh20I3T5KVY2Ywlu.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron8-gC3T49KPFyfTxlN7XkPw2l2JNNRZRs.svg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tetrahedron6-al98PbDKSJ6QxDw9rZiDHWbIUQJnSd.svg",
]

function getRandomItems(array: string[], n: number): string[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const DEMO_TEXT = "tetrahedron, so demure, so mindful"

interface LogoGeneratorProps {
  demoMode: boolean
  onLogoGenerated?: (svg: string, prompt: string) => void
  onGenerationError?: (prompt: string, error: string) => void
  onSaveLogo?: (prompt: string, svg: string) => void
  disabled?: boolean
}

export function LogoGenerator({
  demoMode,
  onLogoGenerated,
  onGenerationError,
  onSaveLogo,
  disabled = false,
}: LogoGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [svgs, setSvgs] = useState<(string | null)[]>([])
  const [customizedSvgs, setCustomizedSvgs] = useState<(string | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloading, setReloading] = useState<number[]>([])
  const [usedLogos, setUsedLogos] = useState<Set<string>>(new Set())
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null)
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number | null>(null)
  const [isTyping, setIsTyping] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState<number[]>([0, 0, 0, 0])
  const [isEditing, setIsEditing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([])
  const { toast } = useToast()
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>({
    style: "",
    colorScheme: "",
    complexity: "simple",
    industry: "",
  })

  const { user } = useAuth()

  // Add intersection observer for lazy loading
  const { ref: logoGridRef, inView: logoGridInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Add touch event handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const logoRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null])

  // Handle touch events for swipe to regenerate
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y

    // If it's a left swipe and the horizontal movement is significant
    if (deltaX < -50 && Math.abs(deltaY) < 50) {
      regenerateImage(index)
    }

    touchStartRef.current = null
  }

  // Optimize textarea for mobile
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // Simulate typing effect
  useEffect(() => {
    if (!isTyping) return

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= DEMO_TEXT.length) {
        setPrompt(DEMO_TEXT.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [isTyping])

  // Update suggested categories when prompt changes
  useEffect(() => {
    if (prompt.trim().length > 3) {
      const suggested = suggestCategoriesFromPrompt(prompt)
      setSuggestedCategories(suggested)

      // Auto-select suggested categories if none are selected
      if (selectedCategories.length === 0) {
        setSelectedCategories(suggested.slice(0, 2)) // Select top 2 suggestions
      }
    }
  }, [prompt, selectedCategories.length])

  // Simulate loading progress
  useEffect(() => {
    if (!loading) return

    const progressIntervals = loadingProgress.map((_, index) => {
      return setInterval(
        () => {
          setLoadingProgress((prev) => {
            const newProgress = [...prev]
            if (newProgress[index] < 100) {
              // Random increment between 5-15%
              const increment = Math.floor(Math.random() * 10) + 5
              newProgress[index] = Math.min(newProgress[index] + increment, 99)
            }
            return newProgress
          })
        },
        300 + Math.random() * 700,
      ) // Random interval between updates
    })

    return () => {
      progressIntervals.forEach((interval) => clearInterval(interval))
    }
  }, [loading, loadingProgress])

  // Initialize customized SVGs when original SVGs change
  useEffect(() => {
    if (svgs.length > 0 && (customizedSvgs.length === 0 || svgs.some((svg, i) => svg !== customizedSvgs[i]))) {
      setCustomizedSvgs([...svgs])
    }
  }, [svgs, customizedSvgs])

  const simulateLoading = async () => {
    setLoading(true)
    setSvgs([null, null, null, null])
    setCustomizedSvgs([null, null, null, null])
    setLoadingProgress([0, 0, 0, 0])
    setUsedLogos(new Set())

    const initialLogos = getRandomItems(ALL_LOGOS, 4)
    const times = Array(4)
      .fill(0)
      .map(() => 1500 + Math.random() * 2500) // Between 1.5 and 4 seconds

    const loadImages = times.map(
      (time, index) =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            setLoadingProgress((prev) => {
              const newProgress = [...prev]
              newProgress[index] = 100
              return newProgress
            })

            setTimeout(() => {
              setSvgs((current) => {
                const newSvgs = [...current]
                newSvgs[index] = initialLogos[index]
                return newSvgs
              })
              setUsedLogos((current) => {
                const updated = new Set(current)
                updated.add(initialLogos[index])
                return updated
              })
              resolve()
            }, 200) // Small delay after reaching 100%
          }, time)
        }),
    )

    await Promise.all(loadImages)
    setLoading(false)

    // Call the onLogoGenerated callback with the first logo
    if (onLogoGenerated && initialLogos[0]) {
      onLogoGenerated(initialLogos[0], prompt)
    }
  }

  const regenerateImage = async (index: number) => {
    if (!demoMode) return

    setReloading((prev) => [...prev, index])
    setLoadingProgress((prev) => {
      const newProgress = [...prev]
      newProgress[index] = 0
      return newProgress
    })

    // Simulate progress for this specific logo
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = [...prev]
        if (newProgress[index] < 100) {
          const increment = Math.floor(Math.random() * 10) + 5
          newProgress[index] = Math.min(newProgress[index] + increment, 99)
        }
        return newProgress
      })
    }, 300)

    const delay = 1500 + Math.random() * 1000
    await new Promise((resolve) => setTimeout(resolve, delay))

    clearInterval(progressInterval)
    setLoadingProgress((prev) => {
      const newProgress = [...prev]
      newProgress[index] = 100
      return newProgress
    })

    const availableLogos = ALL_LOGOS.filter((logo) => !usedLogos.has(logo))

    setTimeout(() => {
      if (availableLogos.length === 0) {
        const currentLogos = new Set(svgs.filter(Boolean))
        setUsedLogos(currentLogos)
        const newAvailableLogos = ALL_LOGOS.filter((logo) => !currentLogos.has(logo))
        const newLogo = newAvailableLogos[Math.floor(Math.random() * newAvailableLogos.length)]

        setSvgs((current) => {
          const newSvgs = [...current]
          newSvgs[index] = newLogo
          return newSvgs
        })
        setCustomizedSvgs((current) => {
          const newSvgs = [...current]
          newSvgs[index] = newLogo
          return newSvgs
        })
        setUsedLogos((current) => {
          const updated = new Set(current)
          updated.add(newLogo)
          return updated
        })
      } else {
        const newLogo = availableLogos[Math.floor(Math.random() * availableLogos.length)]

        setSvgs((current) => {
          const newSvgs = [...current]
          newSvgs[index] = newLogo
          return newSvgs
        })
        setCustomizedSvgs((current) => {
          const newSvgs = [...current]
          newSvgs[index] = newLogo
          return newSvgs
        })
        setUsedLogos((current) => {
          const updated = new Set(current)
          updated.add(newLogo)
          return updated
        })
      }

      setReloading((prev) => prev.filter((i) => i !== index))

      // Call the onLogoGenerated callback with the regenerated logo
      if (onLogoGenerated && availableLogos.length > 0) {
        const newLogo = availableLogos[Math.floor(Math.random() * availableLogos.length)]
        onLogoGenerated(newLogo, prompt)
      }
    }, 200)
  }

  const generateLogos = async (e: React.FormEvent) => {
    e.preventDefault()

    if (disabled) {
      toast({
        variant: "destructive",
        title: "Daily limit reached",
        description: "You've reached your daily logo generation limit. Upgrade your plan or try again tomorrow.",
      })
      return
    }

    setLoading(true)
    setError(null)
    setSvgs([null, null, null, null])
    setCustomizedSvgs([null, null, null, null])
    setLoadingProgress([0, 0, 0, 0])

    if (demoMode) {
      await simulateLoading()
      return
    }

    try {
      // Log the request being sent
      console.log("Sending request with:", {
        prompt,
        style: customizationOptions.style,
        colorScheme: customizationOptions.colorScheme,
        complexity: customizationOptions.complexity,
        industry: customizationOptions.industry,
      })

      const promises = Array(4)
        .fill(null)
        .map(() =>
          fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
              style: customizationOptions.style,
              colorScheme: customizationOptions.colorScheme,
              complexity: customizationOptions.complexity,
              industry: customizationOptions.industry,
            }),
          }).then(async (res) => {
            // Enhanced error handling
            if (!res.ok) {
              const errorText = await res.text()
              console.error("API Error Response:", {
                status: res.status,
                statusText: res.statusText,
                body: errorText,
              })

              if (res.status === 429) {
                throw new Error("Rate limit exceeded. Please try again in a moment.")
              }
              if (res.status === 401) {
                throw new Error("Authentication error. Please check API configuration.")
              }
              throw new Error(`API error: ${res.status} - ${errorText || res.statusText}`)
            }
            return res.json()
          }),
        )

      const results = await Promise.all(promises)

      // Set all to 100%
      setLoadingProgress([100, 100, 100, 100])

      // Small delay before showing results
      await new Promise((resolve) => setTimeout(resolve, 200))

      const newSvgs = results.map((data) => {
        if (!data.success) throw new Error(data.error || "Failed to generate logo")
        return data.svg
      })

      setSvgs(newSvgs)
      setCustomizedSvgs(newSvgs)

      // Upload the first logo to storage if user is logged in
      if (user && newSvgs[0]) {
        try {
          const uploadResult = await uploadLogoSvg(newSvgs[0], prompt, user.id)
          console.log("Logo uploaded to storage:", uploadResult)
        } catch (uploadError) {
          console.error("Error uploading logo to storage:", uploadError)
          // Continue even if upload fails
        }
      }

      // Call the onLogoGenerated callback with the first logo
      if (onLogoGenerated && newSvgs[0]) {
        onLogoGenerated(newSvgs[0], prompt)
      }
    } catch (err) {
      console.error("Logo generation error:", err)
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      setError(errorMessage)
      setSvgs([])
      setCustomizedSvgs([])

      // Call the onGenerationError callback
      if (onGenerationError) {
        onGenerationError(prompt, errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadSvg = (svg: string, index: number | string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = typeof index === "number" ? `logo-${index + 1}.svg` : `${index}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Logo downloaded",
      description: "Your logo has been downloaded successfully",
    })
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTyping(false)
    setPrompt(e.target.value)
  }

  const handleSaveLogo = (index: number) => {
    const svg = customizedSvgs[index]
    if (svg && onSaveLogo) {
      onSaveLogo(prompt, svg)
    }
  }

  const handleLogoUpdated = (logoId: string, updatedSvg: string) => {
    if (selectedLogoIndex !== null) {
      setCustomizedSvgs((current) => {
        const newSvgs = [...current]
        newSvgs[selectedLogoIndex] = updatedSvg
        return newSvgs
      })
    }

    setIsEditing(false)
    setSelectedLogo(null)
    setSelectedLogoIndex(null)

    toast({
      title: "Logo updated",
      description: "Your logo has been updated successfully",
    })
  }

  const handleApplySuggestion = (enhancedPrompt: string) => {
    setPrompt(enhancedPrompt)
    toast({
      title: "Style suggestion applied",
      description: "Your prompt has been updated with the style suggestion",
    })
  }

  const handleSelectPrompt = (selectedPrompt: string) => {
    setIsTyping(false)
    setPrompt(selectedPrompt)
  }

  return (
    <>
      <div className="w-full max-w-4xl px-2 sm:px-4">
        {!svgs.length && !loading ? (
          <>
            <div className="text-center mt-4 sm:mt-6 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground dark:from-white dark:via-purple-100 dark:to-indigo-200">
                Make Your Logo Pop
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground">
                Create unique logos with AI, optimized for web and print
              </p>
            </div>
            <form onSubmit={generateLogos} className="space-y-3 sm:space-y-4 w-full max-w-xl mx-auto px-2 sm:px-0">
              <div className="flex flex-col space-y-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Describe your logo (e.g., 'minimalist mountain peak logo in blue')"
                  value={prompt}
                  onChange={handleTextareaChange}
                  disabled={loading || disabled}
                  className="min-h-[80px] text-base sm:text-sm"
                  onClick={focusTextarea}
                />
                <div className="flex justify-end">
                  <PromptExamples onSelectPrompt={handleSelectPrompt} />
                </div>
              </div>

              {/* Style suggestions - optimized for mobile */}
              {prompt.trim().length > 3 && (
                <StyleSuggestions
                  prompt={prompt}
                  onApplySuggestion={handleApplySuggestion}
                  disabled={loading || disabled}
                  className="text-sm"
                />
              )}

              {/* Add Logo Customization Options - optimized for mobile */}
              <div className="flex justify-center">
                <LogoCustomizationOptions
                  options={customizationOptions}
                  onChange={setCustomizationOptions}
                  disabled={loading || disabled}
                  isMobile={typeof window !== "undefined" && window.innerWidth < 640}
                />
              </div>

              {/* Generate button - larger on mobile */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || !prompt || disabled}
                  className="w-full py-6 sm:py-4 text-base sm:text-sm"
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" /> : "Generate"}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>Powered by</span>
                <a
                  href="https://groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-muted-foreground transition-colors flex items-center gap-2"
                >
                  <img src="/images/groq-logo.svg" alt="Groq" className="h-4 w-4" />
                  <span>Groq</span>
                </a>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Logo display grid - optimized for mobile */}
            <div ref={logoGridRef} className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm mx-auto">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={i}
                    className="relative group"
                    ref={(el) => (logoRefs.current[i] = el)}
                    onTouchStart={(e) => handleTouchStart(e, i)}
                    onTouchEnd={(e) => handleTouchEnd(e, i)}
                  >
                    {!svgs[i] ? (
                      <LogoSkeleton />
                    ) : (
                      <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center relative scale-90 shadow-2xl shadow-primary/5 cursor-pointer">
                        <LogoImage
                          svgContent={svgs[i] as string}
                          className="w-full rounded-xl h-full mx-auto overflow-hidden"
                          priority={i === 0} // Prioritize loading the first logo
                          sizes={generateSizes({
                            sm: "50vw", // On mobile, each logo takes half the viewport width
                            md: "33vw", // On tablets, each logo takes a third of the viewport width
                            lg: "25vw", // On desktop, each logo takes a quarter of the viewport width
                          })}
                        />

                        {/* Mobile-friendly controls */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors rounded-xl">
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex flex-col sm:flex-row gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background backdrop-blur-sm transition-colors"
                              onClick={() => {
                                setSelectedLogo(svgs[i] as string)
                                setSelectedLogoIndex(i)
                                setIsEditing(true)
                              }}
                              aria-label="Edit Logo"
                            >
                              <Edit className="h-4 w-4 text-foreground" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background backdrop-blur-sm transition-colors"
                              onClick={() => {
                                setSelectedLogo(svgs[i] as string)
                                setSelectedLogoIndex(i)
                                setIsExporting(true)
                              }}
                              aria-label="Export Logo"
                            >
                              <Download className="h-4 w-4 text-foreground" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background backdrop-blur-sm transition-colors"
                              onClick={() => {
                                setSelectedLogo(svgs[i] as string)
                                setSelectedLogoIndex(i)
                                setIsSharing(true)
                              }}
                              aria-label="Share Logo"
                            >
                              <Share2 className="h-4 w-4 text-foreground" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background backdrop-blur-sm transition-colors"
                              onClick={() => handleSaveLogo(i)}
                              aria-label="Save Logo"
                            >
                              <Save className="h-4 w-4 text-foreground" />
                            </Button>
                          </div>

                          {/* Swipe hint for mobile */}
                          <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="flex items-center justify-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              <span>Swipe left to regenerate</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </>
        )}

        {error && (
          <div className="text-destructive text-center mt-4 p-4 rounded-lg bg-destructive/10 backdrop-blur-sm text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Mobile-optimized dialogs */}
      {selectedLogo && isEditing && (
        <LogoEditor
          logo={{
            id: `temp-${selectedLogoIndex}`,
            user_id: "temp",
            prompt,
            svg_content: selectedLogo,
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: null,
          }}
          open={isEditing}
          onOpenChange={setIsEditing}
          onSave={handleLogoUpdated}
          isMobile={typeof window !== "undefined" && window.innerWidth < 640}
        />
      )}

      {selectedLogo && isExporting && (
        <ExportOptions
          logo={{
            id: `temp-${selectedLogoIndex}`,
            user_id: "temp",
            prompt,
            svg_content: selectedLogo,
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: null,
          }}
          open={isExporting}
          onOpenChange={setIsExporting}
          isMobile={typeof window !== "undefined" && window.innerWidth < 640}
        />
      )}

      {selectedLogo && isSharing && (
        <ShareLogo
          logo={{
            id: `temp-${selectedLogoIndex}`,
            user_id: "temp",
            prompt,
            svg_content: selectedLogo,
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: null,
          }}
          open={isSharing}
          onOpenChange={setIsSharing}
          isMobile={typeof window !== "undefined" && window.innerWidth < 640}
        />
      )}

      <Toaster />
    </>
  )
}
