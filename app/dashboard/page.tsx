"use client"

import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

async function DashboardContent() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/signin?redirect=/dashboard")
  }

  // Fetch lab sets
  const { data: labSets, error: labSetsError } = await supabase
    .from("lab_sets")
    .select(`
      id,
      panels,
      source,
      collected_at,
      created_at,
      demographics
    `)
    .order("created_at", { ascending: false })

  if (labSetsError) {
    console.error("Error fetching lab sets:", labSetsError)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error Loading Lab Results</h2>
        <p className="text-muted-foreground mb-6">We encountered an issue while loading your lab results.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (!labSets || labSets.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Lab Results Found</h2>
        <p className="text-muted-foreground mb-6">You haven't uploaded any lab results yet.</p>
        <Link href="/upload">
          <Button>Upload Your First Labs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {labSets.map((labSet) => (
          <Link href={`/dashboard/${labSet.id}`} key={labSet.id} className="no-underline">
            <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-balance">
                    {labSet.panels && labSet.panels.length > 0
                      ? labSet.panels.map((panel: string) => panel.charAt(0).toUpperCase() + panel.slice(1)).join(", ")
                      : "Lab Results"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {labSet.collected_at
                    ? format(new Date(labSet.collected_at), "MMMM d, yyyy")
                    : format(new Date(labSet.created_at), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Source: {labSet.source || "Unknown"}</div>
                {labSet.demographics && typeof labSet.demographics === "object" && "age" in labSet.demographics && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Age: {(labSet.demographics as any).age}
                    {(labSet.demographics as any).sex && `, Sex: ${(labSet.demographics as any).sex}`}
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Uploaded {formatDistanceToNow(new Date(labSet.created_at), { addSuffix: true })}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Lab Results</h1>
        <Link href="/upload">
          <Button>Upload New Labs</Button>
        </Link>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card className="h-full" key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-3 w-1/3" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
