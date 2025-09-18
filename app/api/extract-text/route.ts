// app/api/extract-text/route.ts - STEP 4: Simple text processing only
import { NextRequest, NextResponse } from 'next/server';

// Required for App Router
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[SERVER] Extract-text API called - STEP 4: Text processing only');
    
    // Get JSON data instead of form data
    const body = await request.json();
    const { redactedText, consentToResearch } = body;

    if (!redactedText) {
      return NextResponse.json({ 
        message: 'No text provided' 
      }, { status: 400 });
    }

    console.log('[SERVER] Received text for processing, length:', redactedText.length);
    console.log('[SERVER] Text sample:', redactedText.substring(0, 200) + '...');
    console.log('[SERVER] Consent to research:', consentToResearch);

    // For now, just return the text info - we'll add OpenAI processing next
    return NextResponse.json({ 
      message: 'Text processing successful',
      textLength: redactedText.length,
      textPreview: redactedText.substring(0, 200) + '...',
      success: true,
      markers: [], // Empty for now
      extractionMethod: 'Client-side extraction with server processing'
    });

  } catch (error) {
    console.error('[SERVER] API error:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
