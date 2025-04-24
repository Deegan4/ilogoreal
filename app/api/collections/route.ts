import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic"

export async function GET() {
  console.log("Collections API route called")

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json(
        { error: "Authentication error", details: sessionError.message },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log("Fetching collections for user:", session.user.id)

    // First, check if the tables exist by running a simple query
    try {
      // Simple query to check if the logo_collections table exists and is accessible
      const { data: testData, error: testError } = await supabase.from("logo_collections").select("id").limit(1)

      if (testError) {
        console.error("Test query error:", testError)
        return NextResponse.json(
          {
            error: "Database test query failed",
            details: testError.message,
            code: testError.code,
          },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      console.log("Test query successful, table exists")
    } catch (testQueryError) {
      console.error("Exception during test query:", testQueryError)
      return NextResponse.json(
        {
          error: "Exception during test query",
          details: testQueryError instanceof Error ? testQueryError.message : String(testQueryError),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Now try the actual query with proper error handling
    try {
      // Fetch collections for the authenticated user
      const { data: collections, error: collectionsError } = await supabase
        .from("logo_collections")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (collectionsError) {
        console.error("Collections query error:", collectionsError)
        return NextResponse.json(
          {
            error: "Failed to fetch collections",
            details: collectionsError.message,
            code: collectionsError.code,
          },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      console.log(`Successfully fetched ${collections?.length || 0} collections`)

      // For each collection, fetch its items
      const collectionsWithItems = []

      for (const collection of collections || []) {
        try {
          const { data: items, error: itemsError } = await supabase
            .from("logo_collection_items")
            .select("*, logos(*)")
            .eq("collection_id", collection.id)

          if (itemsError) {
            console.error(`Error fetching items for collection ${collection.id}:`, itemsError)
            // Continue with other collections even if one fails
            collectionsWithItems.push({
              ...collection,
              logo_collection_items: [],
            })
          } else {
            collectionsWithItems.push({
              ...collection,
              logo_collection_items: items || [],
            })
          }
        } catch (itemsError) {
          console.error(`Exception fetching items for collection ${collection.id}:`, itemsError)
          collectionsWithItems.push({
            ...collection,
            logo_collection_items: [],
          })
        }
      }

      // Create a sanitized version of the collections to ensure it can be safely serialized
      const sanitizedCollections = collectionsWithItems.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        created_at: collection.created_at,
        user_id: collection.user_id,
        logo_collection_items: Array.isArray(collection.logo_collection_items)
          ? collection.logo_collection_items.map((item) => ({
              collection_id: item.collection_id,
              logo_id: item.logo_id,
              created_at: item.created_at,
              logos: item.logos
                ? {
                    id: item.logos.id,
                    prompt: item.logos.prompt,
                    svg_content: item.logos.svg_content,
                    created_at: item.logos.created_at,
                    updated_at: item.logos.updated_at,
                    is_favorite: item.logos.is_favorite,
                    user_id: item.logos.user_id,
                  }
                : null,
            }))
          : [],
      }))

      // Return the collections with proper headers
      return new NextResponse(JSON.stringify({ collections: sanitizedCollections }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (queryError) {
      console.error("Exception during collections query:", queryError)
      return NextResponse.json(
        {
          error: "Exception during collections query",
          details: queryError instanceof Error ? queryError.message : String(queryError),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Unhandled error in collections API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json(
        { error: "Authentication error", details: sessionError.message },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Parse request body with error handling
    let body
    try {
      const text = await request.text()
      console.log("Request body:", text)
      body = JSON.parse(text)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate request body
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Collection name is required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Create the collection
    const { data, error } = await supabase
      .from("logo_collections")
      .insert({
        name: body.name,
        description: body.description || null,
        user_id: session.user.id,
      })
      .select()

    if (error) {
      console.error("Error creating collection:", error)
      return NextResponse.json(
        {
          error: "Failed to create collection",
          details: error.message,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    return new NextResponse(JSON.stringify({ collection: data[0] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Unhandled error in collections POST route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
