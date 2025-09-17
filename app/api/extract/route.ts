import { NextRequest, NextResponse } from 'next/server';

// This is needed for App Router
export const dynamic = 'force-dynamic';

// Mock lab data - this will be returned for any file upload
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
    code: "WBC",
    name: "White Blood Cell Count",
    value: 6.61,
    unit: "10^3/μL",
    value_si: 6.61,
    unit_si: "10^9/L",
    ref_range_low: 4.0,
    ref_range_high: 11.0,
    category: "CBC"
  },
  {
    code: "PLT",
    name: "Platelet Count",
    value: 297.2,
    unit: "10^3/μL",
    value_si: 297.2,
    unit_si: "10^9/L",
    ref_range_low: 150,
    ref_range_high: 450,
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
  },
  {
    code: "AST",
    name: "AST (SGOT)",
    value: 21.1,
    unit: "U/L",
    value_si: 21.1,
    unit_si: "U/L",
    ref_range_low: 0,
    ref_range_high: 35,
    category: "Liver Function"
  },
  {
    code: "ALT",
    name: "ALT (SGPT)",
    value: 18.8,
    unit: "U/L",
    value_si: 18.8,
    unit_si: "U/L",
    ref_range_low: 0,
    ref_range_high: 45,
    category: "Liver Function"
  },
  {
    code: "UA",
    name: "Uric Acid",
    value: 6.8,
    unit: "mg/dL",
    value_si: 404.5,
    unit_si: "μmol/L",
    ref_range_low: 3.5,
    ref_range_high: 7.2,
    category: "Chemistry"
  }
];

// POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[API] Extract API called');
    
    // Don't even attempt to parse the form data or process files
    // Just immediately return mock data
    
    console.log('[API] Returning mock data');
    
    return NextResponse.json({ 
      labs: mockLabData,
      message: "Mock data returned - file processing bypassed"
    });
  } catch (error) {
    console.error('[API] Error in extract API:', error);
    
    // Return proper JSON error response
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
