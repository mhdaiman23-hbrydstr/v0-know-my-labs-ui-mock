"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  FileText,
  Lightbulb,
  MessageCircleQuestion,
  Activity,
  User,
  Calendar,
  Printer,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface LabResult {
  id: string
  marker: string
  value: number
  unit: string
  value_si?: number
  unit_si?: string
  panel: string
  confidence?: number
  reference_range?: string
}

interface Demographics {
  age: string
  sex: string
  ethnicity?: string
  fastingStatus?: string
  medicalConditions?: string[]
  medications?: string[]
  lifestyle?: Record<string, string>
}

interface InterpretationResults {
  summary: string
  flags: Array<{
    marker: string
    name?: string
    severity: string
    rationale: string
  }>
  considerations: string[]
  lifestyle: string[]
  questionsForDoctor: string[]
}

export default function ResultsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [demographics, setDemographics] = useState<Demographics | null>(null)
  const [interpretationResults, setInterpretationResults] = useState<InterpretationResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSignInDialog, setShowSignInDialog] = useState(false)

  useEffect(() => {
    const loadDataAndInterpret = async () => {
      try {
        // Load lab results from session storage
        const storedLabs = sessionStorage.getItem("reviewedLabs")
        const storedDemographics = sessionStorage.getItem("demographics")

        if (!storedLabs) {
          router.push("/upload")
          return
        }

        const labs: LabResult[] = JSON.parse(storedLabs)
        const demo: Demographics = storedDemographics ? JSON.parse(storedDemographics) : {}

        setLabResults(labs)
        setDemographics(demo)
        setIsLoading(false)

        // Call interpret API
        setIsInterpreting(true)
        const payload = {
          demographics: {
            sex:
              demo.sex?.toLowerCase() === "male"
                ? "male"
                : demo.sex?.toLowerCase() === "female"
                  ? "female"
                  : "unspecified",
            ageYears: Number.parseInt(demo.age) || 30,
            ethnicity: demo.ethnicity || undefined,
            units: "SI" as const,
            fasting: demo.fastingStatus === "fasting",
            testDate: new Date().toISOString().split("T")[0],
          },
          context: {
            conditions: demo.medicalConditions || [],
            medications: demo.medications || [],
            lifestyle: demo.lifestyle ? Object.entries(demo.lifestyle).map(([key, value]) => `${key}: ${value}`) : [],
          },
          labs: labs
            .map((lab, index) => ({
              panel: lab.panel || "General",
              code: lab.id || `LAB_${index}`,
              name: lab.marker,
              value_si: Number.parseFloat(String(lab.value_si || lab.value)) || 0,
              unit_si: String(lab.unit_si || lab.unit),
            }))
            .filter((lab) => lab.name && !isNaN(lab.value_si)),
        }

        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          const results = await response.json()
          setInterpretationResults(results)
        } else {
          throw new Error("Failed to get interpretation")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsInterpreting(false)
      }
    }

    loadDataAndInterpret()
  }, [router])

  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowSignInDialog(true)
      return
    }

    if (!labResults.length || !demographics || !interpretationResults) {
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        demographics,
        source: "manual_upload",
        panels: [...new Set(labResults.map((lab) => lab.panel))],
        collected_at: new Date().toISOString(),
        lab_results: labResults,
        interpretation: interpretationResults,
      }

      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const { lab_set_id } = await response.json()
        router.push(`/dashboard/${lab_set_id}`)
      } else {
        throw new Error("Failed to save results")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save results")
    } finally {
      setIsSaving(false)
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg border space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-10 w-full mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const getFlagBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "note":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    }
  }

  const getFlagIcon = (severity: string) => {
    switch (severity) {
      case "high":
      case "critical":
        return TrendingUp
      case "low":
        return TrendingDown
      case "note":
        return Info
      default:
        return Activity
    }
  }

  const getResultColor = (result: LabResult) => {
    if (!result.reference_range) return "text-foreground"

    // Simple logic - could be enhanced with proper range parsing
    const value = result.value_si || result.value
    if (value > 100) return "text-red-600 dark:text-red-400" // High
    if (value < 10) return "text-yellow-600 dark:text-yellow-400" // Low
    return "text-green-600 dark:text-green-400" // Normal
  }

  const groupedResults = labResults.reduce(
    (acc, result) => {
      const panel = result.panel || "General"
      if (!acc[panel]) acc[panel] = []
      acc[panel].push(result)
      return acc
    },
    {} as Record<string, LabResult[]>,
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Error Loading Results</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!labResults.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">No Lab Results Found</h1>
            <p className="text-muted-foreground">Please upload and review your lab results first.</p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <Activity className="mr-2 h-4 w-4" />
              Upload Lab Results
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-xl font-semibold">KnowMyLabs</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Marker Glossary
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link href="/signin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Button asChild size="sm" className="ml-2">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-balance">Your Lab Results Analysis</h1>
                <p className="text-muted-foreground text-pretty">
                  {isInterpreting
                    ? "Analyzing your results..."
                    : "Personalized insights based on your profile. Remember, this is for educational purposes only."}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>{isAuthenticated && user?.email ? user.email : "Guest User"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Test Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Important Disclaimer */}
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Medical Disclaimer:</strong> This analysis is for educational purposes only and is not
                medical advice. Always consult with qualified healthcare professionals for medical decisions and
                interpretation of your lab results.
              </AlertDescription>
            </Alert>

            {/* Save Button */}
            <div className="flex justify-end mb-6">
              <Button onClick={handleSave} disabled={isSaving || isInterpreting}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isAuthenticated ? "Save Results" : "Sign In to Save"}
              </Button>
            </div>
          </div>

          {isInterpreting ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Main Content Layout */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Highlights and Lab Results */}
                <div className="lg:col-span-1 space-y-6">
                  {interpretationResults && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Key Flags
                        </CardTitle>
                        <CardDescription>Markers that may need attention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {interpretationResults.flags?.map((flag, index) => {
                          const IconComponent = getFlagIcon(flag.severity)
                          return (
                            <div key={index} className="p-3 rounded-lg border bg-card/50 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{flag.name || flag.marker}</span>
                                </div>
                                <Badge className={getFlagBadgeColor(flag.severity)}>{flag.severity}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <p>{flag.rationale}</p>
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Lab Results by Panel</CardTitle>
                      <CardDescription>Your test values with confidence scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue={Object.keys(groupedResults)[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          {Object.keys(groupedResults)
                            .slice(0, 2)
                            .map((panel) => (
                              <TabsTrigger key={panel} value={panel} className="text-xs">
                                {panel}
                              </TabsTrigger>
                            ))}
                        </TabsList>
                        {Object.entries(groupedResults).map(([panel, results]) => (
                          <TabsContent key={panel} value={panel} className="space-y-2 mt-4">
                            {results.map((result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded border bg-card/50"
                              >
                                <div>
                                  <div className="text-sm font-medium">{result.marker}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {result.confidence && (
                                      <Badge variant="outline" className="text-xs">
                                        {Math.round(result.confidence * 100)}% confidence
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${getResultColor(result)}`}>
                                    {result.value_si || result.value} {result.unit_si || result.unit}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>

                  {interpretationResults && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Personalized Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{interpretationResults.summary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {!isAuthenticated && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Heart className="h-5 w-5 text-primary" />
                          Save Your Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Create an account to save your results, track changes over time, and get more personalized
                          insights.
                        </p>
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="flex-1">
                            <Link href="/signup">Sign Up</Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Link href="/signin">Sign In</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Detailed Tabs */}
                <div className="lg:col-span-2">
                  <Tabs defaultValue="summary" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="summary" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="considerations" className="flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        Considerations
                      </TabsTrigger>
                      <TabsTrigger value="lifestyle" className="flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Lifestyle
                      </TabsTrigger>
                      <TabsTrigger value="questions" className="flex items-center gap-1">
                        <MessageCircleQuestion className="h-4 w-4" />
                        Questions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Detailed Summary</CardTitle>
                          <CardDescription>Human-friendly explanations personalized for you</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {interpretationResults.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="considerations" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personalized Considerations</CardTitle>
                          <CardDescription>
                            Areas that might benefit from attention based on your profile
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3 text-sm">
                            {interpretationResults.considerations?.map((consideration, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <div>{consideration}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="lifestyle" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personalized Lifestyle Suggestions</CardTitle>
                          <CardDescription>
                            Tailored recommendations based on your profile (not medical advice)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3 text-sm">
                            {interpretationResults.lifestyle?.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <div>{suggestion}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Questions to Ask Your Doctor</CardTitle>
                          <CardDescription>Prepare for your next appointment</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3 text-sm">
                            {interpretationResults.questionsForDoctor?.map((question, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <MessageCircleQuestion className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>{question}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/review">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Review
              </Link>
            </Button>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <>
                  <Button onClick={() => window.print()} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Results
                  </Button>
                  <Button asChild>
                    <Link href="/upload">
                      <Activity className="mr-2 h-4 w-4" />
                      Start New Analysis
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/upload">
                      <Activity className="mr-2 h-4 w-4" />
                      Start New Analysis
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>You need to sign in to save your lab results and access them later.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button asChild className="flex-1">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Always consult with qualified healthcare professionals</strong> for medical advice and treatment
            decisions. This analysis is for educational purposes only and is not a substitute for professional medical
            consultation.
          </p>
        </div>
      </footer>
    </div>
  )
}
