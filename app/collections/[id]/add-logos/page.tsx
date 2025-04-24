"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react"
import Link from "next/link"

interface Logo {
  id: string
  prompt: string
  svg_content: string
  created_at: string
  is_favorite: boolean
}

interface Collection {
  id: string
  name: string
  description: string | null
}

export default function AddLogosToCollectionPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [availableLogos, setAvailableLogos] = useState<Logo[]>([])
  const [selectedLogoIds, setSelectedLogoIds] = useState<Set<string>>(new Set())
  const [isLoadingCollection, setIsLoadingCollection] = useState(true)
  const [isLoadingLogos, setIsLoadingLogos] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch collection details
  useEffect(() => {
    if (!user || !collectionId) return

    const fetchCollection = async () => {
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
        setIsLoadingCollection(false)
      }
    }

    fetchCollection()
  }, [user, collectionId])

  // Fetch available logos (logos not already in the collection)
  useEffect(() => {
    if (!user || !collectionId) return

    const fetchAvailableLogos = async () => {
      try {
        const response = await fetch(`/api/collections/${collectionId}/available-logos`)
        if (!response.ok) {
          throw new Error("Failed to fetch available logos")
        }
        const data = await response.json()
        setAvailableLogos(data.logos)
      } catch (err) {
        console.error("Error fetching available logos:", err)
        setError("Failed to load available logos")
      } finally {
        setIsLoadingLogos(false)
      }
    }

    fetchAvailableLogos()
  }, [user, collectionId])

  const handleLogoSelection = (logoId: string) => {
    setSelectedLogoIds((prev) => {
      const newSelection = new Set(prev)
      if (newSelection.has(logoId)) {
        newSelection.delete(logoId)
      } else {
        newSelection.add(logoId)
      }
      return newSelection
    })
  }

  const handleSubmit = async () => {
    if (selectedLogoIds.size === 0) {
      setError("Please select at least one logo to add")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/collections/${collectionId}/logos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logoIds: Array.from(selectedLogoIds),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add logos to collection")
      }

      const data = await response.json()
      setSuccessMessage(`Successfully added ${data.added} logos to the collection`)
      setSelectedLogoIds(new Set())

      // Refresh the available logos list
      setIsLoadingLogos(true)
      const refreshResponse = await fetch(`/api/collections/${collectionId}/available-logos`)
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setAvailableLogos(refreshData.logos)
      }
      setIsLoadingLogos(false)
    } catch (err) {
      console.error("Error adding logos to collection:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to manage collections.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/collections/${collectionId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collection
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isLoadingCollection ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              `Add Logos to ${collection?.name || "Collection"}`
            )}
          </CardTitle>
          <CardDescription>
            {isLoadingCollection ? <Skeleton className="h-4 w-full" /> : "Select logos to add to this collection"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}

          {isLoadingLogos ? (
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
          ) : availableLogos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No available logos to add to this collection.</p>
              <Button asChild className="mt-4">
                <Link href="/create">Create New Logo</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableLogos.map((logo) => (
                <Card
                  key={logo.id}
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedLogoIds.has(logo.id) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleLogoSelection(logo.id)}
                >
                  <div className="relative h-40 w-full bg-gray-50 flex items-center justify-center p-4">
                    <div dangerouslySetInnerHTML={{ __html: logo.svg_content }} />
                    <div className="absolute top-2 right-2">
                      <Checkbox
                        checked={selectedLogoIds.has(logo.id)}
                        onCheckedChange={() => handleLogoSelection(logo.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium truncate">{logo.prompt}</p>
                    <p className="text-sm text-muted-foreground">{new Date(logo.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/collections/${collectionId}`}>Cancel</Link>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedLogoIds.size === 0 || availableLogos.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              `Add ${selectedLogoIds.size} Logo${selectedLogoIds.size !== 1 ? "s" : ""}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
