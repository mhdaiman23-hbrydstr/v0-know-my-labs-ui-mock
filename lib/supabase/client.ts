import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    throw new Error("Missing Supabase environment variables. Please check your project settings.")
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
