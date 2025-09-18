// app/api/extract-text/route.ts - ENHANCED VERSION
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { getDocument, version } from 'pdfjs-dist';
import { redactPHI } from '@/lib/redaction';
import { saveAnonymizedData, anonymizeDemographics, extractCollectionDate } from '@/lib/anonymization';
import { extractLabMarkers, extractTextFromPDF } from '@/app/api/extract/extractUtils'; // Using enhanced version

// Configure pdf.js worker
if (typeof window === 'undefined') {
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

    // Extract consent from fields
    const consentToResearch = fields.consentToResearch === 'true';
    
    // Extract demographics from fields (if provided)
    const demographics = fields.demographics ? 
      JSON.parse(fields.demographics as string) : {};

    console.log('[SERVER] File details:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size,
      consentToResearch
    });

    // Process file based on type
    let text = '';
    let extractionMethod = '';
    
    if (file.mimetype === 'application/pdf') {
      // Extract text from PDF using ENHANCED multi-tier extraction
      try {
        console.log('[SERVER] Starting enhanced PDF extraction...');
        text = await extractTextFromPDF(file.filepath);
        extractionMethod = 'Enhanced PDF extraction';
        
        console.log('[SERVER] Enhanced PDF extraction successful!');
        console.log('[SERVER] - Extracted text length:', text.length);
        console.log('[SERVER] - Text sample:', text.substring(0, 200) + '...');
        
      } catch (error) {
        console.error('Enhanced PDF extraction error:', error);
        return res.status(500).json({ 
          message: 'Failed to extract text from PDF using enhanced methods', 
          error: String(error) 
        });
      }
    } else if (file.mimetype === 'text/csv') {
      // Extract text from CSV - simply read the file
      try {
        text = fs.readFileSync(file.filepath, 'utf8');
        extractionMethod = 'CSV file read';
      } catch (error) {
        console.error('CSV reading error:', error);
        return res.status(500).json({ message: 'Failed to read CSV file', error: String(error) });
      }
    } else if (file.mimetype?.startsWith('image/')) {
      // For images, we'd typically use OCR
      text = 'Image OCR is coming soon. Please upload a PDF or CSV file.';
      return res.status(400).json({ message: 'Image OCR is coming soon. Please upload a PDF or CSV file.' });
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Redact PHI from text before processing
    const redactedText = redactPHI(text);
    
    // Extract lab markers using enhanced extraction
    let markers = [];
    try {
      console.log('[SERVER] Starting lab marker extraction from', redactedText.length, 'characters...');
      markers = await extractLabMarkers(redactedText);
      console.log('[SERVER] Successfully extracted', markers.length, 'lab markers');
      
      // Log marker details for debugging
      if (markers.length > 0) {
        console.log('[SERVER] Sample markers:', markers.slice(0, 3).map(m => 
          `${m.name} (${m.code}): ${m.value} ${m.unit}`
        ));
      }
      
    } catch (error) {
      console.error('Error extracting lab markers:', error);
      // Still return the text but note the extraction failure
      return res.status(200).json({ 
        text: redactedText, 
        markers: [], 
        extractionFailed: true,
        extractionMethod,
        message: 'Text extracted but lab marker extraction failed'
      });
    }
    
    // If user consented to research, save anonymized data
    if (consentToResearch && markers.length > 0) {
      const collectionDate = extractCollectionDate(redactedText);
      const anonymizedDemographics = anonymizeDemographics(demographics);
      
      console.log('[SERVER] Storing anonymized data with consent');
      
      // Save anonymized data (non-blocking)
      saveAnonymizedData({
        markers,
        demographics: anonymizedDemographics,
        source: 'upload',
        parseMethod: file.mimetype === 'application/pdf' ? 'enhanced_pdf' : 'csv',
        collectedAt: collectionDate,
      }).catch(err => {
        // Log error but don't fail the request
        console.error('Failed to save anonymized data:', err);
      });
    }

    // Return comprehensive results
    return res.status(200).json({ 
      text: redactedText,
      markers,
      markerCount: markers.length,
      extractionMethod,
      success: true,
      fileInfo: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype
      }
    });
    
  } catch (error) {
    console.error('Error in extract-text route:', error);
    return res.status(500).json({ 
      message: 'Failed to process file', 
      error: String(error) 
    });
  }
}
