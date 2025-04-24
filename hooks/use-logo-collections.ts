"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { Database } from "@/lib/database.types"

type Collection = Database["public"]["Tables"]["logo_collections"]["Row"]
type CollectionWithLogos = Collection & { logos: Database["public"]["Tables"]["logos"]["Row"][] }

export function useLogoCollections() {
  const [collections, setCollections] = useState<CollectionWithLogos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setCollections([])
      setIsLoading(false)
      return
    }

    const fetchCollections = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from("logo_collections")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (collectionsError) {
          throw collectionsError
        }

        // For each collection, fetch the logos
        const collectionsWithLogos = await Promise.all(
          (collectionsData || []).map(async (collection) => {
            // Get logo IDs in this collection
            const { data: collectionItems, error: itemsError } = await supabase
              .from("logo_collection_items")
              .select("logo_id")
              .eq("collection_id", collection.id)

            if (itemsError) {
              throw itemsError
            }

            if (!collectionItems || collectionItems.length === 0) {
              return { ...collection, logos: [] }
            }

            // Get the actual logos
            const logoIds = collectionItems.map((item) => item.logo_id)
            const { data: logos, error: logosError } = await supabase.from("logos").select("*").in("id", logoIds)

            if (logosError) {
              throw logosError
            }

            return { ...collection, logos: logos || [] }
          }),
        )

        setCollections(collectionsWithLogos)
      } catch (err) {
        console.error("Error fetching collections:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch collections"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [user, supabase])

  const createCollection = async (name: string, description?: string) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("logo_collections")
        .insert({
          user_id: user.id,
          name,
          description: description || null,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setCollections((prev) => [{ ...data, logos: [] }, ...prev])
      return data
    } catch (err) {
      console.error("Error creating collection:", err)
      throw err
    }
  }

  const addLogoToCollection = async (collectionId: string, logoId: string) => {
    try {
      // Check if the logo is already in the collection
      const { data: existing, error: checkError } = await supabase
        .from("logo_collection_items")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("logo_id", logoId)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      // If already exists, do nothing
      if (existing) return

      // Add to collection
      const { error } = await supabase.from("logo_collection_items").insert({
        collection_id: collectionId,
        logo_id: logoId,
      })

      if (error) {
        throw error
      }

      // Get the logo details
      const { data: logo, error: logoError } = await supabase.from("logos").select("*").eq("id", logoId).single()

      if (logoError) {
        throw logoError
      }

      // Update the collections state
      setCollections((prev) =>
        prev.map((collection) => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              logos: [...collection.logos, logo],
            }
          }
          return collection
        }),
      )
    } catch (err) {
      console.error("Error adding logo to collection:", err)
      throw err
    }
  }

  const removeLogoFromCollection = async (collectionId: string, logoId: string) => {
    try {
      // Optimistically update the UI
      setCollections((prev) =>
        prev.map((collection) => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              logos: collection.logos.filter((logo) => logo.id !== logoId),
            }
          }
          return collection
        }),
      )

      // Remove from the database
      const { error } = await supabase
        .from("logo_collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("logo_id", logoId)

      if (error) {
        throw error
      }
    } catch (err) {
      console.error("Error removing logo from collection:", err)
      throw err
    }
  }

  const deleteCollection = async (collectionId: string) => {
    try {
      // Optimistically update the UI
      setCollections((prev) => prev.filter((c) => c.id !== collectionId))

      // First delete all items in the collection
      const { error: itemsError } = await supabase
        .from("logo_collection_items")
        .delete()
        .eq("collection_id", collectionId)

      if (itemsError) {
        throw itemsError
      }

      // Then delete the collection itself
      const { error } = await supabase.from("logo_collections").delete().eq("id", collectionId).eq("user_id", user?.id)

      if (error) {
        throw error
      }
    } catch (err) {
      console.error("Error deleting collection:", err)
      throw err
    }
  }

  return {
    collections,
    isLoading,
    error,
    createCollection,
    addLogoToCollection,
    removeLogoFromCollection,
    deleteCollection,
  }
}
