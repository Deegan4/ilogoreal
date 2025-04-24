"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Heart, Trash2, FolderPlus } from "lucide-react"
import { AddToCollectionDialog } from "./add-to-collection-dialog"
import { LogoImage } from "@/components/logo-image"
import type { Database } from "@/lib/database.types"

type Logo = Database["public"]["Tables"]["logos"]["Row"]

interface LogoGalleryProps {
  initialLogos: Logo[]
}

export function LogoGallery({ initialLogos }: LogoGalleryProps) {
  const [logos, setLogos] = useState<Logo[]>(initialLogos)
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null)
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const downloadSvg = (svg: string, name: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Logo downloaded",
      description: "Your logo has been downloaded successfully",
    })
  }

  const toggleFavorite = async (logoId: string) => {
    try {
      // Find the logo to toggle
      const logo = logos.find((l) => l.id === logoId)
      if (!logo) return

      // Optimistically update the UI
      setLogos((prev) => prev.map((l) => (l.id === logoId ? { ...l, is_favorite: !l.is_favorite } : l)))

      // Update in the database - RLS will ensure the user can only update their own logos
      const { error } = await supabase.from("logos").update({ is_favorite: !logo.is_favorite }).eq("id", logoId)

      if (error) {
        throw error
      }
    } catch (err) {
      // Revert the optimistic update on error
      setLogos(initialLogos)
      console.error("Error toggling favorite:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update logo. Please try again.",
      })
    }
  }

  const deleteLogo = async (logoId: string) => {
    try {
      // Optimistically update the UI
      setLogos((prev) => prev.filter((l) => l.id !== logoId))

      // Delete from the database - RLS will ensure the user can only delete their own logos
      const { error } = await supabase.from("logos").delete().eq("id", logoId)

      if (error) {
        throw error
      }

      toast({
        title: "Logo deleted",
        description: "Your logo has been deleted successfully",
      })
    } catch (err) {
      // Revert the optimistic update on error
      setLogos(initialLogos)
      console.error("Error deleting logo:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete logo. Please try again.",
      })
    }
  }

  if (logos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No logos yet</h3>
        <p className="text-muted-foreground mb-4">Generate some logos to see them here</p>
        <Button asChild>
          <a href="/">Create Your First Logo</a>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {logos.map((logo) => (
          <Card key={logo.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square bg-white p-4 flex items-center justify-center">
                <LogoImage svgContent={logo.svg_content} className="w-full h-full" />
              </div>
              <div className="p-3">
                <p className="text-sm truncate mb-2" title={logo.prompt}>
                  {logo.prompt}
                </p>
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={logo.is_favorite ? "text-red-500" : ""}
                    onClick={() => toggleFavorite(logo.id)}
                  >
                    <Heart className="h-4 w-4" fill={logo.is_favorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedLogo(logo)
                      setIsAddToCollectionOpen(true)
                    }}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadSvg(logo.svg_content, `logo-${logo.id.substring(0, 8)}`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteLogo(logo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLogo && (
        <AddToCollectionDialog
          logo={selectedLogo}
          open={isAddToCollectionOpen}
          onOpenChange={setIsAddToCollectionOpen}
        />
      )}
    </div>
  )
}
