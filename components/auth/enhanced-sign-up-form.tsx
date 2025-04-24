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
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowLeft, Check, Loader2, Eye, EyeOff, X } from "lucide-react"

interface EnhancedSignUpFormProps {
  redirectUrl?: string
  onSuccess?: () => void
  onBack?: () => void
}

export function EnhancedSignUpForm({ redirectUrl, onSuccess, onBack }: EnhancedSignUpFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0

    let strength = 0

    // Length check
    if (password.length >= 8) strength += 25

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25

    return strength
  }

  const passwordStrength = calculatePasswordStrength(password)

  const getPasswordStrengthText = (): { text: string; color: string } => {
    if (passwordStrength === 0) return { text: "No password", color: "text-muted-foreground" }
    if (passwordStrength <= 25) return { text: "Weak", color: "text-red-500" }
    if (passwordStrength <= 50) return { text: "Fair", color: "text-orange-500" }
    if (passwordStrength <= 75) return { text: "Good", color: "text-yellow-500" }
    return { text: "Strong", color: "text-green-500" }
  }

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Clear errors when inputs change
  useEffect(() => {
    setError(null)
    setFieldErrors({})
  }, [email, password, confirmPassword, fullName, agreeToTerms])

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {}

    if (!fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (passwordStrength < 50) {
      errors.password = "Password is too weak"
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (!agreeToTerms) {
      errors.terms = "You must agree to the terms and privacy policy"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await signUp(email, password, {
        fullName,
        redirectTo: `${window.location.origin}/auth/verification-sent`,
      })

      if (signUpError) {
        console.error("Sign up error:", signUpError)

        if (signUpError.message?.includes("already registered")) {
          setFieldErrors({
            ...fieldErrors,
            email: "This email is already registered. Try signing in instead.",
          })
        } else {
          setError(signUpError.message || "Failed to create account. Please try again.")
        }
        return
      }

      // Success
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/auth/verification-sent")
      }
    } catch (err) {
      console.error("Unexpected sign up error:", err)
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
          Back to all sign up options
        </Button>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
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
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            className={fieldErrors.fullName ? "border-red-500" : ""}
          />
          {fieldErrors.fullName && <p className="text-sm text-red-500">{fieldErrors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={fieldErrors.email ? "border-red-500" : ""}
            autoComplete="email"
          />
          {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <span className={`text-xs ${getPasswordStrengthText().color}`}>{getPasswordStrengthText().text}</span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
              autoComplete="new-password"
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
          {password && <Progress value={passwordStrength} className={`h-1 ${getPasswordStrengthColor()}`} />}
          {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              {password.length >= 8 ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={password.length >= 8 ? "text-green-500" : "text-muted-foreground"}>8+ characters</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {/[A-Z]/.test(password) ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}>
                Uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {/[a-z]/.test(password) ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={/[a-z]/.test(password) ? "text-green-500" : "text-muted-foreground"}>
                Lowercase letter
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span
                className={
                  /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? "text-green-500" : "text-muted-foreground"
                }
              >
                Number or symbol
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className={`pr-10 ${fieldErrors.confirmPassword ? "border-red-500" : ""}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            />
            <Label
              htmlFor="terms"
              className={`text-sm font-medium leading-none ${fieldErrors.terms ? "text-red-500" : ""}`}
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {fieldErrors.terms && <p className="text-sm text-red-500">{fieldErrors.terms}</p>}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
