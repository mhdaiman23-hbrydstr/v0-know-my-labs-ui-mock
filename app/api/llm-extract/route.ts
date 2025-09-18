// REVERT your /api/llm-extract/route.ts to use OpenAI again but with truncation
// Replace your current llm-extract route with this:

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
    
    // TRUNCATE the text to fit within OpenAI's limits
    // Keep the first 12000 characters which should contain most lab values
    const truncatedText = redactedText.length > 12000 ? 
      redactedText.substring(0, 12000) + "\n[Text truncated for processing...]" : 
      redactedText;
    
    console.log('[SERVER] Original text length:', redactedText.length);
    console.log('[SERVER] Truncated text length:', truncatedText.length);
    console.log('[SERVER] Text sample:', truncatedText.substring(0, 200) + '...');
    
    // Check OpenAI API key
    console.log('[SERVER] OpenAI API Key present:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('[SERVER] OpenAI API Key length:', process.env.OPENAI_API_KEY?.length || 0);

    // Call OpenAI API with truncated text
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

Focus on common lab tests like:
- Complete Blood Count (CBC): Hemoglobin, Hematocrit, WBC, RBC, Platelets, MCV, MCH, MCHC
- Chemistry: Glucose, Creatinine, BUN, Sodium, Potassium, Chloride
- Liver: ALT, AST, Bilirubin
- Lipids: Total Cholesterol, HDL, LDL, Triglycerides
- Other: CRP, ESR

IMPORTANT: DO NOT extract or include any patient identifiers, names, or personal information.
Only extract lab values and related medical information.

Ensure all numeric values are properly parsed as numbers, not strings.`
            },
            {
              role: "user",
              content: `Extract all lab test markers from this lab report (text may be truncated):

${truncatedText}

Respond with valid JSON following this exact schema:
[
  {
    "code": "string (abbreviation for the test)",
    "name": "string (full name of the test)",
    "value": number,
    "unit": "string (unit of measurement)",
    "ref_range_low": number (optional),
    "ref_range_high": number (optional),
    "category": "string (optional, e.g. 'Lipid Panel', 'CBC')"
  }
]

Return ONLY valid JSON with no other text.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });
      
      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('[SERVER] OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }
      
      const openaiData = await openaiResponse.json();
      console.log('[SERVER] OpenAI API response received');
      
      // Extract content from OpenAI response
      const content = openaiData.choices[0].message.content;
      
      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse the JSON
      try {
        const markers = JSON.parse(cleanedContent);
        console.log('[SERVER] Successfully parsed markers:', markers.length);
        
        // Log some sample markers for debugging
        if (markers.length > 0) {
          console.log('[SERVER] Sample markers:', markers.slice(0, 3).map((m: any) => 
            `${m.name}: ${m.value} ${m.unit}`
          ));
        }
        
        // Optional: Save anonymized data for research if consent given
        if (consentToResearch) {
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
