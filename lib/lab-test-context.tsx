// lib/lab-test-context.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

// Define the type for lab markers
export interface LabMarker {
  code: string
  name: string
  value: number
  unit: string
  value_si: number
  unit_si: string
  ref_range_low?: number
  ref_range_high?: number
  category?: string
}

// Define the type for the context
interface LabTestContextType {
  extractedLabs: LabMarker[]
  setExtractedLabs: (labs: LabMarker[]) => void
  reviewedLabs: LabMarker[]
  setReviewedLabs: (labs: LabMarker[]) => void
}

// Create the context
const LabTestContext = createContext<LabTestContextType | undefined>(undefined)

// Create the provider component
export function LabTestProvider({ children }: { children: ReactNode }) {
  const [extractedLabs, setExtractedLabs] = useState<LabMarker[]>([])
  const [reviewedLabs, setReviewedLabs] = useState<LabMarker[]>([])

  return (
    <LabTestContext.Provider value={{ extractedLabs, setExtractedLabs, reviewedLabs, setReviewedLabs }}>
      {children}
    </LabTestContext.Provider>
  )
}

// Create a hook to use the context
export function useLabTest() {
  const context = useContext(LabTestContext)
  if (context === undefined) {
    throw new Error("useLabTest must be used within a LabTestProvider")
  }
  return context
}
