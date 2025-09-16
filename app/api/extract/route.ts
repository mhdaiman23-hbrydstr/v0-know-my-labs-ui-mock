import { type NextRequest, NextResponse } from "next/server"
import { toSI } from "@/lib/units"

// Mock lab data extraction - in real implementation, this would parse PDF/CSV files
function extractLabsFromFile(file: File): any[] {
  return [
    {
      id: "1",
      marker: "Total Cholesterol",
      value: 200,
      unit: "mg/dL",
      panel: "Lipid Panel",
      referenceRange: "< 200 mg/dL",
    },
    {
      id: "2",
      marker: "HDL Cholesterol",
      value: 62,
      unit: "mg/dL",
      panel: "Lipid Panel",
      referenceRange: "> 40 mg/dL",
    },
    {
      id: "3",
      marker: "LDL Cholesterol",
      value: 120,
      unit: "mg/dL",
      panel: "Lipid Panel",
      referenceRange: "< 100 mg/dL",
    },
    {
      id: "4",
      marker: "Triglycerides",
      value: 98,
      unit: "mg/dL",
      panel: "Lipid Panel",
      referenceRange: "< 150 mg/dL",
    },
    {
      id: "5",
      marker: "Glucose",
      value: 105,
      unit: "mg/dL",
      panel: "Basic Metabolic Panel",
      referenceRange: "70-110 mg/dL",
    },
    {
      id: "6",
      marker: "Hemoglobin A1c",
      value: 6.2,
      unit: "%",
      panel: "Diabetes Panel",
      referenceRange: "< 5.7%",
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload PDF, CSV, or Excel files." }, { status: 400 })
    }

    // Extract lab data from file (mock implementation)
    const extractedLabs = extractLabsFromFile(file)

    const labs = extractedLabs.map((lab) => toSI(lab))

    return NextResponse.json({
      success: true,
      labs,
      fileName: file.name,
      fileSize: file.size,
      extractedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error extracting lab data:", error)
    return NextResponse.json({ error: "Failed to extract lab data from file" }, { status: 500 })
  }
}
