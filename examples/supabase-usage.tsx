"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/hooks/use-supabase"
import { useAuth } from "@/contexts/auth-context"

export function SupabaseExample() {
  const { supabase, isLoading: isClientLoading } = useSupabase()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Wait for both the client and auth to be ready
    if (isClientLoading || isAuthLoading || !supabase || !user) return

    async function fetchData() {
      try {
        // Use the singleton client
        const { data, error } = await supabase.from("logos").select("*").limit(10)

        if (error) throw error
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
        console.error("Error fetching data:", err)
      }
    }

    fetchData()
  }, [supabase, user, isClientLoading, isAuthLoading])

  if (isClientLoading || isAuthLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return <div>Please sign in to view your logos</div>

  return (
    <div>
      <h2>Your Logos</h2>
      {data && data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.prompt}</li>
          ))}
        </ul>
      ) : (
        <p>No logos found</p>
      )}
    </div>
  )
}
