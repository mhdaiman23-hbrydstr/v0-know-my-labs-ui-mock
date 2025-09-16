"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Home,
  User,
  Calendar,
  Printer,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLabTest } from "@/lib/lab-test-context"
import { useState } from "react"

export default function ResultsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const { labTestData, updateLabTestData } = useLabTest()
  const { interpretationResults } = labTestData
  const [isRetrying, setIsRetrying] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleRetry = async () => {
    if (!labTestData.reviewedLabs || labTestData.reviewedLabs.length === 0) return

    setIsRetrying(true)
    try {
      const payload = {
        demographics: {
          sex:
            labTestData.sex?.toLowerCase() === "male"
              ? "male"
              : labTestData.sex?.toLowerCase() === "female"
                ? "female"
                : "unspecified",
          ageYears: Number.parseInt(labTestData.age) || 30,
          ethnicity: labTestData.ethnicity || undefined,
          units: "SI" as const,
          fasting: labTestData.fastingStatus === "fasting",
          testDate: new Date().toISOString().split("T")[0],
        },
        context: {
          conditions: labTestData.medicalConditions || [],
          medications: labTestData.medications || [],
          lifestyle: labTestData.lifestyle
            ? Object.entries(labTestData.lifestyle).map(([key, value]) => `${key}: ${value}`)
            : [],
        },
        labs: labTestData.reviewedLabs
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
        const newResults = await response.json()
        updateLabTestData({ interpretationResults: newResults })
      }
    } catch (error) {
      console.error("Retry failed:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (!interpretationResults || (interpretationResults && Object.keys(interpretationResults).length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">No Analysis Available</h1>
            <p className="text-muted-foreground">
              We don't have any interpretation results to show. Please start a new analysis or upload a report.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/onboarding">
                <Activity className="mr-2 h-4 w-4" />
                Start New Analysis
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/upload">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Upload a Report
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getFlagBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "low":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      case "note":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
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
                  Personalized insights based on your profile. Remember, this is for educational purposes only.
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>{isAuthenticated && user?.email ? user.email : "Guest User"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Test Date: {labTestData.testDate || new Date().toLocaleDateString()}</span>
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
          </div>

          {/* Main Content Layout */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Highlights */}
            <div className="lg:col-span-1 space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personalized Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{interpretationResults.summary}</p>
                </CardContent>
              </Card>

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
                      <CardDescription>Areas that might benefit from attention based on your profile</CardDescription>
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

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home Page
              </Link>
            </Button>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <>
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Results
                  </Button>
                  <Button asChild>
                    <Link href="/onboarding">
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
                    <Link href="/onboarding">
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
