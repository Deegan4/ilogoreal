/**
 * Safely parses JSON with enhanced error handling
 */
export async function safeParseJSON(response: Response) {
  try {
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error (${response.status}):`, errorText)
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    // Validate content type
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response:", text)
      throw new Error("Server returned non-JSON response")
    }

    // Parse JSON
    return await response.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      // JSON parse error
      console.error("JSON parse error:", error)
      const rawText = await response.clone().text()
      console.error("Raw response:", rawText)
      throw new Error("Failed to parse server response as JSON")
    }
    throw error
  }
}

/**
 * Fetches data from an API endpoint with consistent error handling
 */
export async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options)
    return await safeParseJSON(response)
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error
  }
}
