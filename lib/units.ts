interface LabValue {
  id: string
  marker: string
  value: number | string
  unit: string
  panel: string
  referenceRange?: string
}

interface LabValueWithSI extends LabValue {
  value_si: number | string
  unit_si: string
  value_raw: number | string
  unit_raw: string
}

// Unit conversion mappings from US/Imperial to SI units
const UNIT_CONVERSIONS: Record<string, { factor: number; siUnit: string; operation: "divide" | "multiply" }> = {
  // Glucose: mg/dL → mmol/L (÷18)
  "glucose_mg/dl": { factor: 18, siUnit: "mmol/L", operation: "divide" },

  // Cholesterol (Total/LDL/HDL): mg/dL → mmol/L (÷38.67)
  "cholesterol_mg/dl": { factor: 38.67, siUnit: "mmol/L", operation: "divide" },
  "total_cholesterol_mg/dl": { factor: 38.67, siUnit: "mmol/L", operation: "divide" },
  "ldl_cholesterol_mg/dl": { factor: 38.67, siUnit: "mmol/L", operation: "divide" },
  "hdl_cholesterol_mg/dl": { factor: 38.67, siUnit: "mmol/L", operation: "divide" },

  // Triglycerides: mg/dL → mmol/L (÷88.57)
  "triglycerides_mg/dl": { factor: 88.57, siUnit: "mmol/L", operation: "divide" },

  // Creatinine: mg/dL → µmol/L (×88.4)
  "creatinine_mg/dl": { factor: 88.4, siUnit: "µmol/L", operation: "multiply" },

  // BUN: mg/dL → mmol/L (÷2.8)
  "bun_mg/dl": { factor: 2.8, siUnit: "mmol/L", operation: "divide" },

  // Calcium: mg/dL → mmol/L (÷4)
  "calcium_mg/dl": { factor: 4, siUnit: "mmol/L", operation: "divide" },

  // Vitamin D: ng/mL → nmol/L (×2.5)
  "vitamin_d_ng/ml": { factor: 2.5, siUnit: "nmol/L", operation: "multiply" },

  // B12: pg/mL → pmol/L (×0.738)
  "b12_pg/ml": { factor: 0.738, siUnit: "pmol/L", operation: "multiply" },

  // Free T4: ng/dL → pmol/L (×12.87)
  "free_t4_ng/dl": { factor: 12.87, siUnit: "pmol/L", operation: "multiply" },

  // Free T3: pg/mL → pmol/L (×1.536)
  "free_t3_pg/ml": { factor: 1.536, siUnit: "pmol/L", operation: "multiply" },

  // Hemoglobin: g/dL → g/L (×10)
  "hemoglobin_g/dl": { factor: 10, siUnit: "g/L", operation: "multiply" },
}

// Function to normalize marker names and units for lookup
function normalizeMarkerUnit(marker: string, unit: string): string {
  const normalizedMarker = marker.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, "")

  // Handle common marker name variations
  const markerMappings: Record<string, string> = {
    total_cholesterol: "cholesterol",
    ldl_cholesterol: "ldl_cholesterol",
    hdl_cholesterol: "hdl_cholesterol",
    ldl: "ldl_cholesterol",
    hdl: "hdl_cholesterol",
    glucose_fasting: "glucose",
    glucose_random: "glucose",
    blood_urea_nitrogen: "bun",
    urea_nitrogen: "bun",
    vitamin_d_25oh: "vitamin_d",
    vitamin_d3: "vitamin_d",
    vitamin_b12: "b12",
    cobalamin: "b12",
    free_thyroxine: "free_t4",
    free_triiodothyronine: "free_t3",
    hgb: "hemoglobin",
    hb: "hemoglobin",
  }

  const mappedMarker = markerMappings[normalizedMarker] || normalizedMarker
  return `${mappedMarker}_${normalizedUnit}`
}

// Main conversion function
export function toSI(lab: LabValue): LabValueWithSI {
  const numericValue = typeof lab.value === "string" ? Number.parseFloat(lab.value) : lab.value

  // If value is not numeric, return as-is with SI fields matching original
  if (isNaN(numericValue)) {
    return {
      ...lab,
      value_si: lab.value,
      unit_si: lab.unit,
      value_raw: lab.value,
      unit_raw: lab.unit,
    }
  }

  // Check if conversion is needed
  const conversionKey = normalizeMarkerUnit(lab.marker, lab.unit)
  const conversion = UNIT_CONVERSIONS[conversionKey]

  if (!conversion) {
    // No conversion needed - already in SI or unknown unit
    // Special cases for units that are already SI
    const alreadySI = ["mmol/l", "µmol/l", "nmol/l", "pmol/l", "g/l", "%"].includes(lab.unit.toLowerCase())

    return {
      ...lab,
      value_si: lab.value,
      unit_si: lab.unit,
      value_raw: lab.value,
      unit_raw: lab.unit,
    }
  }

  // Perform conversion
  const convertedValue =
    conversion.operation === "divide" ? numericValue / conversion.factor : numericValue * conversion.factor

  // Round to appropriate decimal places
  const roundedValue = Math.round(convertedValue * 100) / 100

  return {
    ...lab,
    value_si: roundedValue,
    unit_si: conversion.siUnit,
    value_raw: lab.value,
    unit_raw: lab.unit,
  }
}
