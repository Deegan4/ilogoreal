import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthTabs } from "@/components/auth/auth-tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string }
}) {
  // Check if user is already signed in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there is a session, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  const error = searchParams.error
  const redirectTo = searchParams.redirectTo

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      {error && (
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthTabs defaultTab="signin" redirectUrl={redirectTo} />
    </div>
  )
}
