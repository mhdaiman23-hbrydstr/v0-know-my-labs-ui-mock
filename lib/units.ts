// Define conversion factors for different markers
type UnitConversion = {
  [rawUnit: string]: {
    siUnit: string
    factor: number
  }
}

// Define marker-specific conversions
type MarkerConversions = {
  [markerCode: string]: UnitConversion
}

const conversions: MarkerConversions = {
  // Lipid Panel
  CHOL: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.02586 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.02586 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },
  LDL: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.02586 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.02586 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },
  HDL: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.02586 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.02586 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },
  TRIG: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.01129 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.01129 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },

  // Metabolic Panel
  GLUC: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.0555 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.0555 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },
  CREAT: {
    "mg/dL": { siUnit: "μmol/L", factor: 88.4 },
    "mg/dl": { siUnit: "μmol/L", factor: 88.4 },
    "μmol/L": { siUnit: "μmol/L", factor: 1 },
    "umol/L": { siUnit: "μmol/L", factor: 1 },
    "umol/l": { siUnit: "μmol/L", factor: 1 },
    "µmol/L": { siUnit: "μmol/L", factor: 1 },
  },
  BUN: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.357 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.357 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },
  CA: {
    "mg/dL": { siUnit: "mmol/L", factor: 0.25 },
    "mg/dl": { siUnit: "mmol/L", factor: 0.25 },
    "mmol/L": { siUnit: "mmol/L", factor: 1 },
    "mmol/l": { siUnit: "mmol/L", factor: 1 },
  },

  // Vitamins & Minerals
  VITD: {
    "ng/mL": { siUnit: "nmol/L", factor: 2.496 },
    "ng/ml": { siUnit: "nmol/L", factor: 2.496 },
    "nmol/L": { siUnit: "nmol/L", factor: 1 },
    "nmol/l": { siUnit: "nmol/L", factor: 1 },
  },
  B12: {
    "pg/mL": { siUnit: "pmol/L", factor: 0.738 },
    "pg/ml": { siUnit: "pmol/L", factor: 0.738 },
    "pmol/L": { siUnit: "pmol/L", factor: 1 },
    "pmol/l": { siUnit: "pmol/L", factor: 1 },
  },
  FERR: {
    "ng/mL": { siUnit: "μg/L", factor: 1 },
    "ng/ml": { siUnit: "μg/L", factor: 1 },
    "μg/L": { siUnit: "μg/L", factor: 1 },
    "ug/L": { siUnit: "μg/L", factor: 1 },
    "ug/l": { siUnit: "μg/L", factor: 1 },
    "µg/L": { siUnit: "μg/L", factor: 1 },
  },

  // Thyroid Panel
  TSH: {
    "mIU/L": { siUnit: "mIU/L", factor: 1 },
    "miu/l": { siUnit: "mIU/L", factor: 1 },
    "μIU/mL": { siUnit: "mIU/L", factor: 1 },
    "uiu/ml": { siUnit: "mIU/L", factor: 1 },
    "uIU/mL": { siUnit: "mIU/L", factor: 1 },
    "µIU/mL": { siUnit: "mIU/L", factor: 1 },
  },
  FT4: {
    "ng/dL": { siUnit: "pmol/L", factor: 12.87 },
    "ng/dl": { siUnit: "pmol/L", factor: 12.87 },
    "pmol/L": { siUnit: "pmol/L", factor: 1 },
    "pmol/l": { siUnit: "pmol/L", factor: 1 },
  },
  FT3: {
    "pg/mL": { siUnit: "pmol/L", factor: 1.536 },
    "pg/ml": { siUnit: "pmol/L", factor: 1.536 },
    "pmol/L": { siUnit: "pmol/L", factor: 1 },
    "pmol/l": { siUnit: "pmol/L", factor: 1 },
  },

  // CBC
  HGB: {
    "g/dL": { siUnit: "g/L", factor: 10 },
    "g/dl": { siUnit: "g/L", factor: 10 },
    "g/L": { siUnit: "g/L", factor: 1 },
    "g/l": { siUnit: "g/L", factor: 1 },
  },
  WBC: {
    "x10^3/μL": { siUnit: "x10^9/L", factor: 1 },
    "x10^3/uL": { siUnit: "x10^9/L", factor: 1 },
    "x10^3/ul": { siUnit: "x10^9/L", factor: 1 },
    "K/uL": { siUnit: "x10^9/L", factor: 1 },
    "K/μL": { siUnit: "x10^9/L", factor: 1 },
    "x10^9/L": { siUnit: "x10^9/L", factor: 1 },
    "x10^9/l": { siUnit: "x10^9/L", factor: 1 },
  },
  PLT: {
    "x10^3/μL": { siUnit: "x10^9/L", factor: 1 },
    "x10^3/uL": { siUnit: "x10^9/L", factor: 1 },
    "x10^3/ul": { siUnit: "x10^9/L", factor: 1 },
    "K/uL": { siUnit: "x10^9/L", factor: 1 },
    "K/μL": { siUnit: "x10^9/L", factor: 1 },
    "x10^9/L": { siUnit: "x10^9/L", factor: 1 },
    "x10^9/l": { siUnit: "x10^9/L", factor: 1 },
  },
}

// Default conversions for unknown markers
const defaultConversions: UnitConversion = {
  // Identity conversions (no conversion)
  "": { siUnit: "", factor: 1 },
}

/**
 * Convert a value from raw units to SI units
 * @param markerCode The marker code (e.g., 'CHOL', 'LDL')
 * @param value The raw value
 * @param unit The raw unit
 * @returns The value in SI units and the SI unit
 */
export function toSI(markerCode: string, value: number, unit: string): { value: number | null; unit: string } {
  // Normalize units by removing whitespace
  const normalizedUnit = unit.trim()

  // Get the marker-specific conversions or default to identity conversion
  const markerConversions = conversions[markerCode] || defaultConversions

  // Get the conversion for the specific unit or default to identity conversion
  const conversion = markerConversions[normalizedUnit] || {
    siUnit: normalizedUnit,
    factor: 1,
  }

  // Check if value is valid
  if (isNaN(value)) {
    return { value: null, unit: conversion.siUnit }
  }

  // Convert the value
  const convertedValue = value * conversion.factor

  return {
    value: convertedValue,
    unit: conversion.siUnit,
  }
}

/**
 * Convert a value from SI units back to the specified raw units
 * @param markerCode The marker code (e.g., 'CHOL', 'LDL')
 * @param value The SI value
 * @param targetUnit The target raw unit
 * @returns The value in raw units
 */
export function fromSI(markerCode: string, value: number, targetUnit: string): number | null {
  // Normalize units by removing whitespace
  const normalizedUnit = targetUnit.trim()

  // Get the marker-specific conversions or default to identity conversion
  const markerConversions = conversions[markerCode] || defaultConversions

  // Get the conversion for the specific unit or default to identity conversion
  const conversion = markerConversions[normalizedUnit] || {
    siUnit: normalizedUnit,
    factor: 1,
  }

  // Check if value is valid
  if (isNaN(value)) {
    return null
  }

  // Convert back from SI to the target unit
  return value / conversion.factor
}

/**
 * Get the canonical SI unit for a marker
 * @param markerCode The marker code
 * @returns The canonical SI unit for the marker
 */
export function getCanonicalUnit(markerCode: string): string {
  const markerConversions = conversions[markerCode]
  if (!markerConversions) return ""

  // Find any conversion and return its SI unit
  const anyConversion = Object.values(markerConversions)[0]
  return anyConversion ? anyConversion.siUnit : ""
}

/**
 * Check if a unit is valid for a marker
 * @param markerCode The marker code
 * @param unit The unit to check
 * @returns True if the unit is valid for the marker
 */
export function isValidUnit(markerCode: string, unit: string): boolean {
  const markerConversions = conversions[markerCode]
  if (!markerConversions) return false

  return !!markerConversions[unit]
}

/**
 * Get all supported units for a marker
 * @param markerCode The marker code
 * @returns Array of supported units for the marker
 */
export function getSupportedUnits(markerCode: string): string[] {
  const markerConversions = conversions[markerCode]
  if (!markerConversions) return []

  return Object.keys(markerConversions)
}

/**
 * Get conversion factor between two units for a marker
 * @param markerCode The marker code
 * @param fromUnit The source unit
 * @param toUnit The target unit
 * @returns The conversion factor, or null if conversion not possible
 */
export function getConversionFactor(markerCode: string, fromUnit: string, toUnit: string): number | null {
  const markerConversions = conversions[markerCode]
  if (!markerConversions) return null

  const fromConversion = markerConversions[fromUnit]
  const toConversion = markerConversions[toUnit]

  if (!fromConversion || !toConversion) return null

  // Convert from source unit to SI, then from SI to target unit
  return fromConversion.factor / toConversion.factor
}

/**
 * Normalize unit string by handling common variations
 * @param unit The unit string to normalize
 * @returns Normalized unit string
 */
export function normalizeUnit(unit: string): string {
  if (!unit) return ""

  return unit
    .trim()
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/μ/g, "μ") // Normalize micro symbol
    .replace(/µ/g, "μ") // Convert alternative micro symbol
    .replace(/°C/g, "°C") // Normalize degree symbol
    .replace(/\^/g, "^") // Normalize exponent symbol
}

/**
 * Check if a value is within expected range for a marker
 * @param markerCode The marker code
 * @param value The value to check
 * @param unit The unit of the value
 * @returns True if value appears reasonable for the marker
 */
export function isReasonableValue(markerCode: string, value: number, unit: string): boolean {
  if (isNaN(value) || value < 0) return false

  // Define reasonable ranges for common markers (in their common units)
  const ranges: { [key: string]: { [unit: string]: [number, number] } } = {
    CHOL: {
      "mg/dL": [100, 400],
      "mmol/L": [2.6, 10.4],
    },
    LDL: {
      "mg/dL": [50, 300],
      "mmol/L": [1.3, 7.8],
    },
    HDL: {
      "mg/dL": [20, 100],
      "mmol/L": [0.5, 2.6],
    },
    GLUC: {
      "mg/dL": [50, 400],
      "mmol/L": [2.8, 22.2],
    },
    CREAT: {
      "mg/dL": [0.3, 5.0],
      "μmol/L": [26, 442],
    },
    TSH: {
      "mIU/L": [0.1, 20],
    },
    HGB: {
      "g/dL": [8, 20],
      "g/L": [80, 200],
    },
  }

  const markerRanges = ranges[markerCode]
  if (!markerRanges) return true // No range defined, assume reasonable

  const unitRange = markerRanges[unit]
  if (!unitRange) return true // No range for this unit, assume reasonable

  const [min, max] = unitRange
  return value >= min && value <= max
}

/**
 * Format a numeric value for display with appropriate precision
 * @param value The numeric value
 * @param unit The unit (used to determine precision)
 * @returns Formatted string
 */
export function formatValue(value: number, unit: string): string {
  if (isNaN(value)) return "N/A"

  // Determine precision based on typical ranges for the unit
  let precision = 1

  if (unit.includes("pmol") || unit.includes("μmol") || unit.includes("umol")) {
    precision = 0 // Whole numbers for pmol/μmol
  } else if (unit.includes("mmol") || unit.includes("g/L")) {
    precision = 1 // One decimal for mmol, g/L
  } else if (unit.includes("mg/dL") || unit.includes("ng/mL")) {
    precision = 0 // Whole numbers for mg/dL, ng/mL
  } else if (unit.includes("mIU")) {
    precision = 2 // Two decimals for mIU
  }

  return value.toFixed(precision)
}

// Export the conversions object for external use if needed
export { conversions }
