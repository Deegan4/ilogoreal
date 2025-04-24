import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)

      // Check if this is a new user (first sign in)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Check if the user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError || !profile) {
          // Create a profile for the user if they don't have one
          const { error: insertError } = await supabase.from("profiles").insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || null,
            avatar_url: session.user.user_metadata.avatar_url || null,
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
          }
        }
      }
    }

    // Redirect to the dashboard after successful authentication
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error in auth callback:", error)
    // Redirect to sign in page with error message
    return NextResponse.redirect(new URL("/auth/signin?error=Authentication failed. Please try again.", request.url))
  }
}
