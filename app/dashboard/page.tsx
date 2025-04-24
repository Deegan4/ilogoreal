"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Logo {
  id: string
  prompt: string
  svg_content: string
  created_at: string
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

interface CollectionsResponse {
  collections: Collection[]
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [responseDebug, setResponseDebug] = useState<{
    raw: string | null
    status: number | null
    headers: Record<string, string> | null
  }>({
    raw: null,
    status: null,
    headers: null,
  })

  const fetchCollections = async () => {
    let errorMessage = null
    let details = null
    let responseText = null

    if (!user) {
      if (!isAuthLoading) {
        setError("Please sign in to view your dashboard")
      }
      return
    }

    setIsLoading(true)
    setError(null)
    setErrorDetails(null)
    setResponseDebug({
      raw: null,
      status: null,
      headers: null,
    })

    try {
      // Add a cache-busting parameter to prevent caching issues
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/collections?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      // Store response status and headers for debugging
      setResponseDebug((prev) => ({
        ...prev,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      }))

      // Get the raw response text for debugging
      responseText = await response.text()
      console.log("Raw API response:", responseText)

      // Store the raw response for debugging
      setResponseDebug((prev) => ({
        ...prev,
        raw: responseText,
      }))

      if (!response.ok) {
        errorMessage = `API error: ${response.status} ${response.statusText}`
        details = null

        try {
          // Try to parse the error response as JSON
          if (responseText.trim()) {
            const errorData = JSON.parse(responseText.trim())
            if (errorData.error) {
              errorMessage = errorData.error
            }
            if (errorData.details) {
              details = errorData.details
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
          details = "Could not parse error response: " + responseText.substring(0, 100) + "..."
        }

        setError(errorMessage)
        if (details) {
          setErrorDetails(details)
        }
        setIsLoading(false)
        return
      }

      // Parse the successful response
      try {
        // First check if the response is empty
        if (!responseText.trim()) {
          throw new Error("Empty response from server")
        }

        // Now try to parse the JSON
        const data = JSON.parse(responseText.trim()) as CollectionsResponse

        // Validate the response structure
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format: not an object")
        }

        if (!Array.isArray(data.collections)) {
          throw new Error("Invalid response format: collections is not an array")
        }

        setCollections(data.collections || [])
      } catch (parseError) {
        console.error("Error parsing success response:", parseError)
        setError(
          `Failed to parse server response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        )
        setErrorDetails("Response was not valid JSON: " + responseText.substring(0, 100) + "...")
      }
    } catch (err) {
      console.error("Error fetching collections:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [user, isAuthLoading])

  const handleRetry = () => {
    fetchCollections()
  }

  // Show loading state while auth is loading
  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state if there's an error with Supabase initialization
  if (!user && !isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>There was a problem connecting to the authentication service. This could be due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Missing environment variables</li>
              <li>Connection issues with the authentication service</li>
              <li>You need to sign in first</li>
            </ul>
            <div className="flex gap-2 mt-2">
              <Button asChild variant="outline">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to view your dashboard.
            <Button asChild variant="link" className="p-0 ml-2">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" /> Create New Logo
            </Link>
          </Button>
        </div>
      </div>

      {/* Show error state if there's an error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            {errorDetails && <p className="text-sm opacity-80">Details: {errorDetails}</p>}

            {/* Debug information */}
            {responseDebug.raw && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
                <div className="mt-2 text-xs">
                  <p>
                    <strong>Status:</strong> {responseDebug.status}
                  </p>

                  {responseDebug.headers && (
                    <div className="mt-1">
                      <p>
                        <strong>Headers:</strong>
                      </p>
                      <pre className="bg-black/10 p-2 rounded mt-1 overflow-auto max-h-32">
                        {JSON.stringify(responseDebug.headers, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="mt-1">
                    <p>
                      <strong>Raw Response:</strong>
                    </p>
                    <pre className="bg-black/10 p-2 rounded mt-1 overflow-auto max-h-32">
                      {responseDebug.raw.substring(0, 500)}
                      {responseDebug.raw.length > 500 ? "..." : ""}
                    </pre>
                  </div>

                  <div className="mt-1">
                    <p>
                      <strong>First 10 characters (ASCII codes):</strong>
                    </p>
                    <pre className="bg-black/10 p-2 rounded mt-1 overflow-auto">
                      {Array.from(responseDebug.raw.substring(0, 10)).map(
                        (char, i) => `Pos ${i}: "${char}" (${char.charCodeAt(0)})
`,
                      )}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Collections</CardTitle>
            <CardDescription>Manage your logo collections</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">You don't have any collections yet.</p>
                <Button asChild>
                  <Link href="/collections/new">
                    <Plus className="mr-2 h-4 w-4" /> Create Collection
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                  <Link key={collection.id} href={`/collections/${collection.id}`}>
                    <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        {collection.description && <CardDescription>{collection.description}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {collection.logo_collection_items?.length || 0} logos
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                <Link href="/collections/new">
                  <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-full py-6">
                      <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Create New Collection</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent logo generation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/history">View Full History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Debugging Tools</AlertTitle>
          <AlertDescription>
            If you're experiencing issues with the dashboard, you can use our debugging tools to help identify the
            problem.
            <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/api-debug">API Debugging Page</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
