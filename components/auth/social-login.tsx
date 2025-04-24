"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SocialLoginButtons } from "./social-login-buttons"

export function SocialLogin() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error("Social login error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-2">
      <SocialLoginButtons
        onGoogleClick={() => handleSocialLogin("google")}
        onGithubClick={() => handleSocialLogin("github")}
        isLoading={isLoading}
      />
      {error && <div className="text-sm text-red-500 text-center">{error}</div>}
    </div>
  )
}
