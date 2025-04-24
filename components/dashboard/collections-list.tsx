"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Folder, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Database } from "@/lib/database.types"

type Collection = Database["public"]["Tables"]["logo_collections"]["Row"]

interface CollectionsListProps {
  initialCollections: Collection[]
}

export function CollectionsList({ initialCollections }: CollectionsListProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const createCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Insert into the database - RLS will ensure the user can only create collections for themselves
      const { data, error } = await supabase
        .from("logo_collections")
        .insert({
          name: newCollectionName,
          description: newCollectionDescription || null,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setCollections((prev) => [...prev, data])
      setNewCollectionName("")
      setNewCollectionDescription("")
      setIsDialogOpen(false)

      toast({
        title: "Collection created",
        description: "Your collection has been created successfully",
      })
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create collection. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCollection = async (collectionId: string) => {
    try {
      // Optimistically update the UI
      setCollections((prev) => prev.filter((c) => c.id !== collectionId))

      // First delete all items in the collection - RLS will ensure the user can only delete their own items
      const { error: itemsError } = await supabase
        .from("logo_collection_items")
        .delete()
        .eq("collection_id", collectionId)

      if (itemsError) {
        throw itemsError
      }

      // Then delete the collection itself - RLS will ensure the user can only delete their own collections
      const { error } = await supabase.from("logo_collections").delete().eq("id", collectionId)

      if (error) {
        throw error
      }

      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully",
      })
    } catch (error) {
      // Revert the optimistic update on error
      setCollections(initialCollections)
      console.error("Error deleting collection:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete collection. Please try again.",
      })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Collections</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={createCollection} className="space-y-4 mt-2">
              <div className="space-y-2">
                <label htmlFor="collection-name" className="text-sm font-medium">
                  Collection Name
                </label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="collection-description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  id="collection-description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading || !newCollectionName}>
                {isLoading ? "Creating..." : "Create Collection"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">Create a collection to organize your logos</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => deleteCollection(collection.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mb-4">{collection.description}</p>
                )}
                <Button variant="outline" asChild className="w-full">
                  <a href={`/collections/${collection.id}`}>
                    <Folder className="h-4 w-4 mr-2" />
                    View Collection
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
