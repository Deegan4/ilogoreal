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

    // Fetch the collection
    const { data: collection, error: collectionError } = await supabase
      .from("logo_collections")
      .select("*")
      .eq("id", collectionId)
      .eq("user_id", session.user.id)
      .single()

    if (collectionError) {
      if (collectionError.code === "PGRST116") {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 })
      }
      console.error("Error fetching collection:", collectionError)
      return NextResponse.json(
        { error: "Failed to fetch collection", details: collectionError.message },
        { status: 500 },
      )
    }

    // Fetch the collection items
    const { data: items, error: itemsError } = await supabase
      .from("logo_collection_items")
      .select("*, logos(*)")
      .eq("collection_id", collectionId)

    if (itemsError) {
      console.error("Error fetching collection items:", itemsError)
      // Continue without items
    }

    // Return the collection with its items
    return NextResponse.json({
      collection: {
        ...collection,
        logo_collection_items: items || [],
      },
    })
  } catch (error) {
    console.error("Unhandled error in collection GET route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
