"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLabTest } from "@/lib/lab-test-context"

export default function DashboardIdPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [labData, setLabData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // For now, just redirect to the main dashboard
    // In a real implementation, this would fetch the specific lab set by ID
    router.push('/dashboard')
  }, [router])
  
  // Show loading state while redirecting
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading your lab results...</p>
      </div>
    )
  }
  
  // Show error if any
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }
  
  // This should never render as we're redirecting
  return null
}
