"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

// Singleton instance
let supabaseClient: SupabaseClient<Database> | null = null
let isInitializing = false
let initializationPromise: Promise<SupabaseClient<Database>> | null = null

/**
 * Creates or returns the existing Supabase client instance
 * Implements the Singleton pattern to ensure only one client exists
 * This ensures only one GoTrueClient instance is created
 */
export const createClient = () => {
  // If client already exists, return it immediately
  if (supabaseClient) {
    return supabaseClient
  }

  // If initialization is in progress, return the promise
  if (isInitializing && initializationPromise) {
    return initializationPromise
  }

  // Start initialization
  isInitializing = true

  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const storageEndpoint = "https://ejwwakfetsaroknowanp.supabase.co/storage/v1/s3"

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase environment variables are missing. Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
      )
    }

    // Create a new client
    const client = createClientComponentClient<Database>({
      supabaseUrl,
      supabaseKey,
      // Use a consistent storage key
      storageKey: "ilogo-auth-storage",
      // Important: Set this to avoid creating multiple auth instances
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            // Add custom headers for storage operations if needed
          },
        },
        // Configure storage with the provided endpoint
        storage: {
          storageUrl: storageEndpoint,
        },
      },
    })

    // Store the client
    supabaseClient = client

    // Return the client
    return client
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    isInitializing = false
    throw error
  }
}

/**
 * Clears the Supabase client instance
 * Should be called when signing out
 */
export const clearSupabaseClient = () => {
  supabaseClient = null
  isInitializing = false
  initializationPromise = null

  // Clear auth data from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("ilogo-auth-storage")
  }
}
