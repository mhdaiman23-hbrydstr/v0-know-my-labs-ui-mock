"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

export default function ProcessingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    "Analyzing CBC markers...",
    "Processing chemistry panel...",
    "Converting to SI units...",
    "Checking reference ranges...",
    "Identifying abnormal values...",
    "Generating personalized insights...",
    "Preparing recommendations...",
    "Finalizing your results..."
  ]

  useEffect(() => {
    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 30) // Adjust speed as needed

    // Update steps based on progress
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return steps.length - 1
        }
        return prev + 1
      })
    }, 1200) // Time between step changes

    // Redirect to main dashboard page when complete (not the ID version)
    const redirectTimer = setTimeout(() => {
      console.log("Processing complete, redirecting to lab results")
      router.push('/results')
    }, 5500) // Total animation time (adjust as needed)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
      clearTimeout(redirectTimer)
    }
  }, [router, steps.length])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-blue-50/20">
      <div className="max-w-md w-full mx-auto text-center px-4">
        {/* Logo and title */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Analyzing Your Lab Results</h1>
          <p className="text-muted-foreground">
            Please wait while we process your data and generate personalized insights.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-blue-100 rounded-full h-2.5 mb-6 overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current step display */}
        <div className="min-h-[24px] mb-8">
          <p className="text-blue-700 animate-pulse">{steps[currentStep]}</p>
        </div>

        {/* Animated lab icons */}
        <div className="flex justify-center gap-8 mb-8">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
              style={{
                animation: `bounce 1.5s infinite ${index * 0.2}s`
              }}
            >
              <div className={`w-8 h-8 rounded-full bg-blue-${200 + (index * 100)}`} />
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          This process usually takes less than 10 seconds.
        </p>
      </div>

      {/* Add bounce animation */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  )
}
