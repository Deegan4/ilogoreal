"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Logo = Database["public"]["Tables"]["logos"]["Row"]
type Collection = Database["public"]["Tables"]["logo_collections"]["Row"]

interface AddToCollectionDialogProps {
  logo: Logo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToCollectionDialog({ logo, open, onOpenChange }: AddToCollectionDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch user's collections when dialog opens
  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open])

  const fetchCollections = async () => {
    setIsLoading(true)
    try {
      // Fetch collections - RLS will ensure the user can only see their own collections
      const { data, error } = await supabase
        .from("logo_collections")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setCollections(data || [])
    } catch (error) {
      console.error("Error fetching collections:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load collections. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addToCollection = async (collectionId: string) => {
    setIsAdding(true)
    try {
      // Check if the logo is already in the collection
      const { data: existing, error: checkError } = await supabase
        .from("logo_collection_items")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("logo_id", logo.id)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      // If already exists, do nothing
      if (existing) {
        toast({
          title: "Already in collection",
          description: "This logo is already in the selected collection",
        })
        return
      }

      // Add to collection - RLS will ensure the user can only add to their own collections
      const { error } = await supabase.from("logo_collection_items").insert({
        collection_id: collectionId,
        logo_id: logo.id,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Added to collection",
        description: "Logo has been added to the collection",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error adding to collection:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add logo to collection. Please try again.",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collections yet. Create one first.</p>
          ) : (
            collections.map((collection) => (
              <Button
                key={collection.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addToCollection(collection.id)}
                disabled={isAdding}
              >
                {collection.name}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
