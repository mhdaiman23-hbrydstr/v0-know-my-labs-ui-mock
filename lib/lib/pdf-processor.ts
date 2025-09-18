// lib/pdf-processor.ts - V0 COMPATIBLE VERSION
// Simple PDF text extraction utility

export async function extractPDFText(file: File): Promise<string> {
  console.log("[CLIENT] Starting PDF extraction for:", file.name)

  // Method 1: Try PDF.js extraction
  try {
    console.log("[CLIENT] Attempting PDF.js extraction...")
    const text = await extractWithPDFJS(file)
    if (text && text.trim().length > 0) {
      console.log("[CLIENT] PDF.js extraction successful, length:", text.length)
      return text
    }
  } catch (error) {
    console.warn("[CLIENT] PDF.js extraction failed:", error)
  }

  // Method 2: Try server-side extraction as fallback
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

  // Method 3: Try simple text extraction for text-based PDFs
  try {
    console.log("[CLIENT] Attempting simple text extraction...")
    const text = await file.text()
    if (text && text.trim().length > 0) {
      console.log("[CLIENT] Simple text extraction successful, length:", text.length)
      return text
    }
  } catch (error) {
    console.warn("[CLIENT] Simple text extraction failed:", error)
  }

  throw new Error("Failed to extract text from PDF using all available client methods")
}

async function extractWithPDFJS(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist")

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  let fullText = ""

  console.log("[CLIENT] PDF loaded, pages:", pdf.numPages)

  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // Simple text combination
    const pageText = textContent.items.map((item: any) => item.str).join(" ")

    fullText += pageText + "\n\n"
  }

  return fullText
}

async function extractWithServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/extract-text", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Server extraction failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.text || ""
}
