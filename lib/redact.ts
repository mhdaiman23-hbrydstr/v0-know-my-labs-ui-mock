// lib/redact.ts
export function redact(input: string): string {
  let t = input;

  // emails
  t = t.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");

  // phone numbers (+country, spaces, -, parentheses)
  t = t.replace(/\+?\d[\d\s().-]{7,}\d/g, "[REDACTED_PHONE]");

  // DOB / date patterns (YYYY-MM-DD / DD-MM-YYYY / MM/DD/YYYY)
  t = t.replace(/\b(19|20)\d{2}[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/g, "[REDACTED_DATE]");
  t = t.replace(/\b(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](19|20)\d{2}\b/g, "[REDACTED_DATE]");

  // MRN / Patient ID / Accession
  t = t.replace(/\b(MRN|Patient(?:\s*ID)?|Record\s*#?|Accession|Order)\b[:#]?\s*[A-Z0-9\-]{4,}\b/gi, "[REDACTED_ID]");

  // Addresses (very rough)
  t = t.replace(/\b\d{1,5}\s+[A-Za-z0-9.\s]+(Street|St\.|Avenue|Ave\.|Road|Rd\.|Boulevard|Blvd\.|Lane|Ln\.|Drive|Dr\.)\b/gi, "[REDACTED_ADDR]");

  // Likely name lines near headers
  t = t.replace(/^(?:Patient|Client|Name)\s*[:\-].*$/gmi, "Name: [REDACTED]");

  // Collapse repeats
  t = t.replace(/\s{2,}/g, " ");

  return t.trim();
}
