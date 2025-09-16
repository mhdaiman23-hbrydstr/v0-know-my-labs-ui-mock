"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, FileText, Calendar, TrendingUp, Plus, User, LogOut, Activity, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isAuthenticated, loading, router, mounted])

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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Authentication Required</h2>
              <p className="text-muted-foreground">Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const userProfile = {
    email: user.email || "Not provided",
    age: user.profile?.age || "Not set",
    sex: user.profile?.sex || "Not set",
    height: user.profile?.height || "Not set",
    weight: user.profile?.weight || "Not set",
    units: user.profile?.units || "Imperial",
    testDate: user.user_metadata?.testDate || "2024-01-15",
    medicalConditions: user.profile?.medical_conditions || [],
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
                onClick={() => logout()}
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
          </div>
        </div>

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
              <div className="text-2xl font-bold">85/100</div>
              <Progress value={85} className="mt-2" />
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
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    {isProfileIncomplete
                      ? "Complete your profile to get personalized insights"
                      : "Personal health information"}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile/edit">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {isProfileIncomplete && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      Complete your profile to get personalized lab result interpretations and health insights.
                    </p>
                  </div>
                )}

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
                {userProfile.medicalConditions && userProfile.medicalConditions.length > 0 && (
                  <div className="pt-2 border-t">
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
                <Button variant={isProfileIncomplete ? "default" : "outline"} size="sm" className="w-full mt-4" asChild>
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
