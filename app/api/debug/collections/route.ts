import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic"

export async function GET() {
  console.log("Debug Collections API route called")

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
      return new NextResponse(
        JSON.stringify({
          error: "Authentication error",
          details: sessionError.message,
          diagnostics: { stage: "auth" },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized: No active session",
          diagnostics: { stage: "auth_check" },
        }),
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
        return new NextResponse(
          JSON.stringify({
            error: "Database test query failed",
            details: testError.message,
            code: testError.code,
            diagnostics: { stage: "test_query", error: testError },
          }),
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
      return new NextResponse(
        JSON.stringify({
          error: "Exception during test query",
          details: testQueryError instanceof Error ? testQueryError.message : String(testQueryError),
          diagnostics: { stage: "test_query_exception", error: testQueryError },
        }),
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
        return new NextResponse(
          JSON.stringify({
            error: "Failed to fetch collections",
            details: collectionsError.message,
            code: collectionsError.code,
            diagnostics: { stage: "collections_query", error: collectionsError },
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      console.log(`Successfully fetched ${collections?.length || 0} collections`)

      // Return a simplified response for diagnostic purposes
      return new NextResponse(
        JSON.stringify({
          success: true,
          count: collections?.length || 0,
          collections:
            collections?.map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description,
              created_at: c.created_at,
            })) || [],
          diagnostics: {
            stage: "success",
            user_id: session.user.id,
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } catch (queryError) {
      console.error("Exception during collections query:", queryError)
      return new NextResponse(
        JSON.stringify({
          error: "Exception during collections query",
          details: queryError instanceof Error ? queryError.message : String(queryError),
          diagnostics: { stage: "collections_query_exception", error: queryError },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Unhandled error in debug collections API route:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        diagnostics: { stage: "unhandled_error", error },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
