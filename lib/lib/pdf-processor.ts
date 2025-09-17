/ lib/pdf-processor.ts
// Client-side PDF text extraction utility

export async function extractPDFText(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source (you'll need to configure this based on your setup)
  // For Next.js, you might need to copy the worker file to public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  try {
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
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
