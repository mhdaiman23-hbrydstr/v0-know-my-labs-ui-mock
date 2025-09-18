import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER] PDF extraction API called")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          message: "No file provided",
        },
        { status: 400 },
      )
    }

    console.log("[SERVER] Processing PDF file:", file.name, "Size:", file.size)

    return NextResponse.json(
      {
        message:
          "PDF text extraction is not yet fully implemented. Please try uploading a CSV file or text-based document for now.",
        text: "",
        success: false,
      },
      { status: 200 }, // Changed from 501 to 200
    )
  } catch (error) {
    console.error("[SERVER] PDF extraction error:", error)
    return NextResponse.json(
      {
        message: "PDF extraction failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
