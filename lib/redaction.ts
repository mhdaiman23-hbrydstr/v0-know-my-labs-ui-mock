/**
 * lib/redaction.ts
 * Utility functions for redacting Protected Health Information (PHI) from text
 */

/**
 * Redacts PHI (Protected Health Information) from text
 * Uses pattern matching to identify and remove common PHI patterns
 */
export function redactPHI(text: string): string {
  if (!text) return '';
  
  // Patient identifiers
  text = text.replace(/(?:\b[A-Z][a-z]+ ){1,2}[A-Z][a-z]+\b/g, "[PATIENT_NAME]"); // Names
  text = text.replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, "[SSN]"); // SSNs
  text = text.replace(/\b(MRN|Medical Record Number|Patient ID|Patient Number):?\s*\d+\b/gi, "[PATIENT_ID]"); // MRNs
  text = text.replace(/\b(DOB|Date of Birth|Birth Date):?\s*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/gi, "[DOB]"); // DOB
  
  // Contact information
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]"); // Emails
  text = text.replace(/\b(\+\d{1,2}\s)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[PHONE]"); // Phone numbers
  
  // Addresses - complex pattern
  text = text.replace(/\b\d+\s+[A-Za-z\s,]+\b(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?(?:\s+[A-Za-z]+,\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?)?/gi, "[ADDRESS]");
  
  // Provider information
  text = text.replace(/\b(?:Dr\.|Doctor|MD|PhD|RN|NP)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g, "[PROVIDER]");
  
  // Hospital/facility names (common patterns)
  text = text.replace(/\b(?:Hospital|Medical Center|Clinic|Laboratory|Health|Care|Center|Institute)\b/g, "[FACILITY]");
  
  // Insurance information
  text = text.replace(/\b(?:Insurance|Policy|Member|Group|Plan)\s*(?:#|Number|ID|No\.?)?\s*:?\s*\w+[-\w]*\b/gi, "[INSURANCE_INFO]");
  
  // Unique identifiers
  text = text.replace(/\b[A-Z0-9]{6,}\b/g, "[ID]"); // Generic IDs (alphanumeric)
  
  return text;
}

/**
 * Redacts metadata from a PDF document
 */
export async function redactPDFMetadata(pdfBuffer: Buffer): Promise<Buffer> {
  const { PDFDocument } = await import('pdf-lib');
  
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Remove document metadata
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
    
    return Buffer.from(await pdfDoc.save());
  } catch (error) {
    console.error('Error redacting PDF metadata:', error);
    // Return original if we can't process
    return pdfBuffer;
  }
}
