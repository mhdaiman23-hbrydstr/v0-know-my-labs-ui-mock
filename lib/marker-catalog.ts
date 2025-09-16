// Lab marker catalog with synonyms and regex patterns for extraction
export interface LabMarker {
  panel: string
  code: string
  name: string
  synonyms: string[]
  regex: RegExp[]
  unit_si: string
  reference_range?: {
    min?: number
    max?: number
    unit: string
  }
}

export const markerCatalog: LabMarker[] = [
  // Lipid Panel
  {
    panel: "lipid",
    code: "CHOL",
    name: "Total Cholesterol",
    synonyms: ["cholesterol", "total cholesterol", "chol", "tc"],
    regex: [/cholesterol\s*:?\s*(\d+(?:\.\d+)?)/i, /chol\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mmol/L",
    reference_range: { min: 3.9, max: 5.2, unit: "mmol/L" },
  },
  {
    panel: "lipid",
    code: "HDL",
    name: "HDL Cholesterol",
    synonyms: ["hdl", "hdl cholesterol", "high density lipoprotein"],
    regex: [/hdl\s*:?\s*(\d+(?:\.\d+)?)/i, /high\s+density\s+lipoprotein\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mmol/L",
    reference_range: { min: 1.0, max: 2.6, unit: "mmol/L" },
  },
  {
    panel: "lipid",
    code: "LDL",
    name: "LDL Cholesterol",
    synonyms: ["ldl", "ldl cholesterol", "low density lipoprotein"],
    regex: [/ldl\s*:?\s*(\d+(?:\.\d+)?)/i, /low\s+density\s+lipoprotein\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mmol/L",
    reference_range: { min: 1.8, max: 3.4, unit: "mmol/L" },
  },
  {
    panel: "lipid",
    code: "TRIG",
    name: "Triglycerides",
    synonyms: ["triglycerides", "trig", "trigs"],
    regex: [/triglycerides?\s*:?\s*(\d+(?:\.\d+)?)/i, /trig\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mmol/L",
    reference_range: { min: 0.4, max: 1.7, unit: "mmol/L" },
  },

  // Basic Metabolic Panel
  {
    panel: "metabolic",
    code: "GLU",
    name: "Glucose",
    synonyms: ["glucose", "blood glucose", "bg", "glu"],
    regex: [/glucose\s*:?\s*(\d+(?:\.\d+)?)/i, /blood\s+glucose\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mmol/L",
    reference_range: { min: 3.9, max: 5.6, unit: "mmol/L" },
  },
  {
    panel: "metabolic",
    code: "BUN",
    name: "Blood Urea Nitrogen",
    synonyms: ["bun", "blood urea nitrogen", "urea nitrogen"],
    regex: [/bun\s*:?\s*(\d+(?:\.\d+)?)/i, /blood\s+urea\s+nitrogen\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mmol/L",
    reference_range: { min: 2.5, max: 7.1, unit: "mmol/L" },
  },
  {
    panel: "metabolic",
    code: "CREAT",
    name: "Creatinine",
    synonyms: ["creatinine", "creat", "cr"],
    regex: [/creatinine\s*:?\s*(\d+(?:\.\d+)?)/i, /creat\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "μmol/L",
    reference_range: { min: 62, max: 106, unit: "μmol/L" },
  },

  // Thyroid Panel
  {
    panel: "thyroid",
    code: "TSH",
    name: "Thyroid Stimulating Hormone",
    synonyms: ["tsh", "thyroid stimulating hormone", "thyrotropin"],
    regex: [/tsh\s*:?\s*(\d+(?:\.\d+)?)/i, /thyroid\s+stimulating\s+hormone\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "mIU/L",
    reference_range: { min: 0.4, max: 4.0, unit: "mIU/L" },
  },
  {
    panel: "thyroid",
    code: "T4",
    name: "Free T4",
    synonyms: ["free t4", "ft4", "thyroxine"],
    regex: [/free\s+t4\s*:?\s*(\d+(?:\.\d+)?)/i, /ft4\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "pmol/L",
    reference_range: { min: 12, max: 22, unit: "pmol/L" },
  },
  {
    panel: "thyroid",
    code: "T3",
    name: "Free T3",
    synonyms: ["free t3", "ft3", "triiodothyronine"],
    regex: [/free\s+t3\s*:?\s*(\d+(?:\.\d+)?)/i, /ft3\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "pmol/L",
    reference_range: { min: 3.1, max: 6.8, unit: "pmol/L" },
  },

  // Complete Blood Count
  {
    panel: "cbc",
    code: "WBC",
    name: "White Blood Cell Count",
    synonyms: ["wbc", "white blood cell", "leukocytes"],
    regex: [/wbc\s*:?\s*(\d+(?:\.\d+)?)/i, /white\s+blood\s+cell\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "×10⁹/L",
    reference_range: { min: 4.0, max: 11.0, unit: "×10⁹/L" },
  },
  {
    panel: "cbc",
    code: "RBC",
    name: "Red Blood Cell Count",
    synonyms: ["rbc", "red blood cell", "erythrocytes"],
    regex: [/rbc\s*:?\s*(\d+(?:\.\d+)?)/i, /red\s+blood\s+cell\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "×10¹²/L",
    reference_range: { min: 4.2, max: 5.4, unit: "×10¹²/L" },
  },
  {
    panel: "cbc",
    code: "HGB",
    name: "Hemoglobin",
    synonyms: ["hemoglobin", "hgb", "hb"],
    regex: [/hemoglobin\s*:?\s*(\d+(?:\.\d+)?)/i, /hgb\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "g/L",
    reference_range: { min: 120, max: 160, unit: "g/L" },
  },
  {
    panel: "cbc",
    code: "HCT",
    name: "Hematocrit",
    synonyms: ["hematocrit", "hct", "packed cell volume"],
    regex: [/hematocrit\s*:?\s*(\d+(?:\.\d+)?)/i, /hct\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "%",
    reference_range: { min: 36, max: 46, unit: "%" },
  },

  // Liver Function
  {
    panel: "liver",
    code: "ALT",
    name: "Alanine Aminotransferase",
    synonyms: ["alt", "alanine aminotransferase", "sgpt"],
    regex: [/alt\s*:?\s*(\d+(?:\.\d+)?)/i, /alanine\s+aminotransferase\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "U/L",
    reference_range: { min: 7, max: 56, unit: "U/L" },
  },
  {
    panel: "liver",
    code: "AST",
    name: "Aspartate Aminotransferase",
    synonyms: ["ast", "aspartate aminotransferase", "sgot"],
    regex: [/ast\s*:?\s*(\d+(?:\.\d+)?)/i, /aspartate\s+aminotransferase\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "U/L",
    reference_range: { min: 10, max: 40, unit: "U/L" },
  },

  // Vitamins
  {
    panel: "vitamins",
    code: "VIT_D",
    name: "Vitamin D",
    synonyms: ["vitamin d", "25-oh vitamin d", "calcidiol"],
    regex: [/vitamin\s+d\s*:?\s*(\d+(?:\.\d+)?)/i, /25-oh\s+vitamin\s+d\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "nmol/L",
    reference_range: { min: 75, max: 250, unit: "nmol/L" },
  },
  {
    panel: "vitamins",
    code: "VIT_B12",
    name: "Vitamin B12",
    synonyms: ["vitamin b12", "b12", "cobalamin"],
    regex: [/vitamin\s+b12\s*:?\s*(\d+(?:\.\d+)?)/i, /b12\s*:?\s*(\d+(?:\.\d+)?)/i],
    unit_si: "pmol/L",
    reference_range: { min: 148, max: 664, unit: "pmol/L" },
  },
]

// Helper function to find markers by panel
export function getMarkersByPanel(panel: string): LabMarker[] {
  return markerCatalog.filter((marker) => marker.panel === panel)
}

// Helper function to find marker by code
export function getMarkerByCode(code: string): LabMarker | undefined {
  return markerCatalog.find((marker) => marker.code === code)
}
