// lib/pdf-processor.ts - Browser-compatible PDF text extraction

export async function extractPDFText(file: File): Promise<string> {
  console.log("[CLIENT] Starting PDF extraction for:", file.name)

  // Method 1: Try server-side extraction first (most reliable)
  try {
    console.log("[CLIENT] Attempting server-side extraction...")
    const text = await extractWithServer(file)
    if (text && text.trim().length > 0) {
      console.log("[CLIENT] Server-side extraction successful, length:", text.length)
      return text
    }
  } catch (error) {
    console.warn("[CLIENT] Server-side extraction failed:", error)
  }

  // Method 2: Try simple text extraction for text-based PDFs
  try {
    console.log("[CLIENT] Attempting simple text extraction...")
    const text = await file.text()
    if (text && text.trim().length > 0 && text.includes("%PDF")) {
      // Basic PDF text extraction - look for text between stream markers
      const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs)
      if (textMatches) {
        let extractedText = ""
        textMatches.forEach((match) => {
          const content = match.replace(/^stream\s*/, "").replace(/\s*endstream$/, "")
          // Simple text extraction - this won't work for all PDFs but handles basic ones
          extractedText += content.replace(/[^\x20-\x7E\n\r\t]/g, " ") + "\n"
        })
        if (extractedText.trim().length > 0) {
          console.log("[CLIENT] Simple text extraction successful, length:", extractedText.length)
          return extractedText
        }
      }
    }
  } catch (error) {
    console.warn("[CLIENT] Simple text extraction failed:", error)
  }

  throw new Error(
    "Unable to extract text from PDF. Please try uploading a text-based PDF or use the server extraction method.",
  )
}

async function extractWithServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/extract-pdf", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Server extraction failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.text || ""
}
