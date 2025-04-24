/**
 * Safely serializes an object to JSON, handling circular references
 */
export function safeJsonStringify(obj: any, indent: number | null = null): string {
  const seen = new WeakSet()

  return JSON.stringify(
    obj,
    (key, value) => {
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]"
        }
        seen.add(value)
      }

      // Handle special cases that might cause JSON serialization issues
      if (value instanceof Date) {
        return value.toISOString()
      }

      // Handle BigInt (if present)
      if (typeof value === "bigint") {
        return value.toString()
      }

      // Handle functions (if present)
      if (typeof value === "function") {
        return undefined
      }

      // Handle undefined values
      if (value === undefined) {
        return null
      }

      return value
    },
    indent,
  )
}

/**
 * Safely parses JSON with enhanced error handling
 */
export function safeJsonParse(text: string): any {
  try {
    // Check for BOM (Byte Order Mark)
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1)
    }

    // Trim any whitespace
    text = text.trim()

    // Parse the JSON
    return JSON.parse(text)
  } catch (error) {
    console.error("JSON parse error:", error)

    // Provide detailed diagnostics
    const errorPosition = (error as SyntaxError).message.match(/position (\d+)/)
    const position = errorPosition ? Number.parseInt(errorPosition[1]) : 0

    const context = 20 // Characters of context to show
    const start = Math.max(0, position - context)
    const end = Math.min(text.length, position + context)

    const excerpt = text.substring(start, end)
    const charCodes = Array.from(excerpt).map((c) => c.charCodeAt(0))

    console.error("Error context:", {
      position,
      excerpt,
      charCodes,
      textLength: text.length,
      firstFewChars: text.substring(0, 10),
      firstFewCharCodes: Array.from(text.substring(0, 10)).map((c) => c.charCodeAt(0)),
    })

    throw error
  }
}

// Add a new utility function to safely handle JSON responses
/**
 * Safely handles a response and returns parsed JSON
 */
export async function safeHandleResponse(response: Response): Promise<any> {
  try {
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error (${response.status}):`, errorText)

      // Try to parse error as JSON if possible
      try {
        return JSON.parse(errorText.trim())
      } catch (e) {
        // If not JSON, return a structured error
        return {
          error: `API error: ${response.status} ${response.statusText}`,
          details: errorText,
        }
      }
    }

    // Get the response text
    const text = await response.text()

    // If empty response, return empty object
    if (!text.trim()) {
      return {}
    }

    // Try to parse as JSON
    return JSON.parse(text.trim())
  } catch (error) {
    console.error("Response handling error:", error)
    throw new Error(`Failed to handle API response: ${error instanceof Error ? error.message : String(error)}`)
  }
}
