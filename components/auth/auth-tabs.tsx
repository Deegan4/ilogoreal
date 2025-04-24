"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedSignInForm } from "./enhanced-sign-in-form"
import { EnhancedSignUpForm } from "./enhanced-sign-up-form"
import { SocialAuthButtons } from "./social-auth-buttons"

interface AuthTabsProps {
  defaultTab?: "signin" | "signup"
  redirectUrl?: string
  onSuccess?: () => void
}

export function AuthTabs({ defaultTab = "signin", redirectUrl, onSuccess }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab)
  const [showEmailForm, setShowEmailForm] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs
        defaultValue={defaultTab}
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Create Account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          {!showEmailForm ? (
            <>
              <SocialAuthButtons onEmailClick={() => setShowEmailForm(true)} className="mb-6" />

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <EnhancedSignInForm redirectUrl={redirectUrl} onSuccess={onSuccess} />
            </>
          ) : (
            <EnhancedSignInForm
              redirectUrl={redirectUrl}
              onSuccess={onSuccess}
              onBack={() => setShowEmailForm(false)}
            />
          )}
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          {!showEmailForm ? (
            <>
              <SocialAuthButtons onEmailClick={() => setShowEmailForm(true)} className="mb-6" />

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <EnhancedSignUpForm redirectUrl={redirectUrl} onSuccess={onSuccess} />
            </>
          ) : (
            <EnhancedSignUpForm
              redirectUrl={redirectUrl}
              onSuccess={onSuccess}
              onBack={() => setShowEmailForm(false)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
