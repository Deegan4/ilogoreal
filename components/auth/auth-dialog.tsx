"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AuthTabs } from "./auth-tabs"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "signin" | "signup"
  redirectUrl?: string
}

export function AuthDialog({ open, onOpenChange, defaultTab = "signin", redirectUrl }: AuthDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <AuthTabs defaultTab={defaultTab} redirectUrl={redirectUrl} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
