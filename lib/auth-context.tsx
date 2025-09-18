"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id?: string
  user_id?: string
  age?: string
  sex?: string
  ethnicity?: string
  height?: string
  weight?: string
  lifestyle?: {
    exercise?: string
    diet?: string
    smoking?: string
    alcohol?: string
    sleep?: string
    stress?: string
  }
  fasting_status?: string
  units?: string
  reference_set?: string
  medications?: string[]
  medical_conditions?: string[]
}

interface User {
  id: string
  email: string
  user_metadata?: any
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  error: string | null
  updateProfile: (profileData: UserProfile) => Promise<boolean>
  loadProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    try {
      // Check if required environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("[v0] Supabase environment variables not found, running in offline mode")
        setLoading(false)
        return
      }

      const client = createClient()
      setSupabase(client)
      console.log("[v0] Supabase client created successfully")
    } catch (err) {
      console.error("[v0] Failed to create Supabase client:", err)
      setError("Authentication service unavailable")
      setLoading(false)
      return
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata,
          }
          setUser(userData)
          setIsAuthenticated(true)
        }
        setError(null)
      } catch (err) {
        console.error("Failed to get session:", err)
        setError("Failed to get session")
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser((prevUser) => {
            const userData = {
              id: session.user.id,
              email: session.user.email!,
              user_metadata: session.user.user_metadata,
              // Preserve existing profile if it exists
              profile: prevUser?.profile,
            }
            return userData
          })
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
        setError(null)
      } catch (err) {
        console.error("Auth state change error:", err)
        setError("Authentication error")
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (user?.id && isAuthenticated && supabase) {
      loadProfile()
    }
  }, [user?.id, isAuthenticated, supabase])

  const loadProfile = async () => {
    if (!user?.id || !supabase) return

    try {
      console.log("[v0] Loading profile for user:", user.id)

      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      console.log("[v0] Profile query result:", { data, error })

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned - this is fine, user just doesn't have a profile yet
          console.log("[v0] No profile found for user, this is normal for new users")
          return
        } else {
          console.error("Error loading profile:", error.message)
          // Don't set error state for profile loading issues, just log them
          return
        }
      }

      if (data) {
        console.log("[v0] Profile loaded successfully:", data)
        setUser((prev) => (prev ? { ...prev, profile: data } : null))
      }
    } catch (err) {
      console.error("Failed to load profile:", err)
      // Don't set error state, just log the issue
    }
  }

  const updateProfile = async (profileData: UserProfile): Promise<boolean> => {
    if (!user?.id || !supabase) return false

    try {
      console.log("[v0] Updating profile for user:", user.id, profileData)

      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      let error
      if (existingProfile) {
        // Profile exists, use UPDATE
        const result = await supabase
          .from("user_profiles")
          .update({
            age: profileData.age,
            sex: profileData.sex,
            ethnicity: profileData.ethnicity,
            height: profileData.height,
            weight: profileData.weight,
            lifestyle: profileData.lifestyle || {},
            fasting_status: profileData.fasting_status,
            units: profileData.units,
            reference_set: profileData.reference_set,
            medications: profileData.medications || [],
            medical_conditions: profileData.medical_conditions || [],
          })
          .eq("user_id", user.id)

        error = result.error
      } else {
        // Profile doesn't exist, use INSERT
        const result = await supabase.from("user_profiles").insert({
          user_id: user.id,
          age: profileData.age,
          sex: profileData.sex,
          ethnicity: profileData.ethnicity,
          height: profileData.height,
          weight: profileData.weight,
          lifestyle: profileData.lifestyle || {},
          fasting_status: profileData.fasting_status,
          units: profileData.units,
          reference_set: profileData.reference_set,
          medications: profileData.medications || [],
          medical_conditions: profileData.medical_conditions || [],
        })

        error = result.error
      }

      if (error) {
        console.error("Error updating profile:", error)
        setError(error.message)
        return false
      }

      console.log("[v0] Profile updated successfully, reloading...")

      setUser((prev) =>
        prev
          ? {
              ...prev,
              profile: {
                ...profileData,
                user_id: user.id,
              },
            }
          : null,
      )

      await loadProfile()
      setError(null)

      console.log("[v0] Profile state updated")
      return true
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError("Failed to update profile")
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        setError(error.message)
        return false
      }

      setError(null)
      return true
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to sign in")
      return false
    }
  }

  const signup = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        console.error("Signup error:", error.message)
        setError(error.message)
        return false
      }

      setError(null)
      return true
    } catch (error) {
      console.error("Signup error:", error)
      setError("Failed to sign up")
      return false
    }
  }

  const logout = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      setError(null)
    } catch (error) {
      console.error("Logout error:", error)
      setError("Failed to sign out")
    }
  }

  if (!supabase && !error) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          login: async () => false,
          signup: async () => false,
          logout: () => {},
          loading: false,
          error: "Authentication service unavailable",
          updateProfile: async () => false,
          loadProfile: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  if (loading) {
    return <div>Loading authentication...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        loading,
        error,
        updateProfile,
        loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
