"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { X, Clock, Download, Palette, Trash2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button-custom"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CategoryBadge, LOGO_CATEGORIES, getCategoriesByIds } from "./logo-categories"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LogoImage } from "@/components/logo-image"
import { generateSizes } from "@/lib/image-service"
import { ResponsiveImage } from "@/components/responsive-image"

export interface LogoHistoryItem {
  id: string
  originalSvg: string
  customizedSvg: string
  prompt: string
  createdAt: string
  isFavorite?: boolean
  categories: string[] // Array of category IDs
}

interface LogoHistoryProps {
  isOpen: boolean
  onClose: () => void
  onSelectLogo: (logo: LogoHistoryItem) => void
  onDownload: (svg: string, name: string) => void
  onCustomize: (svg: string) => void
  currentPrompt: string
  onSaveCurrent: (logos: string[]) => void
}

export function LogoHistory({
  isOpen,
  onClose,
  onSelectLogo,
  onDownload,
  onCustomize,
  currentPrompt,
  onSaveCurrent,
}: LogoHistoryProps) {
  const [history, setHistory] = useState<LogoHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLogo, setSelectedLogo] = useState<LogoHistoryItem | null>(null)
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("logoHistory")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Failed to parse logo history:", error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("logoHistory", JSON.stringify(history))
  }, [history])

  // Filter logos based on search query, categories, and favorites
  const filteredLogos = history.filter((logo) => {
    // Text search filter
    const matchesSearch = logo.prompt.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory =
      filterCategories.length === 0 || filterCategories.some((cat) => logo.categories?.includes(cat))

    // Favorites filter
    const matchesFavorite = !showFavoritesOnly || logo.isFavorite

    return matchesSearch && matchesCategory && matchesFavorite
  })

  // Save current logos to history
  const saveCurrentLogos = (logos: string[]) => {
    const newHistoryItems = logos.map((svg) => ({
      id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalSvg: svg,
      customizedSvg: svg,
      prompt: currentPrompt,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      categories: [], // Will be populated by category suggestions
    }))

    setHistory((prev) => [...newHistoryItems, ...prev])
    onSaveCurrent(logos)
  }

  // Delete a logo from history
  const deleteLogo = (id: string) => {
    setHistory((prev) => prev.filter((logo) => logo.id !== id))
    if (selectedLogo?.id === id) {
      setSelectedLogo(null)
    }
  }

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setHistory((prev) => prev.map((logo) => (logo.id === id ? { ...logo, isFavorite: !logo.isFavorite } : logo)))
  }

  // Update logo categories
  const updateLogoCategories = (id: string, categories: string[]) => {
    setHistory((prev) => prev.map((logo) => (logo.id === id ? { ...logo, categories } : logo)))
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Unknown date"
    }
  }

  // Toggle a category in the filter
  const toggleFilterCategory = (categoryId: string) => {
    setFilterCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background border-l border-border shadow-xl transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Logo History
          </h2>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4 border-b border-border space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-4 w-4" />
                  {(filterCategories.length > 0 || showFavoritesOnly) && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Logos</h4>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites-only"
                        checked={showFavoritesOnly}
                        onCheckedChange={(checked) => setShowFavoritesOnly(checked === true)}
                      />
                      <Label htmlFor="favorites-only">Show favorites only</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Categories</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {LOGO_CATEGORIES.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filterCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                toggleFilterCategory(category.id)
                              } else {
                                toggleFilterCategory(category.id)
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category.id}`} className="flex items-center gap-1">
                            {category.icon}
                            <span>{category.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterCategories([])
                        setShowFavoritesOnly(false)
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        document.body.click() // Close the popover
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {(filterCategories.length > 0 || showFavoritesOnly) && (
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="text-muted-foreground">Filters:</span>

              {showFavoritesOnly && (
                <Badge
                  className="bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 flex items-center gap-1"
                  onClick={() => setShowFavoritesOnly(false)}
                >
                  <span>Favorites</span>
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}

              {filterCategories.map((categoryId) => {
                const category = LOGO_CATEGORIES.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <CategoryBadge
                    key={category.id}
                    category={category}
                    className="pr-1"
                    onClick={() => toggleFilterCategory(category.id)}
                  />
                )
              })}

              {(filterCategories.length > 0 || showFavoritesOnly) && (
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setFilterCategories([])
                    setShowFavoritesOnly(false)
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {filteredLogos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 p-4">
                {filteredLogos.map((logo) => (
                  <div
                    key={logo.id}
                    className={cn(
                      "relative group aspect-square bg-white rounded-lg border border-border overflow-hidden cursor-pointer transition-all hover:shadow-md",
                      selectedLogo?.id === logo.id && "ring-2 ring-primary",
                    )}
                    onClick={() => {
                      setSelectedLogo(logo)
                      onSelectLogo(logo)
                    }}
                  >
                    {/* Logo preview */}
                    <div className="w-full h-full flex items-center justify-center p-2">
                      {logo.customizedSvg.includes("<div") ? (
                        <LogoImage
                          svgContent={logo.customizedSvg}
                          className="w-full h-full"
                          sizes={generateSizes({
                            sm: "50vw", // On mobile, each logo takes half the viewport width
                            md: "33vw", // On tablets, each logo takes a third of the viewport width
                            lg: "25vw", // On desktop, each logo takes a quarter of the viewport width
                          })}
                        />
                      ) : (
                        <ResponsiveImage
                          src={logo.customizedSvg || "/placeholder.svg"}
                          alt={`Logo for ${logo.prompt}`}
                          fill
                          objectFit="contain"
                          sizes={generateSizes({
                            sm: "50vw",
                            md: "33vw",
                            lg: "25vw",
                          })}
                        />
                      )}
                    </div>

                    {/* Category indicator */}
                    {logo.categories && logo.categories.length > 0 && (
                      <div className="absolute top-1 left-1 flex flex-wrap gap-1 max-w-[80%]">
                        {logo.categories.slice(0, 2).map((categoryId) => {
                          const category = LOGO_CATEGORIES.find((c) => c.id === categoryId)
                          if (!category) return null
                          return (
                            <div
                              key={category.id}
                              className={cn(
                                "h-4 w-4 rounded-full flex items-center justify-center",
                                category.color.split(" ")[0], // Just use the background color
                              )}
                              title={category.name}
                            >
                              {category.icon}
                            </div>
                          )
                        })}
                        {logo.categories.length > 2 && (
                          <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px]">
                            +{logo.categories.length - 2}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCustomize(logo.originalSvg)
                              }}
                            >
                              <Palette className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Customize</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDownload(logo.customizedSvg, `logo-${logo.id.substring(0, 8)}`)
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-background/90 hover:bg-background text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteLogo(logo.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Favorite indicator */}
                    {logo.isFavorite && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-white rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mb-4 opacity-20" />
                {history.length === 0 ? (
                  <>
                    <p className="mb-2">Your logo history is empty</p>
                    <p className="text-sm">Generate some logos and save them to see them here</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">No logos match your search</p>
                    <p className="text-sm">Try different search terms or filters</p>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Selected logo details */}
        {selectedLogo && (
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm truncate max-w-[200px]" title={selectedLogo.prompt}>
                  {selectedLogo.prompt}
                </h3>
                <p className="text-xs text-muted-foreground">{formatDate(selectedLogo.createdAt)}</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                  {selectedLogo.categories && selectedLogo.categories.length > 0 ? (
                    getCategoriesByIds(selectedLogo.categories).map((category) => (
                      <CategoryBadge key={category.id} category={category} className="text-[10px] px-1.5 py-0" />
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No categories</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("h-8 w-8", selectedLogo.isFavorite && "text-yellow-500 border-yellow-500")}
                  onClick={() => toggleFavorite(selectedLogo.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={selectedLogo.isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Manage Categories</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {LOGO_CATEGORIES.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`logo-category-${category.id}`}
                              checked={selectedLogo.categories?.includes(category.id)}
                              onCheckedChange={(checked) => {
                                const newCategories = checked
                                  ? [...(selectedLogo.categories || []), category.id]
                                  : (selectedLogo.categories || []).filter((id) => id !== category.id)
                                updateLogoCategories(selectedLogo.id, newCategories)
                              }}
                            />
                            <Label htmlFor={`logo-category-${category.id}`} className="flex items-center gap-1 text-xs">
                              {category.icon}
                              <span>{category.name}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onCustomize(selectedLogo.originalSvg)}
                >
                  <Palette className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDownload(selectedLogo.customizedSvg, `logo-${selectedLogo.id.substring(0, 8)}`)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Save current logos button */}
        <div className="border-t border-border p-4">
          <Button className="w-full" onClick={() => onSaveCurrent([])} disabled={!currentPrompt}>
            Save Current Logos to History
          </Button>
        </div>
      </div>
    </div>
  )
}
