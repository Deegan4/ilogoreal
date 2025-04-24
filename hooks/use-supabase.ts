"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

/**
 * Custom hook to access the Supabase client
 * This ensures we're using the singleton instance throughout the app
 */
export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get the singleton client
    const supabase = createClient()
    setClient(supabase)
    setIsLoading(false)
  }, [])

  return { supabase: client, isLoading }
}
