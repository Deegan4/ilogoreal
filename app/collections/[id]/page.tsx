"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Logo {
  id: string
  prompt: string
  svg_content: string
  created_at: string
  is_favorite: boolean
}

interface CollectionItem {
  collection_id: string
  logo_id: string
  created_at: string
  logos: Logo
}

interface Collection {
  id: string
  name: string
  description: string | null
  created_at: string
  logo_collection_items: CollectionItem[]
}

export default function CollectionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoToRemove, setLogoToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const fetchCollection = async () => {
    if (!user || !collectionId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/collections/${collectionId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch collection")
      }
      const data = await response.json()
      setCollection(data.collection)
    } catch (err) {
      console.error("Error fetching collection:", err)
      setError("Failed to load collection details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollection()
  }, [user, collectionId])

  const handleRemoveLogo = async (logoId: string) => {
    if (!user || !collectionId) return

    setIsRemoving(true)

    try {
      const response = await fetch(`/api/collections/${collectionId}/logos/${logoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove logo from collection")
      }

      // Refresh the collection data
      fetchCollection()
    } catch (err) {
      console.error("Error removing logo:", err)
      setError("Failed to remove logo from collection")
    } finally {
      setIsRemoving(false)
      setLogoToRemove(null)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to view collections.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        {!isLoading && collection && (
          <Button asChild>
            <Link href={`/collections/${collectionId}/add-logos`}>
              <Plus className="mr-2 h-4 w-4" /> Add Logos
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? <Skeleton className="h-8 w-64" /> : collection?.name || "Collection"}</CardTitle>
          <CardDescription>
            {isLoading ? <Skeleton className="h-4 w-full" /> : collection?.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : collection?.logo_collection_items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This collection is empty.</p>
              <Button asChild className="mt-4">
                <Link href={`/collections/${collectionId}/add-logos`}>Add Logos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collection?.logo_collection_items.map((item) => (
                <Card key={item.logo_id} className="overflow-hidden group">
                  <div className="relative h-40 w-full bg-gray-50 flex items-center justify-center p-4">
                    <div dangerouslySetInnerHTML={{ __html: item.logos.svg_content }} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setLogoToRemove(item.logo_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Logo</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove this logo from the collection? This action cannot be
                              undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setLogoToRemove(null)} disabled={isRemoving}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => logoToRemove && handleRemoveLogo(logoToRemove)}
                              disabled={isRemoving}
                            >
                              {isRemoving ? "Removing..." : "Remove"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium truncate">{item.logos.prompt}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.logos.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
