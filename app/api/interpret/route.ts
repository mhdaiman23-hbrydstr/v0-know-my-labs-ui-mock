import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

// Define interfaces for request and response data
interface InterpretRequest {
  demographics: {
    age: number;
    sex: string;
    height?: number; // cm
    weight?: number; // kg
    pregnant?: boolean;
    medical_conditions?: string[];
    medications?: string[];
  };
  context?: {
    reason: string;
    symptoms: string[];
    concerns: string[];
  };
  labs: Array<{
    code: string;
    name: string;
    value_si: number;
    unit_si: string;
    ref_range_low?: number;
    ref_range_high?: number;
  }>;
}

interface InterpretResponse {
  summary: string;
  flags: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low' | 'normal';
    lab_code: string;
    lab_name: string;
    finding: string;
    description: string;
  }>;
  lifestyle: Array<{
    type: 'diet' | 'exercise' | 'sleep' | 'stress' | 'supplements' | 'other';
    recommendation: string;
    evidence: string;
  }>;
  doctor_questions: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { demographics, context, labs } = req.body as InterpretRequest;

    // Validate the request data
    if (!demographics || !labs || !Array.isArray(labs) || labs.length === 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Make sure labs have the required fields
    const isValidLabs = labs.every(lab => 
      lab.code && lab.name && typeof lab.value_si === 'number' && lab.unit_si
    );

    if (!isValidLabs) {
      return res.status(400).json({ message: 'Invalid lab data. Each lab must have code, name, value_si, and unit_si.' });
    }

    // Create the prompt for Claude with a strict schema definition
    const prompt = {
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are a clinical laboratory analysis assistant. Your task is to interpret lab results and provide meaningful insights. 

You will be given demographics, context, and lab results in SI units. 
Analyze these lab results and provide:
1. A concise summary of overall health status based on the labs
2. Flags for abnormal results with severity ratings
3. Evidence-based lifestyle recommendations
4. Suggested questions to ask a doctor

Do NOT provide a disclaimer about not being a doctor or medical professional. The user already knows this.
Respond ONLY with valid JSON according to the exact schema provided.`
        },
        {
          role: "user",
          content: `Please analyze these lab results and provide an interpretation in the required JSON format:

${JSON.stringify({ demographics, context, labs }, null, 2)}

Respond with valid JSON in this exact schema:
{
  "summary": "Brief overview of findings and general health status",
  "flags": [
    {
      "severity": "critical|high|medium|low|normal",
      "lab_code": "lab test code",
      "lab_name": "human readable name",
      "finding": "brief description of finding",
      "description": "explanation of what this means for health"
    }
  ],
  "lifestyle": [
    {
      "type": "diet|exercise|sleep|stress|supplements|other",
      "recommendation": "specific recommendation",
      "evidence": "brief justification based on the lab results"
    }
  ],
  "doctor_questions": [
    "Question to ask doctor",
    "Another question"
  ]
}

Do not include any text outside the JSON. Your entire response must be valid JSON.`
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
      return res.status(500).json({ message: "Error interpreting lab results" });
    }

    const data = await response.json();
    
    // Extract and parse the JSON response
    try {
      const content = data.content[0].text;
      const interpretation = JSON.parse(content) as InterpretResponse;
      
      // Validate the structure of the parsed JSON
      if (!interpretation.summary || !Array.isArray(interpretation.flags) || 
          !Array.isArray(interpretation.lifestyle) || !Array.isArray(interpretation.doctor_questions)) {
        throw new Error('Incomplete interpretation data');
      }
      
      return res.status(200).json(interpretation);
    } catch (e) {
      console.error("Error parsing Claude response:", e);
      return res.status(500).json({ message: "Error processing interpretation" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
