import type { NextApiRequest, NextApiResponse } from 'next';
import { convertToSI } from '../../lib/units';
import { LabMarker, extractLabMarkersFromText } from '../../lib/extract';

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

    // First try to extract markers directly from the text
    let extractedMarkers = extractLabMarkersFromText(redactedText);
    
    // If we found fewer than 2 markers, fallback to using Claude
    if (extractedMarkers.length < 2) {
      console.log('[SERVER] Few markers found by direct extraction, using Claude...');
      
      // Call Claude to extract lab markers
      const prompt = {
        model: "claude-3-opus-20240229", // Using Claude model
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

${redactedText}

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
        console.error("Claude API error:", await response.text());
        return res.status(500).json({ message: "Error extracting lab markers" });
      }

      const data = await response.json();
      
      // Extract and parse the JSON response
      try {
        const content = data.content[0].text;
        extractedMarkers = JSON.parse(content) as LabMarker[];
        
        // Validate the markers
        if (!Array.isArray(extractedMarkers)) {
          throw new Error('Invalid response format. Expected an array.');
        }
      } catch (e) {
        console.error("Error parsing Claude response:", e);
        return res.status(500).json({ message: "Error processing extraction" });
      }
    }
    
    // Now we normalize all values to SI units
    const normalizedMarkers = extractedMarkers.map(marker => {
      // Skip if value or unit is missing
      if (marker.value === undefined || !marker.unit) {
        return marker;
      }
      
      // Convert to SI units
      const { value_si, unit_si } = convertToSI(marker.code || '', marker.value, marker.unit);
      
      // Return the marker with SI values added
      return {
        ...marker,
        value_si,
        unit_si
      };
    });
    
    return res.status(200).json({ markers: normalizedMarkers });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}import type { NextApiRequest, NextApiResponse } from 'next';
import { convertToSI } from '../../lib/units';

// Define the interface for lab markers
interface LabMarker {
  code: string;
  name: string;
  value: number;
  unit: string;
  value_si: number;
  unit_si: string;
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

    // Call Claude to extract lab markers
    const prompt = {
      model: "claude-3-opus-20240229", // Using Claude model
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

${redactedText}

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
      console.error("Claude API error:", await response.text());
      return res.status(500).json({ message: "Error extracting lab markers" });
    }

    const data = await response.json();
    
    // Extract and parse the JSON response
    try {
      const content = data.content[0].text;
      const extractedMarkers = JSON.parse(content) as LabMarker[];
      
      // Validate the markers
      if (!Array.isArray(extractedMarkers)) {
        throw new Error('Invalid response format. Expected an array.');
      }
      
      // Now we normalize all values to SI units
      const normalizedMarkers = extractedMarkers.map(marker => {
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
      
      return res.status(200).json({ markers: normalizedMarkers });
    } catch (e) {
      console.error("Error parsing Claude response:", e);
      return res.status(500).json({ message: "Error processing extraction" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
