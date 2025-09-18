import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

export async function POST(req: NextRequest) {
  console.log("[SERVER] File upload request received")

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    console.log("[SERVER] File info:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    if (file.type === "application/pdf") {
      // For PDF files, we could use the actual PDF processing here
      console.log("[SERVER] Processing PDF file...")

      // Create a temporary directory for uploads
      const tempDir = join(tmpdir(), "pdf-uploads")
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true })
      }

      // Save the file to disk
      const filePath = join(tempDir, `upload-${Date.now()}-${file.name}`)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await writeFile(filePath, buffer)
      console.log("[SERVER] PDF file saved to:", filePath)

      // Clean up the file immediately after saving (since we're using mock data)
      try {
        await unlink(filePath)
        console.log("[SERVER] Temporary file cleaned up")
      } catch (cleanupError) {
        console.error("[SERVER] Failed to clean up temp file:", cleanupError)
      }
    } else {
      return NextResponse.json({ message: "Unsupported file type" }, { status: 400 })
    }

    // For now, just return mock data to test the flow
    const mockMarkers = [
      {
        code: "HGB",
        name: "Hemoglobin",
        value: 14.3,
        unit: "g/dL",
        value_si: 143,
        unit_si: "g/L",
        ref_range_low: 13.5,
        ref_range_high: 18,
        category: "CBC",
      },
      {
        code: "RBC",
        name: "Red Blood Cell Count",
        value: 5.17,
        unit: "10^6/μL",
        value_si: 5.17,
        unit_si: "10^12/L",
        ref_range_low: 4.5,
        ref_range_high: 5.5,
        category: "CBC",
      },
      {
        code: "WBC",
        name: "White Blood Cell Count",
        value: 6.61,
        unit: "10^3/μL",
        value_si: 6.61,
        unit_si: "10^9/L",
        ref_range_low: 4,
        ref_range_high: 11,
        category: "CBC",
      },
    ]

    return NextResponse.json({
      message: "File processed successfully",
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      markers: mockMarkers,
      markerCount: mockMarkers.length,
    })
  } catch (error) {
    console.error("[SERVER] Error processing file:", error)
    return NextResponse.json(
      {
        message: "Failed to process file",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
