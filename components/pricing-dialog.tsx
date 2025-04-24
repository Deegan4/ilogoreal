"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PLAN_LIMITS, type PlanType } from "@/lib/usage-limits"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSelectPlan = (plan: PlanType) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan",
      })
      return
    }

    setSelectedPlan(plan)
  }

  const handleUpgrade = async () => {
    if (!selectedPlan) return

    setIsLoading(true)

    try {
      // In a real app, this would call your payment processing API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Plan upgraded",
        description: `You've successfully upgraded to the ${selectedPlan} plan`,
      })

      onOpenChange(false)
      router.push("/dashboard") // Redirect to dashboard after upgrade
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upgrade failed",
        description: "There was an error upgrading your plan. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a Plan</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
            <Card key={key} className={`overflow-hidden ${selectedPlan === key ? "ring-2 ring-primary" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {key === "free"
                    ? "Free plan"
                    : key === "basic"
                      ? "$9.99/month"
                      : key === "pro"
                        ? "$19.99/month"
                        : "$49.99/month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <ul className="space-y-1">
                  <li className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{plan.logoGenerationsPerDay} logos per day</span>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{plan.logoGenerationsPerMonth} logos per month</span>
                  </li>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={key === "free" ? "outline" : "default"}
                  onClick={() => handleSelectPlan(key as PlanType)}
                  disabled={isLoading}
                >
                  {key === "free" ? "Current Plan" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedPlan && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleUpgrade} disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
