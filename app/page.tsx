"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, ArrowRight, FileText, Brain, Clock, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
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
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
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
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Button asChild size="sm" className="ml-2">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4">
              Trusted by Healthcare Professionals
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Understand Your <span className="text-primary">Lab Results</span> in Plain English
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Get clear, easy-to-understand explanations of your medical lab results. No medical degree required – just
              upload your report and get insights you can actually use.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="text-lg">
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg bg-transparent">
                  <Link href="/onboarding">Upload New Test</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg">
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg bg-transparent">
                  <Link href="/about">Learn More</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-lg">
                  <Link href="/onboarding">Try as Guest</Link>
                </Button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mb-16 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground text-center">Your health data stays private and secure</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Easy to Understand</h3>
              <p className="text-sm text-muted-foreground text-center">Complex medical terms explained simply</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Results</h3>
              <p className="text-sm text-muted-foreground text-center">Get your analysis in minutes, not days</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="mb-8 text-3xl font-bold text-balance">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="relative">
                <CardHeader className="pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    1
                  </div>
                  <CardTitle className="text-lg">Tell Us About You</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Share basic information to personalize your results</CardDescription>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader className="pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    2
                  </div>
                  <CardTitle className="text-lg">Select Lab Panels</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Choose which lab panels you want us to analyze</CardDescription>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader className="pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    3
                  </div>
                  <CardTitle className="text-lg">Upload Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Securely upload your lab report (PDF, image, or CSV)</CardDescription>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader className="pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    4
                  </div>
                  <CardTitle className="text-lg">Get Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Receive clear explanations and actionable insights</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sample Results Preview */}
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Results Preview
              </CardTitle>
              <CardDescription>See how we transform complex lab data into clear insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-left">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Cholesterol Panel
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Your LDL cholesterol is 145 mg/dL</strong> - This is slightly above the ideal range. LDL is
                  often called "bad" cholesterol because higher levels may increase heart disease risk. Consider
                  discussing dietary changes with your doctor.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center"></div>
      </footer>
    </div>
  )
}
