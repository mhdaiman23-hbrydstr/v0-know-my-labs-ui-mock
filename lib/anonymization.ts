// lib/anonymization.ts
import { createClient } from '@/lib/supabase/server';

export interface LabMarker {
  code: string;
  name: string;
  value: number;
  unit: string;
  value_si: number;
  unit_si: string;
  ref_range_low?: number;
  ref_range_high?: number;
  category?: string;
  flag?: string;
  collection_date?: string;
}

export interface Demographics {
  age?: string | number;
  sex?: string;
  height?: string | number;
  weight?: string | number;
  fasting_status?: string;
  // Any other demographic fields you collect
}

interface AnonymizedData {
  markers: LabMarker[];
  demographics: any;
  source: string;
  parseMethod: string;
  collectedAt?: string;
}

// Anonymize demographics
export function anonymizeDemographics(demographics: Demographics) {
  if (!demographics) return {};
  
  return {
    // Convert exact age to age range
    age_range: demographics.age ? getAgeRange(Number(demographics.age)) : null,
    sex: demographics.sex,
    // Round height and weight to reduce uniqueness
    height_range: demographics.height ? getRoundedHeight(Number(demographics.height)) : null,
    weight_range: demographics.weight ? getRoundedWeight(Number(demographics.weight)) : null,
    fasting_status: demographics.fasting_status,
  };
}

// Helper function to convert age to range
function getAgeRange(age: number): string {
  if (age < 18) return "under_18";
  if (age < 30) return "18_29";
  if (age < 40) return "30_39";
  if (age < 50) return "40_49";
  if (age < 60) return "50_59";
  if (age < 70) return "60_69";
  return "70_plus";
}

// Helper functions to round height/weight to reduce uniqueness
function getRoundedHeight(height: number): string {
  // Round to nearest 5cm or 2in depending on unit
  return `${Math.round(height / 5) * 5}`;
}

function getRoundedWeight(weight: number): string {
  // Round to nearest 5kg or 10lb depending on unit
  return `${Math.round(weight / 5) * 5}`;
}

// Extract collection date from text (if available)
export function extractCollectionDate(text: string): string | undefined {
  // Simple regex to find dates in common formats
  const dateRegex = /(?:collection date|collected on|date collected|date of collection|drawn on):?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i;
  const match = text.match(dateRegex);
  
  if (match && match[1]) {
    // Attempt to parse and format the date
    try {
      const parts = match[1].split(/[-\/]/);
      // Handle different date formats (MM/DD/YYYY, DD/MM/YYYY)
      // This is simplified - you might need more robust parsing
      const date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (e) {
      console.error('Failed to parse collection date', e);
      return undefined;
    }
  }
  
  return undefined;
}

// Save anonymized data to database
export async function saveAnonymizedData(data: AnonymizedData) {
  const supabase = createClient();
  
  try {
    console.log('[ANONYMIZED] Saving anonymized lab data');
    
    // 1. Insert anonymous lab set
    const { data: labSet, error: labSetError } = await supabase
      .from('lab_sets')
      .insert({
        user_id: null, // No user association for anonymized data
        source: data.source,
        collected_at: data.collectedAt,
        parse_method: data.parseMethod,
        status: 'parsed',
        demographics: data.demographics,
        privacy_level: 'anonymized',
        consent_to_research: true,
        anonymous_id: crypto.randomUUID() // Generate random ID
      })
      .select()
      .single();
    
    if (labSetError) {
      throw labSetError;
    }
    
    // 2. Insert lab results
    if (data.markers && data.markers.length > 0) {
      const labResults = data.markers.map(marker => ({
        set_id: labSet.id,
        panel: marker.category || 'Other',
        code: marker.code,
        name: marker.name,
        value_si: marker.value_si,
        unit_si: marker.unit_si,
        value_raw: marker.value,
        unit_raw: marker.unit
      }));
      
      const { error: resultsError } = await supabase
        .from('lab_results')
        .insert(labResults);
        
      if (resultsError) {
        throw resultsError;
      }
    }
    
    console.log('[ANONYMIZED] Successfully saved anonymized data');
    return true;
  } catch (error) {
    console.error('[ANONYMIZED] Error saving anonymized data:', error);
    // Don't throw - anonymized storage should be non-blocking
    return false;
  }
}
