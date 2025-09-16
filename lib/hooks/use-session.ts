"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User, AuthError } from "@supabase/supabase-js"

interface UseSessionReturn {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: AuthError | null
  signOut: () => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Error getting initial session:", error)
          setError(error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error("[v0] Unexpected error getting session:", err)
        setError(err as AuthError)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event, session?.user?.id)

      setSession(session)
      setUser(session?.user ?? null)
      setError(null)

      // Only set loading to false after initial session is loaded
      if (event === "INITIAL_SESSION") {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async (): Promise<void> => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[v0] Error signing out:", error)
        setError(error)
        throw error
      }

      console.log("[v0] Successfully signed out")
    } catch (err) {
      console.error("[v0] Unexpected error during sign out:", err)
      const authError = err as AuthError
      setError(authError)
      throw authError
    }
  }

  return {
    session,
    user,
    isLoading,
    error,
    signOut,
  }
}
