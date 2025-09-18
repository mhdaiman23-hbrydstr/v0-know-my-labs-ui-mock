// app/api/store-anonymous/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { saveAnonymizedData, anonymizeDemographics } from '@/lib/anonymization';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { markers, demographics, source, parseMethod, collectedAt, consentToResearch } = req.body;

    // Verify consent
    if (!consentToResearch) {
      return res.status(400).json({ message: 'Consent to research is required' });
    }

    // Verify markers exist
    if (!markers || !Array.isArray(markers) || markers.length === 0) {
      return res.status(400).json({ message: 'No valid markers provided' });
    }

    // Anonymize demographics
    const anonymizedDemographics = anonymizeDemographics(demographics || {});

    // Store anonymized data
    const success = await saveAnonymizedData({
      markers,
      demographics: anonymizedDemographics,
      source: source || 'manual',
      parseMethod: parseMethod || 'manual',
      collectedAt
    });

    if (success) {
      return res.status(200).json({ message: 'Anonymized data stored successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to store anonymized data' });
    }
  } catch (error) {
    console.error('Error storing anonymized data:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
