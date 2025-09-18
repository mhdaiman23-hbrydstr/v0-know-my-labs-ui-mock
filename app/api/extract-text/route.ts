// app/api/extract-text/route.ts - FIXED: Handle PDF files properly
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { PDFExtract } from 'pdf.js-extract';

// Required for App Router
export const dynamic = 'force-dynamic';

// Simple PDF text extraction function
async function extractPDFText(filePath: string): Promise<string> {
  console.log('[SERVER] Starting PDF extraction for:', filePath);
  
  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(filePath);
    let fullText = '';
    
    console.log('[SERVER] PDF loaded, pages:', data.pages.length);
    
    // Process each page
    for (const page of data.pages) {
      // Sort content by position (top to bottom, then left to right)
      const sortedContent = [...page.content].sort((a, b) => {
        // Group items within a small y-range as being on the same line
        if (Math.abs(a.y - b.y) < 5) {
          return a.x - b.x; // Same line, sort by x
        }
        return a.y - b.y; // Different lines, sort by y
      });
      
      // Process content items to maintain layout
      let lastY = -1;
      let currentLine = '';
      
      for (const item of sortedContent) {
        // Check if we're starting a new line
        if (Math.abs(item.y - lastY) > 5 && lastY !== -1) {
          fullText += currentLine.trim() + '\n';
          currentLine = '';
        }
        
        // Add space if needed
        if (currentLine.length > 0 && !currentLine.endsWith(' ')) {
          currentLine += ' ';
        }
        
        // Add the text
        currentLine += item.str;
        lastY = item.y;
      }
      
      // Add the last line
      if (currentLine.trim()) {
        fullText += currentLine.trim() + '\n';
      }
      
      fullText += '\n'; // Page break
    }
    
    console.log('[SERVER] PDF extraction successful - extracted', fullText.length, 'characters');
    return fullText;
  } catch (error: any) {
    console.error('[SERVER] PDF extraction failed:', error.message);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

// Save uploaded file temporarily
async function saveFormFile(formData: FormData): Promise<{ filepath: string; filename: string; mimetype: string }> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    // Create temp directory
    const tmpDir = join(tmpdir(), 'lab-upload');
    await mkdir(tmpDir, { recursive: true });
    
    // Generate unique filename
    const uniqueId = uuidv4();
    const filepath = join(tmpDir, `${uniqueId}-${file.name}`);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write the file
    await writeFile(filepath, buffer);
    
    return {
      filepath,
      filename: file.name,
      mimetype: file.type
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[SERVER] PDF extraction API called');
    
    // Get form data (not JSON!)
    const formData = await request.formData();
    
    // Save the file temporarily
    const { filepath, filename, mimetype } = await saveFormFile(formData);
    console.log('[SERVER] Processing PDF file:', filename, 'Size:', formData.get('file')?.size || 'unknown');
    
    if (mimetype !== 'application/pdf') {
      return NextResponse.json({ 
        message: 'Only PDF files are supported in this endpoint' 
      }, { status: 400 });
    }
    
    // Extract text from PDF
    const extractedText = await extractPDFText(filepath);
    
    console.log('[SERVER] Successfully extracted', extractedText.length, 'characters');
    console.log('[SERVER] Text preview:', extractedText.substring(0, 200) + '...');
    
    return NextResponse.json({ 
      text: extractedText,
      success: true,
      length: extractedText.length,
      filename: filename
    });

  } catch (error) {
    console.error('[SERVER] PDF extraction error:', error);
    return NextResponse.json({ 
      message: 'PDF extraction failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
