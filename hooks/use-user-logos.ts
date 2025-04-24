"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { Database } from "@/lib/database.types"

type Logo = Database["public"]["Tables"]["logos"]["Row"]

export function useUserLogos() {
  const [logos, setLogos] = useState<Logo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLogos([])
      setIsLoading(false)
      return
    }

    const fetchLogos = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("logos")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setLogos(data || [])
      } catch (err) {
        console.error("Error fetching logos:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch logos"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogos()
  }, [user, supabase])

  const addLogo = async (prompt: string, svgContent: string) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("logos")
        .insert({
          user_id: user.id,
          prompt,
          svg_content: svgContent,
          is_favorite: false,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setLogos((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error("Error adding logo:", err)
      throw err
    }
  }

  const toggleFavorite = async (logoId: string) => {
    try {
      // Find the logo to toggle
      const logo = logos.find((l) => l.id === logoId)
      if (!logo) return

      // Optimistically update the UI
      setLogos((prev) => prev.map((l) => (l.id === logoId ? { ...l, is_favorite: !l.is_favorite } : l)))

      // Update in the database
      const { error } = await supabase
        .from("logos")
        .update({ is_favorite: !logo.is_favorite, updated_at: new Date().toISOString() })
        .eq("id", logoId)
        .eq("user_id", user?.id)

      if (error) {
        throw error
      }
    } catch (err) {
      // Revert the optimistic update on error
      setLogos((prev) => [...prev])
      console.error("Error toggling favorite:", err)
      throw err
    }
  }

  const deleteLogo = async (logoId: string) => {
    try {
      // Optimistically update the UI
      setLogos((prev) => prev.filter((l) => l.id !== logoId))

      // Delete from the database
      const { error } = await supabase.from("logos").delete().eq("id", logoId).eq("user_id", user?.id)

      if (error) {
        throw error
      }
    } catch (err) {
      // Revert the optimistic update on error
      console.error("Error deleting logo:", err)
      throw err
    }
  }

  return {
    logos,
    isLoading,
    error,
    addLogo,
    toggleFavorite,
    deleteLogo,
  }
}
