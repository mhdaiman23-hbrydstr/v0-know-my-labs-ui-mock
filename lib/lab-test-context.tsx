"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useAuth } from "./auth-context"

interface LabMarker {
  id: string
  marker: string
  value: number | string
  unit: string
  panel: string
  referenceRange?: string
  value_si?: number | string
  unit_si?: string
  value_raw?: number | string
  unit_raw?: string
}

interface InterpretationResult {
  summary: string
  flags: Array<{
    marker?: string
    name?: string
    value: string
    referenceRange: string
    status: string
    severity: "high" | "low" | "borderline" | "normal" | "critical" | "note"
    rationale?: string
  }>
  considerations: string[]
  lifestyle: string[]
  questionsForDoctor: string[]
  safetyNotice?: string
}

interface LabTestData {
  // Personal info
  age: string
  sex: string
  ethnicity: string
  height: string
  weight: string
  lifestyle: {
    exercise: string
    diet: string
    smoking: string
    alcohol: string
    sleep: string
    stress: string
  }
  fastingStatus: string
  testDate: string
  units: string
  referenceSet: string
  medicalConditions: string[]
  medications: string[]

  // Lab panels
  selectedPanels: string[]

  // File info
  fileName?: string
  fileType?: string
  usingSampleReport?: boolean

  extractedLabs?: LabMarker[]
  reviewedLabs?: LabMarker[]
  interpretationResults?: InterpretationResult
  uploadedFileName?: string
}

interface LabTestContextType {
  labTestData: LabTestData
  updateLabTestData: (data: Partial<LabTestData>) => void
  setExtractedLabs: (labs: LabMarker[]) => void
  setReviewedLabs: (labs: LabMarker[]) => void
  setInterpretationResults: (results: InterpretationResult) => void
  saveLabTest: () => Promise<boolean>
  resetLabTestData: () => void
}

const defaultLabTestData: LabTestData = {
  age: "",
  sex: "",
  ethnicity: "",
  height: "",
  weight: "",
  lifestyle: {
    exercise: "",
    diet: "",
    smoking: "",
    alcohol: "",
    sleep: "",
    stress: "",
  },
  fastingStatus: "",
  testDate: "",
  units: "",
  referenceSet: "",
  medicalConditions: [],
  medications: [],
  selectedPanels: [],
  fileName: "",
  fileType: "",
  usingSampleReport: false,
  extractedLabs: [],
  reviewedLabs: [],
  interpretationResults: undefined,
  uploadedFileName: "",
}

const LabTestContext = createContext<LabTestContextType | undefined>(undefined)

export function LabTestProvider({ children }: { children: ReactNode }) {
  const [labTestData, setLabTestData] = useState<LabTestData>(defaultLabTestData)
  const { user, isAuthenticated } = useAuth()

  const updateLabTestData = useCallback((data: Partial<LabTestData>) => {
    setLabTestData((prev) => ({ ...prev, ...data }))
  }, [])

  const setExtractedLabs = useCallback((labs: LabMarker[]) => {
    setLabTestData((prev) => ({ ...prev, extractedLabs: labs }))
  }, [])

  const setReviewedLabs = useCallback((labs: LabMarker[]) => {
    setLabTestData((prev) => ({ ...prev, reviewedLabs: labs }))
  }, [])

  const setInterpretationResults = useCallback((results: InterpretationResult) => {
    setLabTestData((prev) => ({ ...prev, interpretationResults: results }))
  }, [])

  const saveLabTest = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.log("[v0] User not authenticated, skipping save")
      return false
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const testDate = labTestData.testDate || new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("lab_tests")
        .insert({
          user_id: user.id,
          test_name: `Lab Analysis - ${new Date().toLocaleDateString()}`,
          test_date: testDate,
          panels: labTestData.selectedPanels,
          file_name:
            labTestData.uploadedFileName ||
            labTestData.fileName ||
            (labTestData.usingSampleReport ? "Sample Report" : null),
          file_type: labTestData.fileType || (labTestData.usingSampleReport ? "sample" : null),
          lab_markers: labTestData.reviewedLabs || labTestData.extractedLabs || [],
          interpretation_results: labTestData.interpretationResults,
        })
        .select()

      if (error) {
        console.error("[v0] Error saving lab test:", error)
        return false
      }

      console.log("[v0] Lab test saved successfully:", data)
      return true
    } catch (error) {
      console.error("[v0] Error saving lab test:", error)
      return false
    }
  }, [isAuthenticated, user, labTestData])

  const resetLabTestData = useCallback(() => {
    setLabTestData(defaultLabTestData)
  }, [])

  return (
    <LabTestContext.Provider
      value={{
        labTestData,
        updateLabTestData,
        setExtractedLabs,
        setReviewedLabs,
        setInterpretationResults,
        saveLabTest,
        resetLabTestData,
      }}
    >
      {children}
    </LabTestContext.Provider>
  )
}

export function useLabTest() {
  const context = useContext(LabTestContext)
  if (context === undefined) {
    throw new Error("useLabTest must be used within a LabTestProvider")
  }
  return context
}
