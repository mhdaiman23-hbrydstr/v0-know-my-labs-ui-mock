// lib/pdf-processor.ts - ENHANCED VERSION
// Client-side PDF text extraction utility with fallback methods

export async function extractPDFText(file: File): Promise<string> {
  console.log('[CLIENT] Starting enhanced PDF extraction for:', file.name);
  
  // Method 1: Try advanced PDF.js extraction
  try {
    console.log('[CLIENT] Trying Method 1: Advanced PDF.js extraction');
    return await extractWithAdvancedPDFJS(file);
  } catch (error) {
    console.log('[CLIENT] Method 1 failed:', error);
  }

  // Method 2: Try basic PDF.js extraction
  try {
    console.log('[CLIENT] Trying Method 2: Basic PDF.js extraction');
    return await extractWithBasicPDFJS(file);
  } catch (error) {
    console.log('[CLIENT] Method 2 failed:', error);
    throw new Error('Failed to extract text from PDF using all available client methods');
  }
}

// Method 1: Enhanced PDF.js with better text positioning
async function extractWithAdvancedPDFJS(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';
  
  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Enhanced text processing with better positioning
    const textItems = textContent.items as any[];
    
    // Sort items by position (top to bottom, left to right)
    textItems.sort((a, b) => {
      // Group items within small y-range as same line
      const yTolerance = 5;
      if (Math.abs(a.transform[5] - b.transform[5]) < yTolerance) {
        return a.transform[4] - b.transform[4]; // Sort by x position
      }
      return b.transform[5] - a.transform[5]; // Sort by y position (top to bottom)
    });
    
    // Process items to build coherent text
    let currentLine = '';
    let lastY = -1;
    const lineHeight = 12; // Approximate line height
    
    for (const item of textItems) {
      const currentY = item.transform[5];
      
      // Check if we're on a new line
      if (lastY !== -1 && Math.abs(currentY - lastY) > lineHeight / 2) {
        if (currentLine.trim()) {
          fullText += currentLine.trim() + '\n';
        }
        currentLine = '';
      }
      
      // Add space if needed
      if (currentLine.length > 0 && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
        currentLine += ' ';
      }
      
      currentLine += item.str;
      lastY = currentY;
    }
    
    // Add the last line
    if (currentLine.trim()) {
      fullText += currentLine.trim() + '\n';
    }
    
    fullText += '\n'; // Page separator
  }
  
  console.log('[CLIENT] Advanced extraction completed, length:', fullText.length);
  return fullText;
}

// Method 2: Your existing basic extraction (fallback)
async function extractWithBasicPDFJS(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';
  
  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Combine text items, preserving structure
    const pageText = textContent.items
      .map((item: any) => {
        // Add space or newline based on transform
        if (item.hasEOL) {
          return item.str + '\n';
        }
        return item.str + ' ';
      })
      .join('');
    
    fullText += pageText + '\n\n';
  }
  
  console.log('[CLIENT] Basic extraction completed, length:', fullText.length);
  return fullText;
}

// Helper function to check if PDF extraction is likely to work
export async function canExtractPDFText(file: File): Promise<boolean> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    // Check if the first page has extractable text
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    return textContent.items.length > 0;
  } catch (error) {
    console.warn('[CLIENT] Cannot determine if PDF has extractable text:', error);
    return true; // Assume it does to allow attempt
  }
}
