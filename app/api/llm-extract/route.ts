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
    
    // Check OpenAI API key
    console.log('[SERVER] OpenAI API Key present:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('[SERVER] OpenAI API Key length:', process.env.OPENAI_API_KEY?.length || 0);

    // Call OpenAI API
    try {
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY || ""}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
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
      
      if (!openaiResponse.ok) {
        console.error('[SERVER] OpenAI API error:', await openaiResponse.text());
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }
      
      const openaiData = await openaiResponse.json();
      console.log('[SERVER] OpenAI API response received');
      
      // Extract content from OpenAI response (different structure than Claude)
      const content = openaiData.choices[0].message.content;
      
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
        console.error("[SERVER] Error parsing OpenAI response:", parseError);
        console.error("[SERVER] OpenAI response content:", cleanedContent);
        return NextResponse.json(
          { message: 'Failed to parse markers from OpenAI response', error: String(parseError) },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error("[SERVER] Error calling OpenAI API:", apiError);
      return NextResponse.json(
        { message: 'Error calling OpenAI API', error: String(apiError) },
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
