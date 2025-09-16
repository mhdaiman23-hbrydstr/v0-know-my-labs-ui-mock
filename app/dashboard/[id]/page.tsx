import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeftIcon } from "lucide-react"
import { LabResultsDetail } from "../components/lab-results-detail"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    id: string
  }
}

async function LabSetContent({ id }: { id: string }) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/signin?redirect=/dashboard")
  }

  // Verify the lab set exists and belongs to the user
  const { data: labSet, error: labSetError } = await supabase
    .from("lab_sets")
    .select("id, user_id")
    .eq("id", id)
    .single()

  if (labSetError) {
    console.error("Error fetching lab set:", labSetError)
    if (labSetError.code === "PGRST116") {
      // No rows returned - lab set doesn't exist
      notFound()
    }
    throw new Error("Failed to load lab set")
  }

  // Verify ownership
  if (labSet.user_id !== user.id) {
    console.log("User attempted to access lab set they don't own:", {
      userId: user.id,
      labSetUserId: labSet.user_id,
      labSetId: id,
    })
    notFound()
  }

  return <LabResultsDetail labSetId={id} />
}

function LabSetSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Patient info cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-4 w-18" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-28 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-16 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      </div>

      {/* Lab results skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interpretation skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LabSetPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Lab Results Detail</h1>
        </div>
      </div>

      <Suspense fallback={<LabSetSkeleton />}>
        <LabSetContent id={params.id} />
      </Suspense>
    </div>
  )
}
