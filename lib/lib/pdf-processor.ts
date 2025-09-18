// lib/lib/pdf-processor.ts - V0 COMPATIBLE: Client-side only
export async function extractPDFText(file: File): Promise<string> {
  console.log("[CLIENT] Starting PDF extraction for:", file.name)

  // Method 1: PDF.js extraction (works in v0 browser environment)
  try {
    console.log("[CLIENT] Using PDF.js extraction...")
    const text = await extractWithPDFJS(file)
    if (text && text.trim().length > 0) {
      console.log("[CLIENT] PDF.js extraction successful, length:", text.length)
      return text
    } else {
      console.warn("[CLIENT] PDF.js returned empty text")
    }
  } catch (error) {
    console.error("[CLIENT] PDF.js extraction failed:", error)
  }

  // Method 2: Simple text extraction for text-based PDFs
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

  // Method 3: FileReader as last resort
  try {
    console.log("[CLIENT] Attempting FileReader extraction...")
    const text = await extractWithFileReader(file)
    if (text && text.trim().length > 0) {
      console.log("[CLIENT] FileReader extraction successful, length:", text.length)
      return text
    }
  } catch (error) {
    console.warn("[CLIENT] FileReader extraction failed:", error)
  }

  throw new Error("Failed to extract text from PDF using all available client-side methods")
}

// Enhanced PDF.js extraction with better text positioning
async function extractWithPDFJS(file: File): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist")

    // Set worker source to CDNJS (v0 compatible)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ""

    console.log("[CLIENT] PDF loaded successfully, pages:", pdf.numPages)

    // Extract text from each page with better positioning
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`[CLIENT] Processing page ${pageNum}/${pdf.numPages}`)
      
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Sort items by position (top to bottom, left to right)
      const sortedItems = textContent.items.sort((a: any, b: any) => {
        // First sort by Y position (top to bottom)
        const yDiff = Math.round(b.transform[5] - a.transform[5]) // Y coordinate
        if (Math.abs(yDiff) > 2) return yDiff
        
        // Then sort by X position (left to right) if on same line
        return Math.round(a.transform[4] - b.transform[4]) // X coordinate
      })

      // Group items into lines and build text
      let pageText = ""
      let currentLine = ""
      let lastY = null

      for (const item of sortedItems) {
        const y = Math.round(item.transform[5])
        const text = item.str.trim()
        
        if (!text) continue

        // Check if we're on a new line
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          // New line detected
          if (currentLine.trim()) {
            pageText += currentLine.trim() + "\n"
          }
          currentLine = text
        } else {
          // Same line, add space if needed
          if (currentLine && !currentLine.endsWith(" ") && !text.startsWith(" ")) {
            currentLine += " "
          }
          currentLine += text
        }
        
        lastY = y
      }

      // Add the last line
      if (currentLine.trim()) {
        pageText += currentLine.trim() + "\n"
      }

      fullText += pageText + "\n" // Add page break
    }

    console.log(`[CLIENT] PDF.js extraction completed: ${fullText.length} characters`)
    return fullText.trim()
  } catch (error) {
    console.error("[CLIENT] PDF.js extraction error:", error)
    throw error
  }
}

// FileReader fallback method
async function extractWithFileReader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        resolve(text || "")
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error("FileReader failed"))
    reader.readAsText(file)
  })
}
