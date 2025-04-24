import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Define plan limits
export const PLAN_LIMITS = {
  free: {
    name: "Free",
    logoGenerationsPerDay: 3,
    logoGenerationsPerMonth: 20,
    maxExports: 5,
    maxCollections: 3,
    features: ["Basic logo generation", "SVG downloads", "3 logos per day"],
  },
  basic: {
    name: "Basic",
    logoGenerationsPerDay: 10,
    logoGenerationsPerMonth: 100,
    maxExports: 20,
    maxCollections: 10,
    features: ["Advanced logo generation", "PNG/JPG exports", "10 logos per day", "Logo collections"],
  },
  pro: {
    name: "Pro",
    logoGenerationsPerDay: 50,
    logoGenerationsPerMonth: 500,
    maxExports: 100,
    maxCollections: 50,
    features: [
      "Premium logo generation",
      "Unlimited exports",
      "50 logos per day",
      "Advanced customization",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    logoGenerationsPerDay: 200,
    logoGenerationsPerMonth: 2000,
    maxExports: 500,
    maxCollections: 200,
    features: [
      "Enterprise logo generation",
      "Unlimited exports",
      "200 logos per day",
      "Team collaboration",
      "Dedicated support",
    ],
  },
}

export type PlanType = keyof typeof PLAN_LIMITS

// Get user's current plan
export async function getUserPlan(user: User | null): Promise<PlanType> {
  if (!user) return "free"

  // In a real app, you would fetch the user's plan from your database
  // For now, we'll just return "free" for all users
  return "free"
}

// Check if user has reached their daily generation limit
export async function checkDailyGenerationLimit(user: User | null): Promise<{
  canGenerate: boolean
  limit: number
  used: number
  remaining: number
}> {
  if (!user) {
    // For non-authenticated users, use the free plan limits
    return {
      canGenerate: true,
      limit: PLAN_LIMITS.free.logoGenerationsPerDay,
      used: 0,
      remaining: PLAN_LIMITS.free.logoGenerationsPerDay,
    }
  }

  const plan = await getUserPlan(user)
  const limit = PLAN_LIMITS[plan].logoGenerationsPerDay

  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0]

  // Query the database for today's generation count
  const supabase = createClient()
  const { count, error } = await supabase
    .from("logo_generation_history")
    .select("*", { count: "exact", head: false })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59`)

  if (error) {
    console.error("Error checking generation limit:", error)
    // If there's an error, we'll allow generation to be safe
    return {
      canGenerate: true,
      limit,
      used: 0,
      remaining: limit,
    }
  }

  const used = count || 0
  const remaining = Math.max(0, limit - used)

  return {
    canGenerate: remaining > 0,
    limit,
    used,
    remaining,
  }
}

// Track a new logo generation
export async function trackLogoGeneration(
  user: User | null,
  prompt: string,
  status: "completed" | "failed",
  errorMessage?: string,
) {
  if (!user) return

  const supabase = createClient()

  // Add a record to the logo_generation_history table
  const { error } = await supabase.from("logo_generation_history").insert({
    user_id: user.id,
    prompt,
    status,
    error_message: errorMessage || null,
  })

  if (error) {
    console.error("Error tracking logo generation:", error)
  }
}
