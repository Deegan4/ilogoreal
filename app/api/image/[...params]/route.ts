import { type NextRequest, NextResponse } from "next/server"
import { imageQualities } from "@/lib/image-service"

export async function GET(request: NextRequest, { params }: { params: { params: string[] } }) {
  try {
    // Get URL parameters
    const url = request.nextUrl.searchParams.get("url")
    const width = Number.parseInt(request.nextUrl.searchParams.get("w") || "0", 10) || 800
    const quality = Number.parseInt(request.nextUrl.searchParams.get("q") || "0", 10) || imageQualities.medium

    if (!url) {
      return new NextResponse("Missing URL parameter", { status: 400 })
    }

    // Fetch the image
    const imageResponse = await fetch(url)
    if (!imageResponse.ok) {
      return new NextResponse("Failed to fetch image", { status: 404 })
    }

    // Get the image buffer
    const imageBuffer = await imageResponse.arrayBuffer()

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Image processing error:", error)
    return new NextResponse("Error processing image", { status: 500 })
  }
}
