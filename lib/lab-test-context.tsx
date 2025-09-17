"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// Define types
interface LabMarker {
  code: string
  name: string
  value: number
  unit: string
  value_si: number
  unit_si: string
  ref_range_low?: number
  ref_range_high?: number
  category?: string
  flag?: string
  collection_date?: string
}

interface Demographics {
  age?: number
  sex?: string
  height?: number
  weight?: number
  reason?: string
}

interface Interpretation {
  summary: string
  flags: Array<{
    severity: "critical" | "high" | "medium" | "low" | "normal"
    lab_code: string
    lab_name: string
    finding: string
    description: string
  }>
  lifestyle: Array<{
    type: "diet" | "exercise" | "sleep" | "stress" | "supplements" | "other"
    recommendation: string
    evidence: string
  }>
  doctor_questions: string[]
}

interface LabTestContextType {
  extractedLabs: LabMarker[]
  setExtractedLabs: (labs: LabMarker[]) => void
  reviewedLabs: LabMarker[]
  setReviewedLabs: (labs: LabMarker[]) => void
  demographics: Demographics
  setDemographics: (demo: Demographics) => void
  interpretation: Interpretation | null
  setInterpretation: (interp: Interpretation | null) => void
}

// Create context
const LabTestContext = createContext<LabTestContextType | undefined>(undefined)

// Persist data to localStorage
const saveToStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error("Error saving to localStorage:", e)
    }
  }
}

// Load data from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch (e) {
      console.error("Error loading from localStorage:", e)
      return defaultValue
    }
  }
  return defaultValue
}

// Provider component
export function LabTestProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage (if available)
  const [extractedLabs, setExtractedLabsState] = useState<LabMarker[]>([])
  const [reviewedLabs, setReviewedLabsState] = useState<LabMarker[]>([])
  const [demographics, setDemographicsState] = useState<Demographics>({})
  const [interpretation, setInterpretationState] = useState<Interpretation | null>(null)
  
  // Load data from localStorage on initial mount
  useEffect(() => {
    // Load data from localStorage
    const storedExtractedLabs = loadFromStorage<LabMarker[]>("extractedLabs", [])
    const storedReviewedLabs = loadFromStorage<LabMarker[]>("reviewedLabs", [])
    const storedDemographics = loadFromStorage<Demographics>("demographics", {})
    const storedInterpretation = loadFromStorage<Interpretation | null>("interpretation", null)
    
    console.log("Loading from localStorage:", {
      extractedLabs: storedExtractedLabs,
      reviewedLabs: storedReviewedLabs
    })
    
    setExtractedLabsState(storedExtractedLabs)
    setReviewedLabsState(storedReviewedLabs)
    setDemographicsState(storedDemographics)
    setInterpretationState(storedInterpretation)
  }, [])
  
  // Wrapper functions to update state and localStorage
  const setExtractedLabs = (labs: LabMarker[]) => {
    console.log("Setting extracted labs:", labs)
    setExtractedLabsState(labs)
    saveToStorage("extractedLabs", labs)
  }
  
  const setReviewedLabs = (labs: LabMarker[]) => {
    setReviewedLabsState(labs)
    saveToStorage("reviewedLabs", labs)
  }
  
  const setDemographics = (demo: Demographics) => {
    setDemographicsState(demo)
    saveToStorage("demographics", demo)
  }
  
  const setInterpretation = (interp: Interpretation | null) => {
    setInterpretationState(interp)
    saveToStorage("interpretation", interp)
  }

  // Context value
  const value = {
    extractedLabs,
    setExtractedLabs,
    reviewedLabs,
    setReviewedLabs,
    demographics,
    setDemographics,
    interpretation,
    setInterpretation,
  }

  return <LabTestContext.Provider value={value}>{children}</LabTestContext.Provider>
}

// Hook for using the context
export function useLabTest() {
  const context = useContext(LabTestContext)
  if (context === undefined) {
    throw new Error("useLabTest must be used within a LabTestProvider")
  }
  return context
}
