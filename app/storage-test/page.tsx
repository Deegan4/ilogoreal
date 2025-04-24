"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileManager } from "@/components/storage/file-manager"
import { initializeStorage, LOGO_BUCKET, USER_FILES_BUCKET, PUBLIC_BUCKET } from "@/lib/supabase/storage"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function StorageTestPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [initStatus, setInitStatus] = useState<{
    initialized: boolean
    error?: string
  } | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const result = await initializeStorage()
        setInitStatus({
          initialized: result.success,
          error: result.success ? undefined : String(result.error),
        })
      } catch (error) {
        console.error("Error initializing storage:", error)
        setInitStatus({
          initialized: false,
          error: error instanceof Error ? error.message : "Unknown error initializing storage",
        })
      }
    }

    init()
  }, [])

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Storage Test</CardTitle>
            <CardDescription>Loading authentication status...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Test</CardTitle>
          <CardDescription>
            Test the Supabase S3 storage integration with the endpoint:
            <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
              https://ejwwakfetsaroknowanp.supabase.co/storage/v1/s3
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initStatus && (
            <Alert variant={initStatus.initialized ? "default" : "destructive"} className="mb-4">
              {initStatus.initialized ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{initStatus.initialized ? "Storage Initialized" : "Initialization Error"}</AlertTitle>
              <AlertDescription>
                {initStatus.initialized
                  ? "Storage buckets have been successfully initialized."
                  : `Failed to initialize storage: ${initStatus.error}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Authentication Status</h3>
            {user ? (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Signed in as: {user.email}</p>
                <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not signed in</AlertTitle>
                <AlertDescription>You are not signed in. Some storage features may be limited.</AlertDescription>
              </Alert>
            )}
          </div>

          <Tabs defaultValue="public">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="public">Public Files</TabsTrigger>
              <TabsTrigger value="logos">Logo Files</TabsTrigger>
              <TabsTrigger value="user">User Files</TabsTrigger>
            </TabsList>

            <TabsContent value="public">
              <FileManager bucket={PUBLIC_BUCKET} allowUpload allowDelete />
            </TabsContent>

            <TabsContent value="logos">
              <FileManager bucket={LOGO_BUCKET} allowUpload allowDelete />
            </TabsContent>

            <TabsContent value="user">
              <FileManager bucket={USER_FILES_BUCKET} allowUpload allowDelete />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
