import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { createReadStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

import { extractTextFromPDF, extractLabMarkers } from './extractUtils';
import { redactText } from '@/lib/redact';

// This is needed for formidable in App Router
export const dynamic = 'force-dynamic';

// Temporary file handling function
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
    const filename = file.name;
    const uniqueId = uuidv4();
    const filepath = join(tmpDir, `${uniqueId}-${filename}`);
    
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

// POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API] Extract API called');
    
    // Get form data
    const formData = await request.formData();
    
    // Save the file temporarily
    const { filepath, filename, mimetype } = await saveFormFile(formData);
    console.log('[API] File saved temporarily:', { filename, mimetype });
    
    // Extract text based on file type
    let text = '';
    
    if (mimetype === 'application/pdf') {
      text = await extractTextFromPDF(filepath);
    } else if (mimetype === 'text/csv') {
      // Read CSV file
      const fileStream = createReadStream(filepath, { encoding: 'utf8' });
      for await (const chunk of fileStream) {
        text += chunk;
      }
    } else if (mimetype.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Image OCR is coming soon. Please upload a PDF or CSV file.' 
      }, { status: 400 });
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file type' 
      }, { status: 400 });
    }
    
    console.log('[API] Text extracted, length:', text.length);
    
    // Redact personal information
    const redactedText = redactText(text);
    console.log('[API] Text redacted');
    
    // Extract lab markers
    const labMarkers = await extractLabMarkers(redactedText);
    console.log('[API] Extracted', labMarkers.length, 'lab markers');
    
    // Return the lab markers
    return NextResponse.json({ labs: labMarkers });
  } catch (error) {
    console.error('[API] Error in extract API:', error);
    
    // Return proper JSON error response
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import { join } from 'path';
import { createReadStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

import { extractTextFromPDF } from './extractUtils';
import { extractLabMarkers } from './extractUtils';
import { redactText } from '@/lib/redact';

// This is needed for formidable in App Router
export const dynamic = 'force-dynamic';
export const bodyParser = false;

// Temporary file handling function
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
    const filename = file.name;
    const uniqueId = uuidv4();
    const filepath = join(tmpDir, `${uniqueId}-${filename}`);
    
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

// POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API] Extract API called');
    
    // Get form data
    const formData = await request.formData();
    
    // Save the file temporarily
    const { filepath, filename, mimetype } = await saveFormFile(formData);
    console.log('[API] File saved temporarily:', { filename, mimetype });
    
    // Extract text based on file type
    let text = '';
    
    if (mimetype === 'application/pdf') {
      text = await extractTextFromPDF(filepath);
    } else if (mimetype === 'text/csv') {
      // Read CSV file
      const fileStream = createReadStream(filepath, { encoding: 'utf8' });
      for await (const chunk of fileStream) {
        text += chunk;
      }
    } else if (mimetype.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Image OCR is coming soon. Please upload a PDF or CSV file.' 
      }, { status: 400 });
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file type' 
      }, { status: 400 });
    }
    
    console.log('[API] Text extracted, length:', text.length);
    
    // Redact personal information
    const redactedText = redactText(text);
    console.log('[API] Text redacted');
    
    // Extract lab markers
    const labMarkers = await extractLabMarkers(redactedText);
    console.log('[API] Extracted', labMarkers.length, 'lab markers');
    
    // Return the lab markers
    return NextResponse.json({ labs: labMarkers });
  } catch (error) {
    console.error('[API] Error in extract API:', error);
    
    // Return proper JSON error response
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
