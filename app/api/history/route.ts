import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch generation history for the authenticated user
    const { data, error } = await supabase
      .from("logo_generation_history")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch generation history" }, { status: 500 })
    }

    // Ensure we're returning valid JSON
    return NextResponse.json({ history: data || [] })
  } catch (error) {
    console.error("Error in history API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
