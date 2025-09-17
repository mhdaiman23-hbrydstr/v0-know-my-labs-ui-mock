import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { getDocument, version } from 'pdfjs-dist';

// Configure pdf.js worker
// In Next.js, we need to handle PDF.js differently on the server
if (typeof window === 'undefined') {
  // We're on the server
  const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
  if (typeof globalThis !== 'undefined') {
    // @ts-ignore
    globalThis.pdfjsWorker = pdfjsWorker;
  }
}

// Disable default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new formidable.IncomingForm();
    
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Get file from form data
    const file = files.file as formidable.File;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('[SERVER] File details:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size
    });

    // Process file based on type
    let text = '';
    
    if (file.mimetype === 'application/pdf') {
      // Extract text from PDF
      try {
        // Read the file into a buffer
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Use a simple approach for PDF extraction
        text = await extractTextFromPDF(file.filepath);
        
        console.log('[SERVER] PDF text extracted successfully, length:', text.length);
      } catch (error) {
        console.error('PDF extraction error:', error);
        return res.status(500).json({ message: 'Failed to extract text from PDF', error: String(error) });
      }
    } else if (file.mimetype === 'text/csv') {
      // Extract text from CSV - simply read the file
      try {
        text = fs.readFileSync(file.filepath, 'utf8');
      } catch (error) {
        console.error('CSV reading error:', error);
        return res.status(500).json({ message: 'Failed to read CSV file', error: String(error) });
      }
    } else if (file.mimetype?.startsWith('image/')) {
      // For images, we'd typically use OCR, but for this example
      // we'll just return a placeholder message
      text = 'Image OCR is coming soon. Please upload a PDF or CSV file.';
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Return the extracted text
    return res.status(200).json({ text });
  } catch (error) {
    console.error('Error extracting text:', error);
    return res.status(500).json({ message: 'Failed to extract text from file', error: String(error) });
  }
}

// Simple function to extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Simple method using pdf.js
    const data = await getDocument(filePath).promise;
    let fullText = '';
    
    // Process each page
    for (let i = 1; i <= data.numPages; i++) {
      const page = await data.getPage(i);
      const content = await page.getTextContent();
      
      // Combine text items
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error in PDF text extraction:', error);
    throw new Error(`PDF extraction failed: ${error}`);
  }
}
