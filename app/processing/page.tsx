"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, ArrowLeft, Brain, Zap, CheckCircle, Info } from "lucide-react"
import { motion } from "framer-motion"

export default function ProcessingPage() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showContinue, setShowContinue] = useState(false)

  const steps = [
    "Scanning document for lab markers...",
    "Extracting numerical values...",
    "Identifying reference ranges...",
    "Analyzing marker relationships...",
    "Generating plain-English explanations...",
    "Preparing your personalized report...",
  ]

  const mockMarkers = [
    "Total Cholesterol",
    "LDL Cholesterol",
    "HDL Cholesterol",
    "Triglycerides",
    "Glucose",
    "Hemoglobin A1c",
    "TSH",
    "Free T4",
    "Vitamin D",
    "B12",
    "Ferritin",
    "C-Reactive Protein",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setShowContinue(true)
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 150)

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer)
          return prev
        }
        return prev + 1
      })
    }, 2500)

    return () => {
      clearInterval(timer)
      clearInterval(stepTimer)
    }
  }, [steps.length])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-xl font-semibold">KnowMyLabs</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              UI Mock Only
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                ✓
              </div>
              <div className="h-1 w-16 bg-primary rounded"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">Step 4 of 4: Processing your results</p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="mb-2 text-3xl font-bold text-balance">Analyzing Your Lab Results</h1>
              <p className="text-muted-foreground text-pretty">
                We're processing your lab report and preparing clear, easy-to-understand explanations.
              </p>
            </motion.div>
          </div>

          {/* Important Notice */}
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>UI Mock Only:</strong> No data is actually processed. This is a visual demonstration of the
              analysis interface.
            </AlertDescription>
          </Alert>

          {/* Processing Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Brain className="h-5 w-5 text-primary" />
                </motion.div>
                Processing Lab Report
              </CardTitle>
              <CardDescription>
                Analyzing markers and preparing a plain-English summary... (UI mock only—no data processed)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Current Step */}
              <div className="space-y-2">
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                  {steps[currentStep]}
                </motion.p>
              </div>

              {/* Animated Dots */}
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                    }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Extracted Markers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Extracted Lab Markers
              </CardTitle>
              <CardDescription>Identifying and analyzing markers from your lab report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {mockMarkers.map((marker, index) => (
                  <motion.div
                    key={marker}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                  >
                    {progress > (index + 1) * 8 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      {progress > (index + 1) * 8 ? (
                        <p className="text-sm font-medium">{marker}</p>
                      ) : (
                        <Skeleton className="h-4 w-full" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/upload">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
            {showContinue ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/results">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    View Results
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <Button disabled>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>UI Mock Only:</strong> No actual analysis is performed. This is a demonstration of the processing
            interface.
          </p>
        </div>
      </footer>
    </div>
  )
}
