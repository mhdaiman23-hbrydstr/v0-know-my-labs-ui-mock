import type { NextApiRequest, NextApiResponse } from 'next';
import { convertToSI } from '../../lib/units';

// Define the interface for lab markers
interface LabMarker {
  code: string;
  name: string;
  value: number;
  unit: string;
  value_si?: number;
  unit_si?: string;
  ref_range_low?: number;
  ref_range_high?: number;
  category?: string;
  collection_date?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { redactedText } = req.body;

    if (!redactedText) {
      return res.status(400).json({ message: 'Missing redactedText parameter' });
    }

    console.log('[SERVER] Received redacted text, length:', redactedText.length);

    // Extract lab markers using Claude
    const markers = await extractMarkersWithClaude(redactedText);
    
    // Now we normalize all values to SI units
    const normalizedMarkers = markers.map(marker => {
      // Skip if value or unit is missing
      if (marker.value === undefined || !marker.unit) {
        return marker;
      }
      
      // Convert to SI units
      const { value_si, unit_si } = convertToSI(marker.code, marker.value, marker.unit);
      
      // Return the marker with SI values added
      return {
        ...marker,
        value_si,
        unit_si
      };
    });
    
    console.log('[SERVER] Normalized markers:', normalizedMarkers.length);
    
    return res.status(200).json({ markers: normalizedMarkers });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
}

// Extract lab markers using Claude
async function extractMarkersWithClaude(text: string): Promise<LabMarker[]> {
  try {
    console.log('[SERVER] Calling Claude API...');
    
    // Call Claude to extract lab markers
    const prompt = {
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are a medical lab report analyzer. Your task is to extract laboratory test results from a text document and format them in a structured JSON format. 

The input is a redacted lab report where personal identifiers have been removed. Extract all lab test results including:
- Test code (abbreviation)
- Test name
- Numeric value
- Unit of measurement
- Reference range (when available)
- Category (e.g., "Lipid Panel", "CBC", "Metabolic Panel", etc.) if mentioned
- Collection date if available

Follow these guidelines:
- Extract ONLY lab test results with numerical values
- Ignore any personal information
- If there are multiple values for the same test on different dates, include them separately with their respective dates
- Ensure all numeric values are properly parsed as numbers
- For reference ranges, extract both low and high values when available
- Be precise with unit extraction, preserving the exact format`
        },
        {
          role: "user",
          content: `Extract all lab test markers from the following redacted text. Format your response as a JSON array of lab markers.

${text}

Respond with valid JSON following this exact schema:
[
  {
    "code": "string (abbreviation for the test)",
    "name": "string (full name of the test)",
    "value": number,
    "unit": "string (unit of measurement)",
    "ref_range_low": number (optional),
    "ref_range_high": number (optional),
    "category": "string (optional, e.g. 'Lipid Panel', 'CBC')",
    "collection_date": "string (optional, in YYYY-MM-DD format if available)"
  }
]

Do not include any text outside the JSON array. Ensure all values and units are accurately extracted.`
        }
      ]
    };

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      throw new Error("Error calling Claude API");
    }

    const data = await response.json();
    
    // Extract and parse the JSON response
    const content = data.content[0].text;
    
    // Remove any markdown backticks if present
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    console.log('[SERVER] Claude response:', cleanedContent.substring(0, 100) + '...');
    
    try {
      const extractedMarkers = JSON.parse(cleanedContent) as LabMarker[];
      
      // Validate the markers
      if (!Array.isArray(extractedMarkers)) {
        throw new Error('Invalid response format. Expected an array.');
      }
      
      console.log('[SERVER] Successfully parsed markers:', extractedMarkers.length);
      return extractedMarkers;
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      console.error("Response content:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse Claude response");
    }
  } catch (error) {
    console.error("Error in extractMarkersWithClaude:", error);
    // Return empty array instead of throwing to make the API more resilient
    return [];
  }
}
