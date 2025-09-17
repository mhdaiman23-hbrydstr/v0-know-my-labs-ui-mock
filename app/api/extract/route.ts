/**
 * This file provides utility functions for extracting text and structured data
 * from various file formats. It's used by the API endpoints for processing
 * uploaded files.
 */

// Define interfaces for extracted lab values
export interface LabMarker {
  code?: string;
  name: string;
  value: number;
  unit: string;
  value_si?: number;
  unit_si?: string;
  ref_range_low?: number;
  ref_range_high?: number;
  category?: string;
  collection_date?: string;
  flag?: string;
}

/**
 * Extract lab markers from text using pattern matching.
 * @param text The text to extract from
 * @returns Array of extracted lab markers
 */
export function extractLabMarkersFromText(text: string): LabMarker[] {
  const labMarkers: LabMarker[] = [];
  
  try {
    // Method 1: Look for structured test result patterns (most common format)
    // Format: Test Name | Value | Unit | Reference Range
    const testResultRegex = /([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*([HL])?\s*([A-Za-z\/%]+)?\s+(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/g;
    let match;
    
    while ((match = testResultRegex.exec(text)) !== null) {
      const testName = match[1].trim();
      const value = parseFloat(match[2]);
      const flag = match[3] || undefined;
      const unit = match[4]?.trim() || '';
      const refLow = parseFloat(match[5]);
      const refHigh = parseFloat(match[6]);
      
      // Derive a code from the test name if possible
      const code = deriveCodeFromName(testName);
      
      labMarkers.push({
        code,
        name: testName,
        value,
        unit,
        ref_range_low: refLow,
        ref_range_high: refHigh,
        flag
      });
    }
    
    // Method 2: Try to find specific lab tests by name and pattern
    // This helps with formats that don't follow the standard layout
    const commonLabTests = [
      { name: 'Hemoglobin', code: 'HGB', aliases: ['Haemoglobin', 'HGB', 'HB'] },
      { name: 'Red Blood Cell Count', code: 'RBC', aliases: ['Red Blood Cell', 'Red Blood Cells', 'RBC'] },
      { name: 'White Blood Cell Count', code: 'WBC', aliases: ['White Blood Cell', 'White Blood Cells', 'WBC', 'Total WBC Count'] },
      { name: 'Platelet Count', code: 'PLT', aliases: ['Platelet', 'Platelets', 'PLT'] },
      { name: 'Hematocrit', code: 'HCT', aliases: ['Hematocrit', 'HCT'] },
      { name: 'Mean Corpuscular Volume', code: 'MCV', aliases: ['MCV'] },
      { name: 'Mean Corpuscular Hemoglobin', code: 'MCH', aliases: ['MCH'] },
      { name: 'Mean Corpuscular Hemoglobin Concentration', code: 'MCHC', aliases: ['MCHC'] },
      { name: 'Glucose', code: 'GLU', aliases: ['Fasting Blood Sugar', 'FBS', 'Blood Glucose', 'Glucose'] },
      { name: 'Creatinine', code: 'CREAT', aliases: ['CREAT', 'Serum Creatinine', 'Creatinine'] },
      { name: 'Blood Urea Nitrogen', code: 'BUN', aliases: ['BUN', 'Urea', 'Urea Nitrogen'] },
      { name: 'Calcium', code: 'CA', aliases: ['CA', 'Serum Calcium', 'Calcium'] },
      { name: 'AST', code: 'AST', aliases: ['SGOT', 'AST', 'SGOT (AST)'] },
      { name: 'ALT', code: 'ALT', aliases: ['SGPT', 'ALT', 'SGPT (ALT)'] },
      { name: 'Uric Acid', code: 'UA', aliases: ['Uric Acid'] },
      { name: 'C-Reactive Protein', code: 'CRP', aliases: ['CRP', 'C-Reactive Protein'] },
    ];
    
    for (const test of commonLabTests) {
      // Skip if we already found this test
      if (labMarkers.some(marker => marker.code === test.code)) {
        continue;
      }
      
      const patterns = [test.name, ...test.aliases];
      
      for (const pattern of patterns) {
        // Look for pattern: Test Name followed by value and possibly unit
        // This regex looks for test name followed by a number, and optionally a unit
        const regex = new RegExp(`${pattern}[\\s:]*([0-9.]+)\\s*([HL])?\\s*([A-Za-z/%\\^\\s\\-\\.]+)?`, 'i');
        const match = text.match(regex);
        
        if (match) {
          // Try to find a reference range near this match
          const refRangeRegex = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;
          const surroundingText = text.substring(
            Math.max(0, text.indexOf(match[0]) - 100),
            Math.min(text.length, text.indexOf(match[0]) + match[0].length + 100)
          );
          const refMatch = surroundingText.match(refRangeRegex);
          
          labMarkers.push({
            code: test.code,
            name: test.name,
            value: parseFloat(match[1]),
            flag: match[2] || undefined,
            unit: match[3]?.trim() || '',
            ref_range_low: refMatch ? parseFloat(refMatch[1]) : undefined,
            ref_range_high: refMatch ? parseFloat(refMatch[2]) : undefined
          });
          
          // Found a match, move to next test
          break;
        }
      }
    }
    
    // Method 3: Try to detect a table structure by looking at lines
    const lines = text.split('\n');
    
    // Look for lines that might be table rows
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Match pattern: Word(s) followed by number, possibly flag, unit, and reference range
      const tableRowRegex = /^([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*([HL])?\s+([A-Za-z\/%]+)?\s+(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;
      const match = line.match(tableRowRegex);
      
      if (match) {
        const testName = match[1].trim();
        
        // Skip if this test is already in the results
        if (labMarkers.some(marker => marker.name === testName)) {
          continue;
        }
        
        const value = parseFloat(match[2]);
        const flag = match[3] || undefined;
        const unit = match[4]?.trim() || '';
        const refLow = parseFloat(match[5]);
        const refHigh = parseFloat(match[6]);
        
        // Derive a code from the test name
        const code = deriveCodeFromName(testName);
        
        labMarkers.push({
          code,
          name: testName,
          value,
          unit,
          ref_range_low: refLow,
          ref_range_high: refHigh,
          flag
        });
      }
    }
    
  } catch (error) {
    console.error('Error extracting lab markers:', error);
  }
  
  return labMarkers;
}

/**
 * Try to derive a test code from a test name
 * @param name The test name
 * @returns The derived code or undefined
 */
function deriveCodeFromName(name: string): string | undefined {
  // Common mappings
  const codeMap: Record<string, string> = {
    'hemoglobin': 'HGB',
    'haemoglobin': 'HGB',
    'hgb': 'HGB',
    'hb': 'HGB',
    'red blood cell': 'RBC',
    'rbc': 'RBC',
    'white blood cell': 'WBC',
    'wbc': 'WBC',
    'platelet': 'PLT',
    'plt': 'PLT',
    'hematocrit': 'HCT',
    'haematocrit': 'HCT',
    'hct': 'HCT',
    'mean corpuscular volume': 'MCV',
    'mcv': 'MCV',
    'mean corpuscular hemoglobin': 'MCH',
    'mch': 'MCH',
    'mean corpuscular hemoglobin concentration': 'MCHC',
    'mchc': 'MCHC',
    'glucose': 'GLU',
    'fasting blood sugar': 'GLU',
    'fbs': 'GLU',
    'creatinine': 'CREAT',
    'creat': 'CREAT',
    'blood urea nitrogen': 'BUN',
    'bun': 'BUN',
    'urea': 'BUN',
    'calcium': 'CA',
    'ca': 'CA',
    'sgot': 'AST',
    'ast': 'AST',
    'sgpt': 'ALT',
    'alt': 'ALT',
    'uric acid': 'UA',
    'c-reactive protein': 'CRP',
    'crp': 'CRP',
  };
  
  // First try to match the whole name
  const normalizedName = name.toLowerCase().trim();
  if (codeMap[normalizedName]) {
    return codeMap[normalizedName];
  }
  
  // Try to match parts of the name
  for (const [key, value] of Object.entries(codeMap)) {
    if (normalizedName.includes(key)) {
      return value;
    }
  }
  
  // If no match found, return the first letters of each word
  const words = name.split(/\s+/);
  if (words.length > 0) {
    if (words.length === 1) {
      // For single words, return first 3-4 chars uppercase
      return words[0].substring(0, Math.min(4, words[0].length)).toUpperCase();
    } else {
      // For multiple words, return first letter of each word
      return words.map(word => word[0]).join('').toUpperCase();
    }
  }
  
  return undefined;
}
