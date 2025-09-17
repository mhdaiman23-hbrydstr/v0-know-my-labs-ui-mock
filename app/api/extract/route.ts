import { NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';
import Papa from 'papaparse';
import { markerCatalog } from '@/lib/marker-catalog';
import { toSI } from '@/lib/units';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Type definitions
type Lab = {
  panel: string;
  code: string;
  name: string;
  value_raw: string;
  unit_raw: string;
  value_si: number | null;
  unit_si: string;
  confidence: number;
};

export async function POST(req: NextRequest) {
  console.log('Extract API called');
  try {
    // Check if the request is multipart form data
    const contentType = req.headers.get('content-type') || '';
    console.log('Content type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      console.log('Invalid content type');
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse form data and get file
    console.log('Parsing form data...');
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const panels = formData.get('panels') as string || '';
    const selectedPanels = panels ? panels.split(',') : ['general'];
    
    console.log('File received:', file?.name);
    console.log('Selected panels:', selectedPanels);

    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Process file based on type
    console.log('Converting file to buffer...');
    const fileBuffer = await file.arrayBuffer();
    console.log('File buffer size:', fileBuffer.byteLength);
    
    let textContent = '';

    if (file.name.toLowerCase().endsWith('.pdf')) {
      // Parse PDF
      console.log('Parsing PDF file...');
      try {
        const pdfData = await pdfParse(Buffer.from(fileBuffer));
        console.log('PDF parsed successfully. Text length:', pdfData.text.length);
        textContent = pdfData.text;
        console.log('First 100 chars of text:', textContent.substring(0, 100));
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to parse PDF file', details: pdfError.message },
          { status: 500 }
        );
      }
    } else if (
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/csv'
    ) {
      // Parse CSV
      console.log('Parsing CSV file...');
      try {
        const csvText = new TextDecoder().decode(fileBuffer);
        const result = Papa.parse(csvText, { header: true });
        console.log('CSV parsed successfully. Row count:', result.data.length);
        
        // Convert CSV data to text format for processing
        textContent = result.data
          .map(row => {
            const values = Object.values(row);
            return values.join(' ');
          })
          .join('\n');
        console.log('First 100 chars of processed CSV:', textContent.substring(0, 100));
      } catch (csvError) {
        console.error('CSV parsing error:', csvError);
        return NextResponse.json(
          { error: 'Failed to parse CSV file', details: csvError.message },
          { status: 500 }
        );
      }
    } else {
      console.log('Unsupported file type');
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or CSV file.' },
        { status: 400 }
      );
    }

    // Extract lab results from text content
    console.log('Extracting lab markers...');
    console.log('Text content length:', textContent.length);
    console.log('Marker catalog size:', markerCatalog.length);
    
    const labs = extractLabMarkers(textContent, selectedPanels);
    console.log('Extraction complete. Found markers:', labs.length);

    return NextResponse.json({ labs });
  } catch (error) {
    console.error('Unhandled error in extract API:', error);
    return NextResponse.json(
      { error: 'Failed to extract lab data', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

function extractLabMarkers(text: string, selectedPanels: string[]): Lab[] {
  console.log('Starting marker extraction...');
  const lines = text.split('\n').map(line => line.trim());
  console.log('Line count:', lines.length);
  
  const results: Lab[] = [];
  const unrecognized: string[] = [];

  // Process each line
  lines.forEach((line, index) => {
    if (!line) return;
    if (index < 10) console.log('Processing line:', line);
    
    let matched = false;

    // Check against each marker in the catalog
    for (const marker of markerCatalog) {
      // Skip markers that aren't in the selected panels
      if (!selectedPanels.includes(marker.panel)) continue;

      // Check if line contains any synonym
      const hasSynonym = marker.synonyms.some(syn => 
        line.toLowerCase().includes(syn.toLowerCase())
      );

      // Check if line matches any regex
      const matchesRegex = marker.regexes.some(regexStr => {
        try {
          const regex = new RegExp(regexStr, 'i');
          return regex.test(line);
        } catch (regexError) {
          console.error('Invalid regex:', regexStr, regexError);
          return false;
        }
      });

      if (hasSynonym || matchesRegex) {
        // Log the match for debugging
        if (hasSynonym) console.log('Synonym match:', marker.name, line);
        if (matchesRegex) console.log('Regex match:', marker.name, line);
        
        // Extract value and unit using regex
        // This regex looks for a number followed by optional whitespace and then a unit
        const valueUnitRegex = /(\d+\.?\d*)\s*([a-zA-Z%\/]+)?/;
        const match = line.match(valueUnitRegex);

        if (match) {
          console.log('Value/unit match:', match[1], match[2] || '');
          
          const value_raw = match[1];
          const unit_raw = match[2] || '';

          // Check if the unit is allowed for this marker
          const isUnitAllowed = !unit_raw || marker.units_allowed.some(u => 
            u.toLowerCase() === unit_raw.toLowerCase()
          );

          if (isUnitAllowed) {
            // Convert to SI units
            try {
              const { value: value_si, unit: unit_si } = toSI(
                marker.code,
                parseFloat(value_raw),
                unit_raw || marker.unit_canonical
              );
              
              results.push({
                panel: marker.panel,
                code: marker.code,
                name: marker.name,
                value_raw,
                unit_raw: unit_raw || marker.unit_canonical,
                value_si,
                unit_si,
                confidence: hasSynonym ? 0.9 : (matchesRegex ? 0.8 : 0.6)
              });
              
              console.log('Added marker:', marker.code, value_raw, value_si);
              matched = true;
              break;
            } catch (conversionError) {
              console.error('SI conversion error:', conversionError);
            }
          } else {
            console.log('Unit not allowed:', unit_raw, 'for marker', marker.code);
          }
        } else {
          console.log('No value/unit found in line:', line);
        }
      }
    }

    if (!matched && line.length > 10 && /\d+/.test(line)) {
      // Line contains numbers but wasn't matched
      console.log('Unrecognized line with numbers:', line);
      unrecognized.push(line);
    }
  });

  // Add unrecognized lines with low confidence if they look like they might be lab results
  unrecognized.forEach(line => {
    const valueUnitRegex = /(\d+\.?\d*)\s*([a-zA-Z%\/\^0-9\*\(\)]+)?/;
    const match = line.match(valueUnitRegex);
    
    if (match) {
      console.log('Adding unrecognized line as marker:', line);
      results.push({
        panel: 'unrecognized',
        code: 'UNKNOWN',
        name: line.replace(valueUnitRegex, '').trim(),
        value_raw: match[1],
        unit_raw: match[2] || '',
        value_si: parseFloat(match[1]),
        unit_si: match[2] || '',
        confidence: 0.3
      });
    }
  });

  console.log('Extraction finished. Total markers found:', results.length);
  return results;
}
