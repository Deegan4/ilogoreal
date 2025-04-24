import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

/**
 * Creates a Supabase client for server components
 * Note: We don't use Singleton pattern here because server components
 * are executed per-request and don't share state between requests
 */
export const createClient = () => {
  try {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
      // Use the same storage key as the client-side for consistency
      storageKey: "ilogo-auth-storage",
    })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    throw new Error("Failed to initialize server Supabase client")
  }
}
