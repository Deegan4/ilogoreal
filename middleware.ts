import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log the request for debugging
  console.log(`Middleware processing: ${request.method} ${request.nextUrl.pathname}`)

  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Create a response object
  const response = NextResponse.next()

  // Ensure proper content type for API responses
  response.headers.set("Content-Type", "application/json")

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Add cache control headers to prevent caching
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  // Log the response headers for debugging
  console.log("Middleware response headers:", Object.fromEntries(response.headers.entries()))

  return response
}

// Handle OPTIONS requests for CORS preflight
export function OPTIONS(request: NextRequest) {
  // Create a response with CORS headers
  const response = new NextResponse(null, {
    status: 204,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })

  return response
}

export const config = {
  matcher: "/api/:path*",
}
