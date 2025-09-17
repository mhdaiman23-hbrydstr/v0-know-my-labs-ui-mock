import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getSession } from 'next-auth/react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SaveRequest {
  // Demographics and context information
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
  // Lab results in SI units
  labs: Array<{
    code: string;
    name: string;
    value: number; // Original value
    unit: string;  // Original unit
    value_si: number;
    unit_si: string;
    ref_range_low?: number;
    ref_range_high?: number;
  }>;
  // Interpretation data
  interpretation: {
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
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return res.status(401).json({ 
        message: 'You must be signed in to save lab results',
        error: 'auth_required'
      });
    }

    const userId = session.user.id;
    
    // Get request data
    const { demographics, context, labs, interpretation } = req.body as SaveRequest;
    
    // Validate request data
    if (!demographics || !labs || !Array.isArray(labs) || labs.length === 0 || !interpretation) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Begin a transaction using Supabase's functions
    // First, create the lab set record
    const { data: labSetData, error: labSetError } = await supabase
      .from('lab_sets')
      .insert({
        user_id: userId,
        demographics: demographics,
        context: context || {},
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (labSetError) {
      console.error('Error creating lab set:', labSetError);
      return res.status(500).json({ message: 'Error saving lab set' });
    }

    const labSetId = labSetData.id;

    // Next, insert all lab results
    const labResultsToInsert = labs.map(lab => ({
      lab_set_id: labSetId,
      code: lab.code,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      value_si: lab.value_si,
      unit_si: lab.unit_si,
      ref_range_low: lab.ref_range_low,
      ref_range_high: lab.ref_range_high,
    }));

    const { error: labResultsError } = await supabase
      .from('lab_results')
      .insert(labResultsToInsert);

    if (labResultsError) {
      console.error('Error saving lab results:', labResultsError);
      // Clean up if there was an error (delete the lab set)
      await supabase.from('lab_sets').delete().eq('id', labSetId);
      return res.status(500).json({ message: 'Error saving lab results' });
    }

    // Finally, save the interpretation
    const { error: interpretationError } = await supabase
      .from('interpretations')
      .insert({
        lab_set_id: labSetId,
        summary: interpretation.summary,
        flags: interpretation.flags,
        lifestyle: interpretation.lifestyle,
        doctor_questions: interpretation.doctor_questions,
      });

    if (interpretationError) {
      console.error('Error saving interpretation:', interpretationError);
      // Clean up if there was an error (delete the lab set and results)
      await supabase.from('lab_results').delete().eq('lab_set_id', labSetId);
      await supabase.from('lab_sets').delete().eq('id', labSetId);
      return res.status(500).json({ message: 'Error saving interpretation' });
    }

    // All operations successful
    return res.status(200).json({ 
      success: true, 
      message: 'Lab results saved successfully',
      labSetId
    });

  } catch (error) {
    console.error('Save API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
