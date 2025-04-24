"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { checkDailyGenerationLimit, PLAN_LIMITS, type PlanType, getUserPlan } from "@/lib/usage-limits"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button-custom"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface UsageLimitsProps {
  onUpgrade?: () => void
}

export function UsageLimits({ onUpgrade }: UsageLimitsProps) {
  const { user } = useAuth()
  const [usageData, setUsageData] = useState<{
    canGenerate: boolean
    limit: number
    used: number
    remaining: number
  } | null>(null)
  const [plan, setPlan] = useState<PlanType>("free")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsageData = async () => {
      setIsLoading(true)
      try {
        const data = await checkDailyGenerationLimit(user)
        setUsageData(data)

        if (user) {
          const userPlan = await getUserPlan(user)
          setPlan(userPlan)
        }
      } catch (error) {
        console.error("Error fetching usage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [user])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Limits</CardTitle>
          <CardDescription>Loading your usage data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!usageData) {
    return null
  }

  const percentage = Math.round((usageData.used / usageData.limit) * 100)
  const planDetails = PLAN_LIMITS[plan]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your {planDetails.name} Plan</CardTitle>
            <CardDescription>Daily logo generation usage</CardDescription>
          </div>
          {plan === "free" && onUpgrade && (
            <Button size="sm" onClick={onUpgrade}>
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {usageData.used} / {usageData.limit} logos generated today
            </span>
            <span>{usageData.remaining} remaining</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {!usageData.canGenerate && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Daily limit reached</p>
              <p className="text-sm">
                You've reached your daily logo generation limit. Upgrade your plan or try again tomorrow.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full space-y-2">
          <h4 className="text-sm font-medium">Plan Features:</h4>
          <ul className="space-y-1">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}
