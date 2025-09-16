import { NextRequest, NextResponse } from 'next/server';
import { AnthropicClient } from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-3-5-sonnet-20240620';
const MAX_TOKENS = 4000;

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { demographics, labs, context } = body;

    if (!labs || !Array.isArray(labs) || labs.length === 0) {
      return NextResponse.json(
        { error: 'No lab results provided' },
        { status: 400 }
      );
    }

    // Group labs by panel
    const labsByPanel = labs.reduce((acc, lab) => {
      if (!acc[lab.panel]) {
        acc[lab.panel] = [];
      }
      acc[lab.panel].push(lab);
      return acc;
    }, {});

    // Create enhanced system prompt with comprehensive context
    const systemPrompt = `You are a medical lab interpretation assistant with expertise in personalized medicine. Your task is to analyze lab results within the FULL CONTEXT of a person's demographic and health profile.

CRITICAL CONTEXTUAL FACTORS TO CONSIDER:
1. AGE: Reference ranges and clinical significance vary significantly by age
   - Hormone levels (testosterone, estrogen) naturally decline with age
   - Kidney function markers typically decrease with age
   - Bone mineral markers change throughout life stages
   - Glucose tolerance decreases with age

2. SEX: Many lab values have different normal ranges based on biological sex
   - Hemoglobin/hematocrit (higher in males)
   - Liver enzymes (higher upper limits in males)
   - Creatinine (higher in males due to muscle mass)
   - Hormones (testosterone, estrogen) vary dramatically by sex

3. ETHNICITY: Genetic variations affect baseline values and risk assessment
   - Hemoglobin (lower reference ranges in Black individuals)
   - Vitamin D (naturally lower in darker skin tones)
   - Kidney function (historical adjustments for Black patients)
   - HbA1c (reads higher in Black, Hispanic populations)
   - Lipid profiles (variations across ethnic groups)

4. BODY COMPOSITION: Weight, BMI, and body composition affect many markers
   - Liver enzymes often elevated with higher BMI
   - Inflammatory markers increase with obesity
   - Hormone levels affected by body fat percentage
   - Metabolic markers vary with body composition

5. LIFESTYLE FACTORS: Activity, diet, and habits significantly impact results
   - Exercise affects muscle enzymes (CK, AST, ALT)
   - Alcohol impacts liver markers and lipids
   - Smoking affects inflammatory markers and hormones
   - Diet patterns influence metabolic markers

6. MEDICAL CONDITIONS: Existing conditions provide critical interpretive context
   - Diabetes affects multiple systems beyond glucose
   - Thyroid conditions influence metabolism markers
   - Liver disease alters protein and coagulation values
   - Kidney disease affects electrolytes and minerals

7. MEDICATIONS: Many drugs alter lab values in predictable ways
   - Statins affect liver enzymes
   - Diuretics impact electrolytes
   - Metformin can lower B12 levels
   - Biotin supplements interfere with hormone tests

When interpreting results, explicitly consider these factors in your analysis. Indicate when a seemingly "abnormal" result might actually be expected or normal for THIS SPECIFIC PERSON based on their unique profile.

Your response must be structured as a valid JSON object with the following structure:
{
  "summary": "Brief overview that incorporates key demographic/health context",
  "interpretation": "Detailed analysis considering the person's complete profile",
  "recommendations": ["Context-appropriate recommendations"],
  "markers": {
    "[MARKER_CODE]": {
      "status": "normal|high|low|critical_high|critical_low",
      "reference_range": "The reference range appropriate for this person",
      "interpretation": "Marker interpretation considering personal context"
    }
  },
  "panel_interpretations": {
    "[PANEL_NAME]": "Panel-specific interpretation with contextual factors"
  }
}`;

    // Human prompt with comprehensive demographic and health profile
    let humanPrompt = 'Please interpret the following lab results:\n\n';

    // Comprehensive demographics and health profile section
    if (demographics) {
      humanPrompt += 'Patient Profile:\n';
      
      // Basic demographics
      if (demographics.age) humanPrompt += `Age: ${demographics.age} years\n`;
      if (demographics.sex) humanPrompt += `Sex: ${demographics.sex}\n`;
      if (demographics.ethnicity) humanPrompt += `Ethnicity: ${demographics.ethnicity}\n`;
      
      // Body composition
      if (demographics.weight) humanPrompt += `Weight: ${demographics.weight} kg\n`;
      if (demographics.height) humanPrompt += `Height: ${demographics.height} cm\n`;
      if (demographics.bmi) humanPrompt += `BMI: ${demographics.bmi}\n`;
      
      // Lifestyle factors
      if (demographics.exercise) humanPrompt += `Exercise: ${demographics.exercise}\n`;
      if (demographics.smoking) humanPrompt += `Smoking: ${demographics.smoking}\n`;
      if (demographics.alcohol) humanPrompt += `Alcohol: ${demographics.alcohol}\n`;
      if (demographics.diet) humanPrompt += `Diet: ${demographics.diet}\n`;
      
      // Medical context
      if (demographics.conditions) {
        if (Array.isArray(demographics.conditions)) {
          humanPrompt += `Medical conditions: ${demographics.conditions.join(', ')}\n`;
        } else {
          humanPrompt += `Medical conditions: ${demographics.conditions}\n`;
        }
      }
      
      if (demographics.medications) {
        if (Array.isArray(demographics.medications)) {
          humanPrompt += `Medications: ${demographics.medications.join(', ')}\n`;
        } else {
          humanPrompt += `Medications: ${demographics.medications}\n`;
        }
      }
      
      // Handle any other provided demographics fields dynamically
      Object.entries(demographics).forEach(([key, value]) => {
        // Skip the ones we've already explicitly handled
        const handledKeys = ['age', 'sex', 'ethnicity', 'weight', 'height', 'bmi', 
                            'exercise', 'smoking', 'alcohol', 'diet', 
                            'conditions', 'medications'];
        
        if (!handledKeys.includes(key) && value) {
          humanPrompt += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
        }
      });
      
      humanPrompt += '\n';
    }

    // Additional context if provided
    if (context) {
      humanPrompt += `Additional Context: ${context}\n\n`;
    }

    // Add lab results by panel
    humanPrompt += 'Lab Results:\n';
    Object.entries(labsByPanel).forEach(([panel, panelLabs]) => {
      humanPrompt += `\n${panel.toUpperCase()} PANEL:\n`;
      panelLabs.forEach((lab: any) => {
        humanPrompt += `${lab.name} (${lab.code}): ${lab.value_si !== null ? lab.value_si : 'N/A'} ${lab.unit_si || ''}\n`;
      });
    });

    humanPrompt += '\nProvide your interpretation as a valid JSON object with the structure specified.';

    // Call the Anthropic API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        { role: 'user', content: humanPrompt }
      ],
    });

    // Parse the response
    let interpretationJson;
    try {
      // Extract the text content from the response
      const content = response.content[0].text;
      
      // Try to parse the JSON directly
      interpretationJson = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      console.log('Raw response:', response.content[0].text);
      
      return NextResponse.json(
        { error: 'Failed to parse interpretation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      interpretation: interpretationJson,
      model: MODEL,
    });
  } catch (error) {
    console.error('Error in /api/interpret:', error);
    return NextResponse.json(
      { error: 'Failed to interpret lab results' },
      { status: 500 }
    );
  }
}
