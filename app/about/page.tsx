"use client"

import { Badge } from "@/components/ui/badge"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Users, Stethoscope, BookOpen, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function AboutPage() {
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
                <span className="text-xl font-semibold">KnowMyLabs</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-primary font-medium">
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

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              About KnowMyLabs
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance">
              Making Lab Results <span className="text-primary">Accessible</span> to Everyone
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              We believe everyone deserves to understand their health data. KnowMyLabs transforms complex medical
              terminology into clear, actionable insights.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="mb-12 grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To empower individuals with clear, understandable explanations of their lab results, helping them make
                  informed decisions about their health in partnership with their healthcare providers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A world where everyone can understand their health data, leading to better health outcomes through
                  improved patient-provider communication and health literacy.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <div className="mb-12">
            <h2 className="mb-8 text-3xl font-bold text-center text-balance">What Makes Us Different</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Privacy First</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Your health information is never stored or shared. All processing happens securely and your data is
                    immediately discarded after analysis.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Stethoscope className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Medically Accurate</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our explanations are based on established medical guidelines and reference ranges, reviewed by
                    healthcare professionals for accuracy.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Patient-Centered</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Designed with patients in mind, using plain language and focusing on what your results mean for your
                    health and next steps.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How We Help */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>How KnowMyLabs Helps You</CardTitle>
              <CardDescription>Understanding your lab results shouldn't require a medical degree</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Before KnowMyLabs:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Confusing medical terminology</li>
                    <li>• Unclear reference ranges</li>
                    <li>• Waiting for doctor appointments</li>
                    <li>• Anxiety about abnormal values</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">With KnowMyLabs:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Plain English explanations</li>
                    <li>• Context for your results</li>
                    <li>• Immediate understanding</li>
                    <li>• Better prepared for doctor visits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Ready to Understand Your Results?</h2>
            <p className="mb-6 text-muted-foreground">
              Try our demo to see how we can help you make sense of your lab work.
            </p>
            <Button asChild size="lg">
              <Link href="/onboarding">Start Demo</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center"></div>
      </footer>
    </div>
  )
}
