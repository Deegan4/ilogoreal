"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient, clearSupabaseClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  supabase: SupabaseClient<Database> | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, options?: { fullName?: string }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const router = useRouter()

  // Initialize the Supabase client once
  useEffect(() => {
    let isMounted = true

    const initializeSupabase = async () => {
      try {
        // Get the singleton client
        const client = createClient()

        if (isMounted) {
          setSupabase(client)
        }
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error)
        // Set an initialization error state that can be used in the UI
        if (isMounted) {
          setIsLoading(false)
          // We're not setting the user or session here, so they remain null
        }
      }
    }

    initializeSupabase()

    return () => {
      isMounted = false
    }
  }, [])

  // Initialize the auth state once we have the Supabase client
  useEffect(() => {
    if (!supabase) return

    let isMounted = true

    const initializeAuth = async () => {
      try {
        setIsLoading(true)

        // Get the current session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          return
        }

        if (currentSession && isMounted) {
          setSession(currentSession)
          setUser(currentSession.user)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession)
        setUser(newSession?.user || null)
        router.refresh()
      }
    })

    // Clean up the subscription
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Auth methods
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase client not initialized") }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (data?.user) {
          setUser(data.user)
        }

        return { error }
      } catch (error) {
        console.error("Sign in error:", error)
        return { error: error as Error }
      }
    },
    [supabase],
  )

  const signUp = useCallback(
    async (email: string, password: string, options?: { fullName?: string }) => {
      if (!supabase) return { error: new Error("Supabase client not initialized") }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: options?.fullName,
            },
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
          },
        })

        if (data?.user) {
          setUser(data.user)
        }

        return { error }
      } catch (error) {
        console.error("Sign up error:", error)
        return { error: error as Error }
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        return
      }

      setUser(null)
      setSession(null)

      // Clear the Supabase client to ensure a fresh instance on next login
      clearSupabaseClient()

      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }, [supabase, router])

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) return { error: new Error("Supabase client not initialized") }

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
        })

        return { error }
      } catch (error) {
        console.error("Reset password error:", error)
        return { error: error as Error }
      }
    },
    [supabase],
  )

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) return { error: new Error("Supabase client not initialized") }

      try {
        const { data, error } = await supabase.auth.updateUser({
          password,
        })

        if (data?.user) {
          setUser(data.user)
        }

        return { error }
      } catch (error) {
        console.error("Update password error:", error)
        return { error: error as Error }
      }
    },
    [supabase],
  )

  const updateProfile = useCallback(
    async (data: { fullName?: string; avatarUrl?: string }) => {
      if (!supabase) return { error: new Error("Supabase client not initialized") }

      try {
        const { data: userData, error } = await supabase.auth.updateUser({
          data: {
            full_name: data.fullName,
            avatar_url: data.avatarUrl,
          },
        })

        if (userData?.user) {
          setUser(userData.user)
        }

        return { error }
      } catch (error) {
        console.error("Update profile error:", error)
        return { error: error as Error }
      }
    },
    [supabase],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      supabase,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
    }),
    [user, session, isLoading, supabase, signIn, signUp, signOut, resetPassword, updatePassword, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    console.warn("useAuth must be used within an AuthProvider")
    // Return a default value instead of throwing an error
    return {
      user: null,
      session: null,
      isLoading: true,
      supabase: null,
      signIn: async () => ({ error: new Error("Auth context not available") }),
      signUp: async () => ({ error: new Error("Auth context not available") }),
      signOut: async () => {},
      resetPassword: async () => ({ error: new Error("Auth context not available") }),
      updatePassword: async () => ({ error: new Error("Auth context not available") }),
      updateProfile: async () => ({ error: new Error("Auth context not available") }),
    }
  }

  return context
}
