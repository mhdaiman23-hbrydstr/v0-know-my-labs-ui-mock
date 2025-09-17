import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFExtract } from 'pdf.js-extract';
import csv from 'csv-parser';
import { Readable } from 'stream';

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
      text = await extractTextFromPDF(file.filepath);
    } else if (file.mimetype === 'text/csv') {
      // Extract text from CSV
      text = await extractTextFromCSV(file.filepath);
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
    return res.status(500).json({ message: 'Failed to extract text from file' });
  }
}

// Function to extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(filePath);
    
    let fullText = '';
    
    // Process each page
    for (const page of data.pages) {
      // Process each content item (typically each text element)
      let pageText = '';
      let lastY = -1;
      let currentLine = '';
      
      // Sort content by y-position first, then x-position
      const sortedContent = [...page.content].sort((a, b) => {
        // Group items within a small y-range (5 units) as being on the same line
        if (Math.abs(a.y - b.y) < 5) {
          return a.x - b.x; // Same line, sort by x
        }
        return a.y - b.y; // Different lines, sort by y
      });
      
      for (const item of sortedContent) {
        // Check if we're starting a new line
        if (Math.abs(item.y - lastY) > 5 && lastY !== -1) {
          pageText += currentLine.trim() + '\n';
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
        pageText += currentLine.trim() + '\n';
      }
      
      fullText += pageText + '\n';
    }
    
    console.log('[SERVER] PDF text extracted, length:', fullText.length);
    
    // Try to extract structured data
    console.log('[SERVER] Starting multi-stage extraction...');
    const labValues = extractLabValuesFromText(fullText);
    
    console.log('[SERVER] Extraction complete. Found', labValues.length, 'lab values');
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Extract lab values from text using regex patterns
function extractLabValuesFromText(text: string): any[] {
  const labValues: any[] = [];
  
  // Try different extraction methods
  try {
    // Method 1: Look for structured test result patterns
    const testResultRegex = /([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*([A-Za-z\/%]+)?\s+(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/g;
    let match;
    
    while ((match = testResultRegex.exec(text)) !== null) {
      const testName = match[1].trim();
      const value = parseFloat(match[2]);
      const unit = match[3]?.trim() || '';
      const refLow = parseFloat(match[4]);
      const refHigh = parseFloat(match[5]);
      
      console.log('[SERVER] Table extraction -', testName);
      
      labValues.push({
        name: testName,
        value: value,
        unit: unit,
        ref_range_low: refLow,
        ref_range_high: refHigh
      });
    }
    
    // Method 2: Try to find common lab tests by name
    const commonLabTests = [
      { name: 'Hemoglobin', aliases: ['Haemoglobin', 'HGB', 'HB'] },
      { name: 'RBC', aliases: ['Red Blood Cell', 'Red Blood Cells', 'RBC Count'] },
      { name: 'WBC', aliases: ['White Blood Cell', 'White Blood Cells', 'WBC Count', 'Total WBC'] },
      { name: 'Glucose', aliases: ['Fasting Blood Sugar', 'FBS', 'Blood Glucose'] },
      { name: 'Creatinine', aliases: ['CREAT', 'Serum Creatinine'] },
      { name: 'Calcium', aliases: ['CA', 'Serum Calcium'] },
      // Add more as needed
    ];
    
    for (const test of commonLabTests) {
      const patterns = [test.name, ...test.aliases];
      
      for (const pattern of patterns) {
        // Look for the test name followed by a number
        const regex = new RegExp(`${pattern}[\\s:]*([0-9.]+)\\s*([A-Za-z/%\\^\\s\\-\\.]+)?`, 'i');
        const match = text.match(regex);
        
        if (match) {
          console.log('[SERVER] Extracted:', test.name);
          
          // Try to find reference range near this match
          const refRangeRegex = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;
          const surroundingText = text.substring(
            Math.max(0, text.indexOf(match[0]) - 100),
            Math.min(text.length, text.indexOf(match[0]) + match[0].length + 100)
          );
          const refMatch = surroundingText.match(refRangeRegex);
          
          labValues.push({
            name: test.name,
            value: parseFloat(match[1]),
            unit: match[2]?.trim() || '',
            ref_range_low: refMatch ? parseFloat(refMatch[1]) : undefined,
            ref_range_high: refMatch ? parseFloat(refMatch[2]) : undefined
          });
          
          // Found a match, move to next test
          break;
        }
      }
    }
  } catch (error) {
    console.error('[SERVER] Error in lab value extraction:', error);
  }
  
  return labValues;
}

// Function to extract text from CSV
async function extractTextFromCSV(filePath: string): Promise<string> {
  try {
    const rows: any[] = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: any) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
    
    // Convert rows to text
    let text = '';
    
    // Get headers from first row
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      text += headers.join(',') + '\n';
      
      // Add rows
      for (const row of rows) {
        text += Object.values(row).join(',') + '\n';
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    throw error;
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Configure pdf.js worker
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
if (typeof window === 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
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
      text = await extractTextFromPDF(file.filepath);
    } else if (file.mimetype === 'text/csv') {
      // Extract text from CSV
      text = await extractTextFromCSV(file.filepath);
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
    return res.status(500).json({ message: 'Failed to extract text from file' });
  }
}

// Function to extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Load the PDF file
    const data = await pdfjs.getDocument(filePath).promise;
    console.log('[SERVER] PDF text extracted, length:', data.numPages);
    
    // Extract text from each page
    let fullText = '';
    
    for (let i = 1; i <= data.numPages; i++) {
      const page = await data.getPage(i);
      const content = await page.getTextContent();
      
      // Build text from content items, preserving layout
      let lastY: number | null = null;
      let text = '';
      
      for (const item of content.items) {
        const textItem = item as any;
        
        // Check if we need to add a newline (if Y position changed significantly)
        if (lastY !== null && Math.abs(textItem.transform[5] - lastY) > 5) {
          text += '\n';
        }
        
        // Add the text content
        text += textItem.str;
        
        // If the item ends with a space, add one
        if (!textItem.str.endsWith(' ') && !textItem.str.endsWith('\n')) {
          text += ' ';
        }
        
        // Update the last Y position
        lastY = textItem.transform[5];
      }
      
      fullText += text + '\n\n';
    }
    
    // Special handling for lab reports
    console.log('[SERVER] Starting multi-stage extraction...');
    
    // Stage 1: Try to extract structured data using pattern matching
    let labData = extractLabData(fullText);
    
    if (labData.length < 5) {
      console.log('[SERVER] Stage 1 found few results, trying line-by-line...');
      
      // Stage 2: Extract data line by line
      const lines = fullText.split('\n');
      let lineLabData = extractLabDataFromLines(lines);
      
      if (lineLabData.length > labData.length) {
        labData = lineLabData;
      }
      
      // Stage 3: Try table extraction for specific formats
      console.log('[SERVER] Trying table extraction...');
      const tableData = extractLabDataFromTables(fullText);
      
      // Combine all extracted data
      if (tableData.length > 0) {
        for (const item of tableData) {
          if (!labData.some(existing => existing.name === item.name)) {
            labData.push(item);
          }
        }
      }
    }
    
    // Add extracted structured data to the text
    if (labData.length > 0) {
      fullText += '\n\nEXTRACTED_STRUCTURED_DATA:\n';
      fullText += JSON.stringify(labData, null, 2);
    }
    
    console.log('[SERVER] Extraction complete. Found', labData.length, 'lab values');
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Function to extract text from CSV
async function extractTextFromCSV(filePath: string): Promise<string> {
  try {
    const fs = require('fs');
    const stream = fs.createReadStream(filePath);
    
    const rows: any[] = [];
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row: any) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
    
    // Convert rows to text
    let text = '';
    
    // Get headers from first row
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      text += headers.join(',') + '\n';
      
      // Add rows
      for (const row of rows) {
        text += Object.values(row).join(',') + '\n';
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    throw error;
  }
}

// Extract lab data using pattern matching
function extractLabData(text: string): any[] {
  const labData: any[] = [];
  
  // Regular expression to match lab test patterns
  // Look for patterns like "Test Name: 5.2 mg/dL (3.5-5.5)"
  const regex = /([A-Za-z\s\-]+):\s*(\d+\.?\d*)\s*([A-Za-z\/%]+)?\s*\((\d+\.?\d*)\s*-\s*(\d+\.?\d*)\)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    labData.push({
      name: match[1].trim(),
      value: parseFloat(match[2]),
      unit: match[3]?.trim() || '',
      ref_range_low: parseFloat(match[4]),
      ref_range_high: parseFloat(match[5])
    });
  }
  
  return labData;
}

// Extract lab data from lines
function extractLabDataFromLines(lines: string[]): any[] {
  const labData: any[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Look for lines with test name, value, and reference range
    // Common pattern: Test name followed by value and unit, then reference range
    const valueRegex = /^([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*([A-Za-z\/%]+)?\s+(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;
    const valueMatch = line.match(valueRegex);
    
    if (valueMatch) {
      labData.push({
        name: valueMatch[1].trim(),
        value: parseFloat(valueMatch[2]),
        unit: valueMatch[3]?.trim() || '',
        ref_range_low: parseFloat(valueMatch[4]),
        ref_range_high: parseFloat(valueMatch[5])
      });
      continue;
    }
    
    // Look for lines with test name followed by value and unit
    const simpleRegex = /^([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*([A-Za-z\/%]+)/;
    const simpleMatch = line.match(simpleRegex);
    
    if (simpleMatch) {
      // Check if the next line might contain reference range
      let refLow = null;
      let refHigh = null;
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const refRangeRegex = /\(?\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*\)?/;
        const refMatch = nextLine.match(refRangeRegex);
        
        if (refMatch) {
          refLow = parseFloat(refMatch[1]);
          refHigh = parseFloat(refMatch[2]);
        }
      }
      
      labData.push({
        name: simpleMatch[1].trim(),
        value: parseFloat(simpleMatch[2]),
        unit: simpleMatch[3]?.trim() || '',
        ref_range_low: refLow,
        ref_range_high: refHigh
      });
    }
  }
  
  return labData;
}

// Extract lab data from tables (specifically for Aster Diagnostic format)
function extractLabDataFromTables(text: string): any[] {
  const labData: any[] = [];
  
  // Try to identify common lab tests and their patterns
  const labTests = [
    { name: 'Haemoglobin', code: 'HGB', patterns: ['Haemoglobin', 'HGB', 'HB'] },
    { name: 'Red Blood Cell', code: 'RBC', patterns: ['RBC', 'Red Blood Cell'] },
    { name: 'White Blood Cell', code: 'WBC', patterns: ['WBC', 'White Blood Cell', 'Total WBC Count'] },
    { name: 'Platelet', code: 'PLT', patterns: ['Platelet', 'PLT'] },
    { name: 'Hematocrit', code: 'HCT', patterns: ['Hematocrit', 'HCT'] },
    { name: 'Mean Corpuscular Volume', code: 'MCV', patterns: ['MCV', 'Mean Corpuscular Volume'] },
    { name: 'Mean Corpuscular Hemoglobin', code: 'MCH', patterns: ['MCH', 'Mean Corpuscular Hemoglobin'] },
    { name: 'Mean Corpuscular Hemoglobin Concentration', code: 'MCHC', patterns: ['MCHC'] },
    { name: 'Neutrophils', code: 'NEUT', patterns: ['Neutrophils'] },
    { name: 'Lymphocytes', code: 'LYMPH', patterns: ['Lymphocytes'] },
    { name: 'Monocytes', code: 'MONO', patterns: ['Monocytes'] },
    { name: 'Eosinophils', code: 'EOS', patterns: ['Eosinophils'] },
    { name: 'Basophils', code: 'BASO', patterns: ['Basophils'] },
    { name: 'Glucose', code: 'GLU', patterns: ['Glucose', 'Fasting Blood Sugar', 'FBS'] },
    { name: 'Creatinine', code: 'CREAT', patterns: ['Creatinine'] },
    { name: 'Uric Acid', code: 'UA', patterns: ['Uric Acid'] },
    { name: 'Calcium', code: 'CA', patterns: ['Calcium'] },
    { name: 'SGOT (AST)', code: 'AST', patterns: ['SGOT', 'AST'] },
    { name: 'SGPT (ALT)', code: 'ALT', patterns: ['SGPT', 'ALT'] },
    { name: 'C-Reactive Protein', code: 'CRP', patterns: ['CRP', 'C Reactive Protein', 'C-Reactive Protein'] },
  ];
  
  // For each lab test, try to find its data in the text
  for (const test of labTests) {
    for (const pattern of test.patterns) {
      // Create regex patterns for different table formats
      const asterRegex = new RegExp(`${pattern}\\s+(\\d+\\.\\d+)\\s+([HL])?\\s+(\\d+(?:\\.\\d+)?\\s*-\\s*\\d+(?:\\.\\d+)?)\\s+([A-Za-z0-9\\/%\\^\\s\\-\\.]+)`, 'i');
      const match = text.match(asterRegex);
      
      if (match) {
        console.log(`[SERVER] Table extraction - ${test.code}: ${match.length}`);
        
        // Extract reference range
        const refRange = match[3].split('-');
        const refLow = parseFloat(refRange[0].trim());
        const refHigh = parseFloat(refRange[1].trim());
        
        labData.push({
          name: test.name,
          code: test.code,
          value: parseFloat(match[1]),
          flag: match[2] || null,
          unit: match[4].trim(),
          ref_range_low: refLow,
          ref_range_high: refHigh
        });
        
        // Once found, break to avoid duplicates
        break;
      }
    }
  }
  
  return labData;
}
