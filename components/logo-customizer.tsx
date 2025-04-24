"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Palette, Sparkles, Layers, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button-custom"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import React from "react"

// Predefined color palettes
const COLOR_PALETTES = [
  { name: "Original", primary: "", secondary: "", accent: "" },
  { name: "Purple Dream", primary: "#7C3AED", secondary: "#A78BFA", accent: "#C4B5FD" },
  { name: "Ocean Blue", primary: "#2563EB", secondary: "#60A5FA", accent: "#93C5FD" },
  { name: "Forest Green", primary: "#059669", secondary: "#34D399", accent: "#6EE7B7" },
  { name: "Sunset Orange", primary: "#DC2626", secondary: "#F87171", accent: "#FCA5A5" },
  { name: "Midnight", primary: "#1E293B", secondary: "#475569", accent: "#94A3B8" },
  { name: "Gold Rush", primary: "#B45309", secondary: "#F59E0B", accent: "#FCD34D" },
  { name: "Cherry Blossom", primary: "#BE185D", secondary: "#EC4899", accent: "#F9A8D4" },
]

// Style presets
const STYLE_PRESETS = [
  { name: "Standard", filter: "", transform: "" },
  { name: "Bold", filter: "saturate(1.2) contrast(1.1)", transform: "scale(1.05)" },
  { name: "Minimal", filter: "saturate(0.9) brightness(1.05)", transform: "scale(0.95)" },
  { name: "Vibrant", filter: "saturate(1.4) brightness(1.1)", transform: "" },
  { name: "Muted", filter: "saturate(0.7) brightness(0.95)", transform: "" },
  { name: "Soft", filter: "saturate(0.8) contrast(0.9) brightness(1.05)", transform: "" },
]

interface LogoCustomizerProps {
  svgContent: string
  onUpdate: (updatedSvg: string) => void
  onClose: () => void
}

export function LogoCustomizer({ svgContent, onUpdate, onClose }: LogoCustomizerProps) {
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0])
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0])
  const [customColors, setCustomColors] = useState({
    primary: "#7C3AED",
    secondary: "#A78BFA",
    accent: "#C4B5FD",
  })
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(100)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [originalSvg, setOriginalSvg] = useState(svgContent)
  const [previewSvg, setPreviewSvg] = useState(svgContent)

  const lastUpdateRef = React.useRef<string>("")

  // Apply customizations to SVG
  useEffect(() => {
    // Skip processing if we don't have original SVG content
    if (!originalSvg) return

    let updatedSvg = originalSvg

    // Apply color palette if not "Original"
    if (selectedPalette.name !== "Original") {
      // This is a simplified approach - in a real implementation,
      // you would need more sophisticated SVG parsing and color replacement
      const colors = selectedPalette.name === "Custom" ? customColors : selectedPalette

      // Replace fill colors - this is a simplified example
      // In a real implementation, you would need to analyze the SVG structure
      updatedSvg = updatedSvg.replace(/fill="([^"]*)"/g, (match, color) => {
        // Simple logic to determine which color to use based on the original color
        // This would need to be more sophisticated in a real implementation
        if (color.toLowerCase() === "#000000" || color.toLowerCase() === "#000" || color.toLowerCase() === "black") {
          return `fill="${colors.primary}"`
        } else if (
          color.toLowerCase() === "#ffffff" ||
          color.toLowerCase() === "#fff" ||
          color.toLowerCase() === "white"
        ) {
          return `fill="${colors.accent}"`
        } else {
          return `fill="${colors.secondary}"`
        }
      })
    }

    // Create a container to apply filters and transforms
    const svgWithContainer = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        transform: rotate(${rotation}deg) scale(${scale / 100});
        filter: brightness(${brightness}%) contrast(${contrast}%) ${selectedStyle.filter};
      ">
        ${updatedSvg}
      </div>
    `

    setPreviewSvg(svgWithContainer)

    // Only call onUpdate when we have a meaningful change to avoid update loops
    const newSvgString = JSON.stringify(svgWithContainer)

    if (newSvgString !== lastUpdateRef.current) {
      lastUpdateRef.current = newSvgString
      onUpdate(svgWithContainer)
    }
  }, [selectedPalette, selectedStyle, customColors, rotation, scale, brightness, contrast, originalSvg, previewSvg])

  // Reset to original
  const handleReset = () => {
    setSelectedPalette(COLOR_PALETTES[0])
    setSelectedStyle(STYLE_PRESETS[0])
    setRotation(0)
    setScale(100)
    setBrightness(100)
    setContrast(100)
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Customize Logo</h3>
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset</span>
        </Button>
      </div>

      <Tabs defaultValue="colors">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="colors" className="flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Style</span>
          </TabsTrigger>
          <TabsTrigger value="adjust" className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Adjust</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Color Palette</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    {selectedPalette.name !== "Original" && (
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              selectedPalette.name === "Custom" ? customColors.primary : selectedPalette.primary,
                          }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              selectedPalette.name === "Custom" ? customColors.secondary : selectedPalette.secondary,
                          }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              selectedPalette.name === "Custom" ? customColors.accent : selectedPalette.accent,
                          }}
                        />
                      </div>
                    )}
                    <span>{selectedPalette.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {COLOR_PALETTES.map((palette) => (
                  <DropdownMenuItem
                    key={palette.name}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      selectedPalette.name === palette.name && "bg-accent",
                    )}
                    onClick={() => setSelectedPalette(palette)}
                  >
                    {palette.name !== "Original" && (
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                      </div>
                    )}
                    <span>{palette.name}</span>
                    {selectedPalette.name === palette.name && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    selectedPalette.name === "Custom" && "bg-accent",
                  )}
                  onClick={() => setSelectedPalette({ name: "Custom", ...customColors })}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: customColors.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: customColors.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: customColors.accent }} />
                  </div>
                  <span>Custom</span>
                  {selectedPalette.name === "Custom" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedPalette.name === "Custom" && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded border border-input"
                    style={{ backgroundColor: customColors.primary }}
                  />
                  <input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Secondary Color</label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded border border-input"
                    style={{ backgroundColor: customColors.secondary }}
                  />
                  <input
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded border border-input"
                    style={{ backgroundColor: customColors.accent }}
                  />
                  <input
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Style Preset</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>{selectedStyle.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {STYLE_PRESETS.map((style) => (
                  <DropdownMenuItem
                    key={style.name}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      selectedStyle.name === style.name && "bg-accent",
                    )}
                    onClick={() => setSelectedStyle(style)}
                  >
                    <span>{style.name}</span>
                    {selectedStyle.name === style.name && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Brightness</label>
              <span className="text-xs text-muted-foreground">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              min={50}
              max={150}
              step={1}
              onValueChange={(value) => setBrightness(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Contrast</label>
              <span className="text-xs text-muted-foreground">{contrast}%</span>
            </div>
            <Slider value={[contrast]} min={50} max={150} step={1} onValueChange={(value) => setContrast(value[0])} />
          </div>
        </TabsContent>

        <TabsContent value="adjust" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rotation</label>
              <span className="text-xs text-muted-foreground">{rotation}°</span>
            </div>
            <Slider value={[rotation]} min={-180} max={180} step={1} onValueChange={(value) => setRotation(value[0])} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Size</label>
              <span className="text-xs text-muted-foreground">{scale}%</span>
            </div>
            <Slider value={[scale]} min={50} max={150} step={1} onValueChange={(value) => setScale(value[0])} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Apply Changes</Button>
      </div>
    </div>
  )
}
