import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// This is needed for App Router
export const dynamic = 'force-dynamic';

// Mock lab data to ensure the API returns something
const mockLabData = [
  {
    code: "HGB",
    name: "Hemoglobin",
    value: 14.3,
    unit: "g/dL",
    value_si: 143,
    unit_si: "g/L",
    ref_range_low: 13.5,
    ref_range_high: 18.0,
    category: "CBC"
  },
  {
    code: "RBC",
    name: "Red Blood Cell Count",
    value: 5.17,
    unit: "10^6/μL",
    value_si: 5.17,
    unit_si: "10^12/L",
    ref_range_low: 4.5,
    ref_range_high: 5.5,
    category: "CBC"
  },
  {
    code: "GLU",
    name: "Glucose",
    value: 89.2,
    unit: "mg/dL",
    value_si: 4.95,
    unit_si: "mmol/L",
    ref_range_low: 70,
    ref_range_high: 100,
    category: "Chemistry"
  },
  {
    code: "CREAT",
    name: "Creatinine",
    value: 1.17,
    unit: "mg/dL",
    value_si: 103.5,
    unit_si: "μmol/L",
    ref_range_low: 0.59,
    ref_range_high: 1.3,
    category: "Chemistry"
  },
  {
    code: "CA",
    name: "Calcium",
    value: 10.34,
    unit: "mg/dL",
    value_si: 2.58,
    unit_si: "mmol/L",
    ref_range_low: 8.6,
    ref_range_high: 10.3,
    category: "Chemistry"
  }
];

// POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API] Extract API called');
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        error: 'No file uploaded' 
      }, { status: 400 });
    }
    
    console.log('[API] File received:', file.name, file.type, file.size);
    
    // Instead of processing the file, just return mock data
    // This helps us check if the front-end communication is working correctly
    
    // Simulating a slight delay to mimic processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[API] Returning mock data for testing');
    
    // Return the mock lab markers
    return NextResponse.json({ 
      labs: mockLabData,
      message: "Mock data returned for testing"
    });
  } catch (error) {
    console.error('[API] Error in extract API:', error);
    
    // Return proper JSON error response
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
