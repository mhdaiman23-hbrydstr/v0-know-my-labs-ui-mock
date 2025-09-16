import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase credentials are missing, skip auth middleware
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase credentials missing in middleware, skipping auth")
    return supabaseResponse
  }

  try {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect dashboard, profile, settings routes, and API endpoints
    const protectedPrefixes = ["/dashboard", "/profile", "/settings", "/api/save"]
    const isProtectedRoute = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))

    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/signin"
      url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    return supabaseResponse
  } catch (error) {
    console.log("[v0] Supabase middleware error:", error)

    // For protected routes and API endpoints, redirect to signin when Supabase fails
    const protectedPrefixes = ["/dashboard", "/profile", "/settings", "/api/save"]
    const isProtectedRoute = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))

    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/signin"
      url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }

    // For other routes, continue without auth
    return supabaseResponse
  }
}
