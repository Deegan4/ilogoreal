import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string; logoId: string } }) {
  try {
    const collectionId = params.id
    const logoId = params.logoId

    if (!collectionId || !logoId) {
      return NextResponse.json({ error: "Collection ID and Logo ID are required" }, { status: 400 })
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

    // Remove the logo from the collection
    const { error: deleteError } = await supabase
      .from("logo_collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("logo_id", logoId)

    if (deleteError) {
      console.error("Error removing logo from collection:", deleteError)
      return NextResponse.json(
        { error: "Failed to remove logo from collection", details: deleteError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "Logo removed from collection successfully" })
  } catch (error) {
    console.error("Unhandled error in logo DELETE route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
