"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"

interface EnhancedSignInFormProps {
  redirectUrl?: string
  onSuccess?: () => void
  onBack?: () => void
}

export function EnhancedSignInForm({ redirectUrl, onSuccess, onBack }: EnhancedSignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()
  const { toast } = useToast()

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError(null)
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Basic validation
      if (!email.trim()) {
        setError("Email is required")
        return
      }

      if (!password) {
        setError("Password is required")
        return
      }

      // Attempt to sign in
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error("Sign in error:", signInError)

        // Provide more specific error messages
        if (signInError.message?.includes("Invalid login")) {
          setError("Invalid email or password. Please try again.")
        } else if (signInError.message?.includes("Email not confirmed")) {
          setError("Your email has not been verified. Please check your inbox for a verification link.")
        } else {
          setError(signInError.message || "Failed to sign in. Please try again.")
        }
        return
      }

      // Success
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      })

      // Store the session in local storage
      localStorage.setItem("supabase.auth.session", JSON.stringify(data?.session))

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(redirectUrl || "/dashboard")
      }
    } catch (err) {
      console.error("Unexpected sign in error:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <Button type="button" variant="ghost" onClick={onBack} className="flex items-center gap-2 p-0 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to all sign in options
        </Button>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
        <p className="text-sm text-muted-foreground">Enter your email and password to sign in</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-11"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-11 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label
            htmlFor="remember-me"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          className="text-sm text-muted-foreground"
          onClick={() => setTroubleshootingOpen(!troubleshootingOpen)}
        >
          Having trouble signing in?
        </Button>
      </div>

      {troubleshootingOpen && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
          <h3 className="font-medium">Troubleshooting Tips:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Make sure your email address is entered correctly</li>
            <li>Check that Caps Lock is not enabled when typing your password</li>
            <li>Clear your browser cache and cookies, then try again</li>
            <li>Try using a different browser or device</li>
            <li>If you've forgotten your password, use the "Forgot password?" link</li>
            <li>Check your email for a verification link if you recently signed up</li>
          </ul>
          <p className="pt-2">
            Still having issues?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
