// Client-side PDF text extraction utility using pdf-parse instead of pdfjs-dist

export async function extractPDFText(file: File): Promise<string> {
  try {
    console.log("[v0] Starting PDF text extraction with pdf-parse for file:", file.name)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    console.log("[v0] File converted to buffer, size:", buffer.length)

    // Dynamic import to avoid SSR issues
    const pdfParse = await import("pdf-parse")
    console.log("[v0] pdf-parse library loaded")

    // Extract text using pdf-parse (no worker needed)
    const data = await pdfParse.default(buffer)
    console.log("[v0] PDF text extraction completed, pages:", data.numpages, "length:", data.text.length)

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text content found in the PDF. The file might be image-based or corrupted.")
    }

    return data.text
  } catch (error) {
    console.error("[v0] Error extracting PDF text:", error)

    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF") || error.message.includes("not a PDF")) {
        throw new Error("The uploaded file is not a valid PDF or is corrupted.")
      } else if (error.message.includes("password")) {
        throw new Error("This PDF is password protected. Please upload an unprotected version.")
      } else if (error.message.includes("No text content found")) {
        throw error // Re-throw our custom message
      }
    }

    throw new Error("Failed to extract text from PDF. Please ensure the file is a valid, text-based PDF and try again.")
  }
}
