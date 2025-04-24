import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    // Parse request body
    const body = await request.json()
    const { logoIds } = body

    if (!logoIds || !Array.isArray(logoIds) || logoIds.length === 0) {
      return NextResponse.json({ error: "Logo IDs are required" }, { status: 400 })
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

    // Verify the logos exist and belong to the user
    const { data: logos, error: logosError } = await supabase
      .from("logos")
      .select("id")
      .in("id", logoIds)
      .eq("user_id", session.user.id)

    if (logosError) {
      console.error("Error verifying logos:", logosError)
      return NextResponse.json({ error: "Failed to verify logos", details: logosError.message }, { status: 500 })
    }

    if (!logos || logos.length === 0) {
      return NextResponse.json({ error: "No valid logos found" }, { status: 400 })
    }

    // Get the valid logo IDs
    const validLogoIds = logos.map((logo) => logo.id)

    // Check which logos are already in the collection
    const { data: existingItems, error: existingItemsError } = await supabase
      .from("logo_collection_items")
      .select("logo_id")
      .eq("collection_id", collectionId)
      .in("logo_id", validLogoIds)

    if (existingItemsError) {
      console.error("Error checking existing items:", existingItemsError)
      return NextResponse.json(
        { error: "Failed to check existing items", details: existingItemsError.message },
        { status: 500 },
      )
    }

    // Filter out logos that are already in the collection
    const existingLogoIds = new Set((existingItems || []).map((item) => item.logo_id))
    const newLogoIds = validLogoIds.filter((id) => !existingLogoIds.has(id))

    if (newLogoIds.length === 0) {
      return NextResponse.json({ message: "All selected logos are already in the collection", added: 0 })
    }

    // Prepare the items to insert
    const itemsToInsert = newLogoIds.map((logoId) => ({
      collection_id: collectionId,
      logo_id: logoId,
    }))

    // Add the logos to the collection
    const { data: insertedItems, error: insertError } = await supabase
      .from("logo_collection_items")
      .insert(itemsToInsert)
      .select()

    if (insertError) {
      console.error("Error adding logos to collection:", insertError)
      return NextResponse.json(
        { error: "Failed to add logos to collection", details: insertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: `Successfully added ${newLogoIds.length} logo(s) to the collection`,
      added: newLogoIds.length,
    })
  } catch (error) {
    console.error("Unhandled error in logos POST route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
