// Add the dynamic directive to ensure this page is rendered at request time
export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthTabs } from "@/components/auth/auth-tabs"

export default async function SignUpPage() {
  // Check if user is already signed in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there is a session, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthTabs defaultTab="signup" />
    </div>
  )
}
