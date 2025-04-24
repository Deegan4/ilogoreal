"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function ApiDebugPage() {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [responseInfo, setResponseInfo] = useState<{
    status: number | null
    headers: Record<string, string> | null
  }>({
    status: null,
    headers: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const testRegularApi = async () => {
    await testApi("/api/collections")
  }

  const testDebugApi = async () => {
    await testApi("/api/debug/collections")
  }

  const testApi = async (endpoint: string) => {
    setIsLoading(true)
    setError(null)
    setResponse(null)
    setRawResponse(null)
    setResponseInfo({
      status: null,
      headers: null,
    })

    try {
      // Add a cache-busting parameter
      const timestamp = new Date().getTime()
      const res = await fetch(`${endpoint}?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          Accept: "application/json",
        },
      })

      // Store response status and headers
      setResponseInfo({
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
      })

      // Get the raw text response first
      const text = await res.text()
      setRawResponse(text)

      // Try to parse it as JSON
      try {
        // First check if the response is empty
        if (!text.trim()) {
          setError("Empty response from server")
          return
        }

        // Check for any non-JSON characters at the beginning
        let jsonText = text.trim()

        // Find the first '{' character which should be the start of JSON
        const firstBraceIndex = jsonText.indexOf("{")
        if (firstBraceIndex > 0) {
          console.warn(`Found ${firstBraceIndex} characters before JSON starts. Trimming.`)
          jsonText = jsonText.substring(firstBraceIndex)
        }

        // Now try to parse the JSON
        const data = JSON.parse(jsonText)
        setResponse(data)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        setError(
          `Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        )
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      setError(`Fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>
      <p className="text-muted-foreground mb-6">
        Use this page to test and debug API endpoints. This will help identify issues with JSON parsing and response
        formatting.
      </p>

      <div className="flex gap-4 mb-6">
        <Button onClick={testRegularApi} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Test Regular Collections API
        </Button>
        <Button onClick={testDebugApi} disabled={isLoading} variant="outline">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Test Debug Collections API
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="raw" className="mt-6">
        <TabsList>
          <TabsTrigger value="raw">Raw Response</TabsTrigger>
          <TabsTrigger value="parsed">Parsed JSON</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="raw">
          {rawResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <strong>Response Length:</strong> {rawResponse.length} characters
                </div>
                <div className="mb-2">
                  <strong>First 20 characters:</strong> "{rawResponse.substring(0, 20)}..."
                </div>
                <div className="mb-4">
                  <strong>Character codes of first 10 characters:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {Array.from(rawResponse.substring(0, 10)).map((char, i) => (
                      <div key={i} className="bg-muted p-2 rounded text-sm">
                        Pos {i}: "{char}" (ASCII: {char.charCodeAt(0)})
                      </div>
                    ))}
                  </div>
                </div>
                <details>
                  <summary className="cursor-pointer text-primary hover:underline">View Full Raw Response</summary>
                  <pre className="bg-muted p-4 rounded overflow-auto text-sm mt-2 max-h-96">{rawResponse}</pre>
                </details>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="parsed">
          {response && (
            <Card>
              <CardHeader>
                <CardTitle>Parsed Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded overflow-auto text-sm max-h-96">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Response Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Status Code</h3>
                  <p className="bg-muted p-2 rounded">{responseInfo.status || "No response yet"}</p>
                </div>

                {responseInfo.headers && (
                  <div>
                    <h3 className="font-medium mb-2">Response Headers</h3>
                    <pre className="bg-muted p-4 rounded overflow-auto text-sm max-h-60">
                      {JSON.stringify(responseInfo.headers, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Request Information</h3>
                  <pre className="bg-muted p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(
                      {
                        url: `/api/collections?t=${new Date().getTime()}`,
                        headers: {
                          "Cache-Control": "no-cache, no-store, must-revalidate",
                          Pragma: "no-cache",
                          Expires: "0",
                          Accept: "application/json",
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
