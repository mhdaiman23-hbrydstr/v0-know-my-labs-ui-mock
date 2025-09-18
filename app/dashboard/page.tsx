"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  FileText,
  Calendar,
  TrendingUp,
  Plus,
  User,
  LogOut,
  Activity,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { HealthScoreWidget } from "./components/health-score-widget"
import { RiskAssessmentWidget } from "./components/risk-assessment-widget"
import { LifestyleRecommendations } from "./components/lifestyle-recommendations"
import { TrendAnalysisWidget } from "./components/trend-analysis-widget"

interface AIInsights {
  personalizedScore: {
    overall: number
    categories: {
      metabolic: number
      cardiovascular: number
      inflammation: number
      hormonal: number
    }
    explanation: string
  }
  riskAssessment: {
    highRisk: string[]
    moderateRisk: string[]
    protectiveFactors: string[]
  }
  personalizedRecommendations: Array<{
    category: "diet" | "exercise" | "lifestyle" | "medical" | "supplements"
    priority: "high" | "medium" | "low"
    recommendation: string
    reasoning: string
  }>
  trendAnalysis: {
    improvingMarkers: string[]
    decliningMarkers: string[]
    stableMarkers: string[]
    keyInsights: string[]
  }
  nextSteps: Array<{
    action: string
    timeframe: string
    importance: "critical" | "important" | "routine"
  }>
}

const dummyAIInsights: AIInsights = {
  personalizedScore: {
    overall: 78,
    categories: {
      metabolic: 82,
      cardiovascular: 75,
      inflammation: 68,
      hormonal: 85,
    },
    explanation:
      "Your overall health score is good with strong hormonal and metabolic markers. Focus on reducing inflammation markers for optimal health.",
  },
  riskAssessment: {
    highRisk: ["Elevated LDL Cholesterol", "Low Vitamin D"],
    moderateRisk: ["Borderline HbA1c", "Slightly elevated CRP"],
    protectiveFactors: ["Optimal HDL levels", "Good thyroid function", "Healthy B12 levels"],
  },
  personalizedRecommendations: [
    {
      category: "diet",
      priority: "high",
      recommendation: "Increase omega-3 rich foods like salmon, walnuts, and flaxseeds",
      reasoning: "Your inflammation markers suggest you could benefit from anti-inflammatory foods",
    },
    {
      category: "exercise",
      priority: "high",
      recommendation: "Add 30 minutes of moderate cardio 4-5 times per week",
      reasoning: "Regular cardio can help improve your cardiovascular markers and reduce LDL cholesterol",
    },
    {
      category: "supplements",
      priority: "medium",
      recommendation: "Consider Vitamin D3 supplementation (2000-4000 IU daily)",
      reasoning: "Your Vitamin D levels are below optimal range for immune and bone health",
    },
    {
      category: "lifestyle",
      priority: "medium",
      recommendation: "Aim for 7-9 hours of quality sleep nightly",
      reasoning: "Better sleep can help regulate hormones and reduce inflammation",
    },
    {
      category: "medical",
      priority: "low",
      recommendation: "Follow up with your doctor about cholesterol management",
      reasoning: "Your LDL levels may benefit from medical evaluation",
    },
  ],
  trendAnalysis: {
    improvingMarkers: ["HDL Cholesterol", "Thyroid TSH", "Vitamin B12"],
    decliningMarkers: ["Vitamin D", "LDL Cholesterol"],
    stableMarkers: ["Glucose", "Total Cholesterol", "Triglycerides"],
    keyInsights: [
      "Your metabolic health has improved over the last 6 months",
      "Vitamin D levels need attention - consider supplementation",
      "Cardiovascular markers show mixed results - focus on diet and exercise",
    ],
  },
  nextSteps: [
    {
      action: "Schedule follow-up blood work",
      timeframe: "3 months",
      importance: "important",
    },
    {
      action: "Start Vitamin D supplementation",
      timeframe: "Immediately",
      importance: "important",
    },
    {
      action: "Implement dietary changes",
      timeframe: "This week",
      importance: "critical",
    },
  ],
}

export default function DashboardPage() {
  const { user, isAuthenticated, logout, loading, error: authError, loadProfile } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiInsights] = useState<AIInsights>(dummyAIInsights)
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      console.log("[Dashboard] User not authenticated, redirecting to signin")
      router.push("/signin")
    }
  }, [isAuthenticated, loading, router, mounted])

  // Auto-retry profile loading if it fails
  useEffect(() => {
    if (mounted && isAuthenticated && user?.id && !user?.profile && !profileLoading) {
      console.log("[Dashboard] User profile missing, attempting to load")
      handleLoadProfile()
    }
  }, [mounted, isAuthenticated, user, profileLoading])

  const handleLoadProfile = async () => {
    if (!loadProfile || profileLoading) return

    setProfileLoading(true)
    setError(null)

    try {
      await loadProfile()
      console.log("[Dashboard] Profile loaded successfully")
    } catch (err) {
      console.error("[Dashboard] Failed to load profile:", err)
      setError("Failed to load profile data")
    } finally {
      setProfileLoading(false)
    }
  }

  const loadAIInsights = async () => {
    setInsightsLoading(true)
    // Simulate API delay
    setTimeout(() => {
      setInsightsLoading(false)
    }, 1500)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (err) {
      console.error("[Dashboard] Logout failed:", err)
      setError("Failed to logout")
    }
  }

  // Show loading screen while checking authentication
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Loading Dashboard</h2>
              <p className="text-muted-foreground">Please wait while we load your data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication required if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Authentication Required</h2>
              <p className="text-muted-foreground">Please sign in to access your dashboard</p>
              <Button asChild className="mt-4">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safely extract user profile data with fallbacks
  const userProfile = {
    email: user.email || "Not provided",
    age: user.profile?.age || "Not set",
    sex: user.profile?.sex || "Not set",
    height: user.profile?.height || "Not set",
    weight: user.profile?.weight || "Not set",
    units: user.profile?.units || "Imperial",
    ethnicity: user.profile?.ethnicity || "Not set",
    testDate: user.user_metadata?.testDate || "2024-01-15",
    medicalConditions: user.profile?.medical_conditions || [],
    medications: user.profile?.medications || [],
    lifestyle: user.profile?.lifestyle || {},
  }

  const isProfileIncomplete = !user.profile || !user.profile.age || !user.profile.sex

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
                <span className="text-xl font-semibold text-balance">KnowMyLabs</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Marker Glossary
              </Link>
              <Link href="/dashboard" className="text-sm text-primary font-medium">
                Dashboard
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {(error || authError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || authError}
              {error && (
                <Button variant="outline" size="sm" className="ml-2 bg-transparent" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-muted-foreground">{userProfile.email}</p>
            </div>
            {!isProfileIncomplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadAIInsights}
                disabled={insightsLoading}
                className="ml-auto bg-transparent"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {insightsLoading ? "Generating..." : "Refresh AI Insights"}
              </Button>
            )}
          </div>
        </div>

        {!isProfileIncomplete && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">AI-Powered Health Insights</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <HealthScoreWidget scoreData={aiInsights.personalizedScore} isLoading={insightsLoading} />
              <RiskAssessmentWidget riskData={aiInsights.riskAssessment} isLoading={insightsLoading} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <TrendAnalysisWidget trendData={aiInsights.trendAnalysis} isLoading={insightsLoading} />
              <LifestyleRecommendations
                recommendations={aiInsights.personalizedRecommendations}
                isLoading={insightsLoading}
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Test</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile.testDate}</div>
              <p className="text-xs text-muted-foreground">Comprehensive panel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aiInsights.personalizedScore.overall}/100</div>
              <Progress value={aiInsights.personalizedScore.overall} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Markers Tracked</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Across 3 panels</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Tests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Lab Tests</CardTitle>
                  <CardDescription>Your latest test results and trends</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/onboarding">
                    <Plus className="h-4 w-4 mr-2" />
                    New Test
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Comprehensive Metabolic Panel</p>
                      <p className="text-sm text-muted-foreground">{userProfile.testDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Normal Range
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/results">View</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Lipid Panel</p>
                      <p className="text-sm text-muted-foreground">2024-01-01</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                      Needs Attention
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/results">View</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Thyroid Function Panel</p>
                      <p className="text-sm text-muted-foreground">2023-12-15</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Optimal
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/results">View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Your Profile
                    {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    {isProfileIncomplete
                      ? "Complete your profile to get personalized insights"
                      : "Personal health information"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!profileLoading && (
                    <Button variant="ghost" size="sm" onClick={handleLoadProfile} title="Refresh profile data">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/profile/edit">
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isProfileIncomplete && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Complete your profile to get personalized lab result interpretations and health insights.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Age:</span>
                    <span className={userProfile.age === "Not set" ? "text-muted-foreground italic" : ""}>
                      {userProfile.age}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sex:</span>
                    <span className={userProfile.sex === "Not set" ? "text-muted-foreground italic" : ""}>
                      {userProfile.sex}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Height:</span>
                    <span className={userProfile.height === "Not set" ? "text-muted-foreground italic" : ""}>
                      {userProfile.height}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className={userProfile.weight === "Not set" ? "text-muted-foreground italic" : ""}>
                      {userProfile.weight}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units:</span>
                    <span>{userProfile.units}</span>
                  </div>

                  {userProfile.ethnicity !== "Not set" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ethnicity:</span>
                      <span>{userProfile.ethnicity}</span>
                    </div>
                  )}
                </div>

                {userProfile.medicalConditions && userProfile.medicalConditions.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Medical Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {userProfile.medications && userProfile.medications.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Medications:</p>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.medications.map((medication, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant={isProfileIncomplete ? "default" : "outline"}
                  size="sm"
                  className="w-full mt-4"
                  asChild
                  disabled={profileLoading}
                >
                  <Link href="/profile/edit">
                    <User className="h-4 w-4 mr-2" />
                    {isProfileIncomplete ? "Complete Profile" : "Edit Profile"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground bg-transparent"
                >
                  <Link href="/onboarding">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New Test
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/glossary">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Marker Glossary
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/results">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Latest Results
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
