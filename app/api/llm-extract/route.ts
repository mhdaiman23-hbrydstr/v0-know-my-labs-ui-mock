import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { redactedText, consentToResearch } = body;
    
    if (!redactedText) {
      return NextResponse.json({ message: 'No text provided' }, { status: 400 });
    }
    
    // Log the request for debugging
    console.log('[SERVER] LLM extract request received', { 
      textLength: redactedText.length,
      consentToResearch 
    });
    
    // Call Claude API
    try {
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4000,
          messages: [
            {
              role: "system",
              content: `You are a medical lab report analyzer. Extract laboratory test results from the text and format them as a structured JSON array.

Extract all lab test results including:
- Test code (abbreviation)
- Test name
- Numeric value
- Unit of measurement
- Reference range (when available)
- Category (e.g., "Lipid Panel", "CBC", "Metabolic Panel", etc.) if mentioned

IMPORTANT: DO NOT extract or include any patient identifiers, names, or personal information.
Only extract lab values and related medical information.

Ensure all numeric values are properly parsed as numbers, not strings.
If a value has scientific notation (e.g., 10^6), preserve that in the unit field.`
            },
            {
              role: "user",
              content: `Extract all lab test markers from this redacted lab report:

${redactedText}

Respond with valid JSON following this exact schema:
[
  {
    "code": "string (abbreviation for the test)",
    "name": "string (full name of the test)",
    "value": number,
    "unit": "string (unit of measurement)",
    "value_si": number,
    "unit_si": "string (SI unit of measurement)",
    "ref_range_low": number (optional),
    "ref_range_high": number (optional),
    "category": "string (optional, e.g. 'Lipid Panel', 'CBC')"
  }
]

Ensure all numeric values are numbers, not strings. For tests like "10^6/μL", put "10^6/μL" in the unit field.
Return ONLY valid JSON with no other text.`
            }
          ]
        })
      });
      
      if (!claudeResponse.ok) {
        console.error('[SERVER] Claude API error:', await claudeResponse.text());
        throw new Error(`Claude API error: ${claudeResponse.status}`);
      }
      
      const claudeData = await claudeResponse.json();
      console.log('[SERVER] Claude API response received');
      
      const content = claudeData.content[0].text;
      
      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse the JSON
      try {
        const markers = JSON.parse(cleanedContent);
        console.log('[SERVER] Successfully parsed markers:', markers.length);
        
        // Optional: Save anonymized data for research if consent given
        if (consentToResearch) {
          // Implementation for saving anonymized data
          console.log("[SERVER] Would save anonymized data with consent");
        }
        
        return NextResponse.json({ markers });
      } catch (parseError) {
        console.error("[SERVER] Error parsing Claude response:", parseError);
        console.error("[SERVER] Claude response content:", cleanedContent);
        return NextResponse.json(
          { message: 'Failed to parse markers from Claude response', error: String(parseError) },
          { status: 500 }
        );
      }
    } catch (claudeError) {
      console.error("[SERVER] Error calling Claude API:", claudeError);
      return NextResponse.json(
        { message: 'Error calling Claude API', error: String(claudeError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[SERVER] LLM extract error:", error);
    return NextResponse.json(
      { message: 'Error extracting markers with LLM', error: String(error) },
      { status: 500 }
    );
  }
}
