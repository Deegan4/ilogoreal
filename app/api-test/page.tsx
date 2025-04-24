"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApiTestPage() {
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

  const testApi = async () => {
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
      const res = await fetch(`/api/collections?t=${timestamp}`, {
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
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

      <div className="mb-4">
        <Button onClick={testApi} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Collections API"}
        </Button>
      </div>

      <Tabs defaultValue="raw" className="mt-6">
        <TabsList>
          <TabsTrigger value="raw">Raw Response</TabsTrigger>
          <TabsTrigger value="parsed">Parsed JSON</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="raw">
          {error && (
            <Card className="mb-4 border-red-500">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-red-50 p-4 rounded overflow-auto text-red-800 text-sm">{error}</pre>
              </CardContent>
            </Card>
          )}

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
                <div className="mb-2">
                  <strong>Character codes of first 10 characters:</strong>
                  <ul className="list-disc pl-5">
                    {Array.from(rawResponse.substring(0, 10)).map((char, i) => (
                      <li key={i}>
                        Position {i}: "{char}" (ASCII: {char.charCodeAt(0)})
                      </li>
                    ))}
                  </ul>
                </div>
                <details>
                  <summary className="cursor-pointer text-blue-500 hover:text-blue-700">View Full Raw Response</summary>
                  <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm mt-2">{rawResponse}</pre>
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
                <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">{JSON.stringify(response, null, 2)}</pre>
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
                  <p className="bg-gray-50 p-2 rounded">{responseInfo.status || "No response yet"}</p>
                </div>

                {responseInfo.headers && (
                  <div>
                    <h3 className="font-medium mb-2">Response Headers</h3>
                    <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                      {JSON.stringify(responseInfo.headers, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Request Information</h3>
                  <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
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
