"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileImage, FileCode, Loader2 } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { ResponsiveImage } from "@/components/ui/responsive-image"
import { generateSizes } from "@/lib/image-service"

type Logo = Database["public"]["Tables"]["logos"]["Row"]

interface ExportOptionsProps {
  logo: Logo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportOptions({ logo, open, onOpenChange }: ExportOptionsProps) {
  const [format, setFormat] = useState<"svg" | "png" | "jpg">("svg")
  const [size, setSize] = useState<"small" | "medium" | "large">("medium")
  const [customWidth, setCustomWidth] = useState("512")
  const [customHeight, setCustomHeight] = useState("512")
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  // Get dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case "small":
        return { width: 256, height: 256 }
      case "medium":
        return { width: 512, height: 512 }
      case "large":
        return { width: 1024, height: 1024 }
      case "custom":
        return {
          width: Number.parseInt(customWidth) || 512,
          height: Number.parseInt(customHeight) || 512,
        }
    }
  }

  // Convert SVG to PNG or JPG
  const convertSvgToImage = async () => {
    setIsLoading(true)
    try {
      const { width, height } = getDimensions()

      // Create a canvas element
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Fill with white background for JPG
      if (format === "jpg") {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, width, height)
      }

      // Create an image from the SVG
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Create a blob URL from the SVG
      const svgBlob = new Blob([logo.svg_content], { type: "image/svg+xml" })
      const url = URL.createObjectURL(svgBlob)

      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob as Blob), format === "jpg" ? "image/jpeg" : "image/png", 0.9)
      })

      // Create a URL for the blob
      const imageUrl = URL.createObjectURL(blob)
      setPreviewUrl(imageUrl)

      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error converting SVG:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to convert the logo. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Download the image
  const downloadImage = () => {
    if (format === "svg") {
      // Download SVG
      const blob = new Blob([logo.svg_content], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `logo-${logo.id.substring(0, 8)}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (previewUrl) {
      // Download PNG or JPG
      const a = document.createElement("a")
      a.href = previewUrl
      a.download = `logo-${logo.id.substring(0, 8)}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      // Generate the image first
      convertSvgToImage()
    }

    toast({
      title: "Logo downloaded",
      description: `Your logo has been downloaded as ${format.toUpperCase()}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Logo</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="format" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="size">Size</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4 pt-4">
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as "svg" | "png" | "jpg")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="svg" id="format-svg" />
                <Label htmlFor="format-svg" className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  SVG (Vector)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="format-png" />
                <Label htmlFor="format-png" className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  PNG (Transparent)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="format-jpg" />
                <Label htmlFor="format-jpg" className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  JPG (White Background)
                </Label>
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="size" className="space-y-4 pt-4">
            <RadioGroup
              value={size}
              onValueChange={(value) => setSize(value as "small" | "medium" | "large" | "custom")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="size-small" />
                <Label htmlFor="size-small">Small (256×256)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="size-medium" />
                <Label htmlFor="size-medium">Medium (512×512)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="size-large" />
                <Label htmlFor="size-large">Large (1024×1024)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="size-custom" />
                <Label htmlFor="size-custom">Custom</Label>
              </div>
            </RadioGroup>

            {size === "custom" && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="custom-width">Width (px)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min="32"
                    max="2048"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-height">Height (px)</Label>
                  <Input
                    id="custom-height"
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    min="32"
                    max="2048"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {format !== "svg" && (
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={convertSvgToImage} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating preview...
                </>
              ) : (
                "Generate Preview"
              )}
            </Button>

            {previewUrl && (
              <div className="mt-4 bg-white p-4 rounded-lg border">
                <ResponsiveImage
                  src={previewUrl}
                  alt="Preview"
                  width={512}
                  height={512}
                  className="w-full h-auto"
                  objectFit="contain"
                  sizes={generateSizes({
                    sm: "100vw",
                    md: "80vw",
                    lg: "60vw",
                    xl: "40vw",
                  })}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={downloadImage} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
