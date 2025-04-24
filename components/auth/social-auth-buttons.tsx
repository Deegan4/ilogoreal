"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { Github, Loader2, Mail } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface SocialAuthButtonsProps {
  onEmailClick?: () => void
  className?: string
}

export function SocialAuthButtons({ onEmailClick, className }: SocialAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState<{
    google: boolean
    github: boolean
  }>({
    google: false,
    github: false,
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setIsLoading((prev) => ({ ...prev, [provider]: true }))

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // The user will be redirected to the provider's authentication page
      // No need to handle success here as the callback will handle it
    } catch (error) {
      console.error(`${provider} login error:`, error)
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with provider",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading.google || isLoading.github}
        onClick={() => handleSocialLogin("google")}
        className="flex items-center justify-center gap-2"
      >
        {isLoading.google ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Image src="/images/google-logo.svg" alt="Google" width={16} height={16} />
        )}
        Continue with Google
      </Button>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading.google || isLoading.github}
        onClick={() => handleSocialLogin("github")}
        className="flex items-center justify-center gap-2"
      >
        {isLoading.github ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
        Continue with GitHub
      </Button>

      {onEmailClick && (
        <Button
          variant="outline"
          type="button"
          onClick={onEmailClick}
          className="flex items-center justify-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Continue with Email
        </Button>
      )}
    </div>
  )
}
