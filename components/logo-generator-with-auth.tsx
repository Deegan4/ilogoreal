"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useUserLogos } from "@/hooks/use-user-logos"
import { LogoGenerator } from "@/components/logo-generator"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { UsageLimits } from "@/components/usage-limits"
import { PricingDialog } from "@/components/pricing-dialog"
import { checkDailyGenerationLimit, trackLogoGeneration } from "@/lib/usage-limits"

export function LogoGeneratorWithAuth({ demoMode }: { demoMode: boolean }) {
  const { user } = useAuth()
  const { addLogo } = useUserLogos()
  const { toast } = useToast()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false)
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("")
  const [canGenerate, setCanGenerate] = useState(true)

  // Check usage limits when component mounts or user changes
  useEffect(() => {
    const checkLimits = async () => {
      if (demoMode) {
        setCanGenerate(true)
        return
      }

      const { canGenerate } = await checkDailyGenerationLimit(user)
      setCanGenerate(canGenerate)

      if (!canGenerate && user) {
        toast({
          variant: "destructive",
          title: "Daily limit reached",
          description: "You've reached your daily logo generation limit. Upgrade your plan or try again tomorrow.",
        })
      }
    }

    checkLimits()
  }, [user, demoMode, toast])

  const handleLogoGenerated = (svg: string, prompt: string) => {
    setGeneratedSvg(svg)
    setGeneratedPrompt(prompt)

    // Track the generation
    if (user && !demoMode) {
      trackLogoGeneration(user, prompt, "completed")
    }
  }

  const handleGenerationError = (prompt: string, error: string) => {
    // Track the failed generation
    if (user && !demoMode) {
      trackLogoGeneration(user, prompt, "failed", error)
    }
  }

  const handleSaveLogo = async (prompt: string, svg: string) => {
    if (!user) {
      // If not logged in, prompt to sign in
      setAuthDialogOpen(true)
      return
    }

    try {
      await addLogo(prompt, svg)
      toast({
        title: "Logo saved",
        description: "Your logo has been saved to your account.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving logo",
        description: "There was an error saving your logo. Please try again.",
      })
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <LogoGenerator
            demoMode={demoMode}
            onLogoGenerated={handleLogoGenerated}
            onGenerationError={handleGenerationError}
            onSaveLogo={handleSaveLogo}
            disabled={!canGenerate && !demoMode}
          />
        </div>

        <div className="space-y-6">
          <UsageLimits onUpgrade={() => setPricingDialogOpen(true)} />

          {!user && generatedSvg && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="mb-2">Sign in to save your logos and access them anytime</p>
              <Button onClick={() => setAuthDialogOpen(true)}>Sign In</Button>
            </div>
          )}
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <PricingDialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen} />
    </div>
  )
}
