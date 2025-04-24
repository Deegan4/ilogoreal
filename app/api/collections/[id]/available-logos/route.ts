import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const collectionId = params.id
    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 })
    }

    // Verify the collection exists and belongs to the user
    const { data: collection, error: collectionError } = await supabase
      .from("logo_collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", session.user.id)
      .single()

    if (collectionError) {
      if (collectionError.code === "PGRST116") {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 })
      }
      console.error("Error verifying collection:", collectionError)
      return NextResponse.json(
        { error: "Failed to verify collection", details: collectionError.message },
        { status: 500 },
      )
    }

    // Get logos that are already in the collection
    const { data: existingItems, error: existingItemsError } = await supabase
      .from("logo_collection_items")
      .select("logo_id")
      .eq("collection_id", collectionId)

    if (existingItemsError) {
      console.error("Error fetching existing items:", existingItemsError)
      return NextResponse.json(
        { error: "Failed to fetch existing items", details: existingItemsError.message },
        { status: 500 },
      )
    }

    // Extract the logo IDs that are already in the collection
    const existingLogoIds = (existingItems || []).map((item) => item.logo_id)

    // Fetch all logos that belong to the user and are not in the collection
    let query = supabase
      .from("logos")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    // If there are existing logos in the collection, exclude them
    if (existingLogoIds.length > 0) {
      query = query.not("id", "in", `(${existingLogoIds.join(",")})`)
    }

    const { data: logos, error: logosError } = await query

    if (logosError) {
      console.error("Error fetching available logos:", logosError)
      return NextResponse.json(
        { error: "Failed to fetch available logos", details: logosError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ logos: logos || [] })
  } catch (error) {
    console.error("Unhandled error in available-logos GET route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
