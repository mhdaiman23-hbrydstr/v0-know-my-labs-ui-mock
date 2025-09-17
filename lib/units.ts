// Unit conversion system for lab tests
// Maps common lab test units to SI units with conversion functions

// Define interfaces
export interface UnitConversion {
  toSI: (value: number) => number;
  fromSI: (value: number) => number;
  siUnit: string;
}

export interface UnitConversionMap {
  [unit: string]: UnitConversion;
}

export interface LabUnitMap {
  [testCode: string]: UnitConversionMap;
}

// Helper to create conversion objects
const createConversion = (
  siUnit: string,
  toSIFn: (value: number) => number,
  fromSIFn: (value: number) => number
): UnitConversion => ({
  toSI: toSIFn,
  fromSI: fromSIFn,
  siUnit
});

// Common conversion factors
const identityConversion = (unit: string): UnitConversion => 
  createConversion(unit, (v) => v, (v) => v);

const scaleConversion = (siUnit: string, factor: number): UnitConversion =>
  createConversion(siUnit, (v) => v * factor, (v) => v / factor);

// ===== GLUCOSE =====
const glucoseUnits: UnitConversionMap = {
  "mg/dL": createConversion(
    "mmol/L", 
    (v) => v / 18.016, 
    (v) => v * 18.016
  ),
  "mg/L": createConversion(
    "mmol/L", 
    (v) => v / 180.16, 
    (v) => v * 180.16
  ),
  "mmol/L": identityConversion("mmol/L"),
  "g/L": createConversion(
    "mmol/L", 
    (v) => v * 5.551, 
    (v) => v / 5.551
  ),
};

// ===== CHOLESTEROL =====
const cholesterolUnits: UnitConversionMap = {
  "mg/dL": createConversion(
    "mmol/L", 
    (v) => v / 38.67, 
    (v) => v * 38.67
  ),
  "mg/L": createConversion(
    "mmol/L", 
    (v) => v / 386.7, 
    (v) => v * 386.7
  ),
  "mmol/L": identityConversion("mmol/L"),
  "g/L": createConversion(
    "mmol/L", 
    (v) => v * 2.586, 
    (v) => v / 2.586
  ),
};

// ===== TRIGLYCERIDES =====
const triglyceridesUnits: UnitConversionMap = {
  "mg/dL": createConversion(
    "mmol/L", 
    (v) => v / 88.57, 
    (v) => v * 88.57
  ),
  "mg/L": createConversion(
    "mmol/L", 
    (v) => v / 885.7, 
    (v) => v * 885.7
  ),
  "mmol/L": identityConversion("mmol/L"),
  "g/L": createConversion(
    "mmol/L", 
    (v) => v * 1.129, 
    (v) => v / 1.129
  ),
};

// ===== CREATININE =====
const creatinineUnits: UnitConversionMap = {
  "mg/dL": createConversion(
    "μmol/L", 
    (v) => v * 88.42, 
    (v) => v / 88.42
  ),
  "mg/L": createConversion(
    "μmol/L", 
    (v) => v * 8.842, 
    (v) => v / 8.842
  ),
  "μmol/L": identityConversion("μmol/L"),
  "mmol/L": createConversion(
    "μmol/L", 
    (v) => v * 1000, 
    (v) => v / 1000
  ),
};

// ===== BUN (Blood Urea Nitrogen) =====
const bunUnits: UnitConversionMap = {
  "mg/dL": createConversion(
    "mmol/L", 
    (v) => v / 2.8, 
    (v) => v * 2.8
  ),
  "mg/L": createConversion(
    "mmol/L", 
    (v) => v / 28.01, 
    (v) => v * 28.01
  ),
  "mmol/L": identityConversion("mmol/L"),
  "g/L": createConversion(
    "mmol/L", 
    (v) => v * 35.7, 
    (v) => v / 35.7
  ),
};

// ===== CALCIUM =====
const calciumUnits: UnitConversionMap = {
  "mg/dL": createConversion(
    "mmol/L", 
    (v) => v / 4.01, 
    (v) => v * 4.01
  ),
  "mg/L": createConversion(
    "mmol/L", 
    (v) => v / 40.08, 
    (v) => v * 40.08
  ),
  "mmol/L": identityConversion("mmol/L"),
  "mEq/L": createConversion(
    "mmol/L", 
    (v) => v / 2, 
    (v) => v * 2
  ),
};

// ===== VITAMIN D (25-OH) =====
const vitaminDUnits: UnitConversionMap = {
  "ng/mL": createConversion(
    "nmol/L", 
    (v) => v * 2.496, 
    (v) => v / 2.496
  ),
  "ng/L": createConversion(
    "nmol/L", 
    (v) => v * 0.002496, 
    (v) => v / 0.002496
  ),
  "nmol/L": identityConversion("nmol/L"),
  "μg/L": createConversion(
    "nmol/L", 
    (v) => v * 2.496, 
    (v) => v / 2.496
  ),
};

// ===== VITAMIN B12 =====
const vitaminB12Units: UnitConversionMap = {
  "pg/mL": createConversion(
    "pmol/L", 
    (v) => v * 0.738, 
    (v) => v / 0.738
  ),
  "ng/L": createConversion(
    "pmol/L", 
    (v) => v * 0.738, 
    (v) => v / 0.738
  ),
  "pmol/L": identityConversion("pmol/L"),
};

// ===== TSH (Thyroid Stimulating Hormone) =====
const tshUnits: UnitConversionMap = {
  "μIU/mL": createConversion(
    "mIU/L", 
    (v) => v, 
    (v) => v
  ),
  "μIU/L": createConversion(
    "mIU/L", 
    (v) => v / 1000, 
    (v) => v * 1000
  ),
  "mIU/L": identityConversion("mIU/L"),
};

// ===== T4 (Thyroxine) =====
const t4Units: UnitConversionMap = {
  "μg/dL": createConversion(
    "nmol/L", 
    (v) => v * 12.87, 
    (v) => v / 12.87
  ),
  "ng/dL": createConversion(
    "nmol/L", 
    (v) => v * 0.1287, 
    (v) => v / 0.1287
  ),
  "nmol/L": identityConversion("nmol/L"),
};

// ===== T3 (Triiodothyronine) =====
const t3Units: UnitConversionMap = {
  "ng/dL": createConversion(
    "nmol/L", 
    (v) => v * 0.01536, 
    (v) => v / 0.01536
  ),
  "pg/mL": createConversion(
    "nmol/L", 
    (v) => v * 0.001536, 
    (v) => v / 0.001536
  ),
  "nmol/L": identityConversion("nmol/L"),
};

// ===== FERRITIN =====
const ferritinUnits: UnitConversionMap = {
  "ng/mL": createConversion(
    "μg/L", 
    (v) => v, 
    (v) => v
  ),
  "μg/L": identityConversion("μg/L"),
  "pmol/L": createConversion(
    "μg/L", 
    (v) => v * 0.445, 
    (v) => v / 0.445
  ),
};

// ===== HEMOGLOBIN =====
const hemoglobinUnits: UnitConversionMap = {
  "g/dL": createConversion(
    "g/L", 
    (v) => v * 10, 
    (v) => v / 10
  ),
  "g/L": identityConversion("g/L"),
  "mmol/L": createConversion(
    "g/L", 
    (v) => v * 16.11, 
    (v) => v / 16.11
  ),
};

// ===== WHITE BLOOD CELL COUNT =====
const wbcUnits: UnitConversionMap = {
  "K/μL": createConversion(
    "10^9/L", 
    (v) => v, 
    (v) => v
  ),
  "K/mm^3": createConversion(
    "10^9/L", 
    (v) => v, 
    (v) => v
  ),
  "10^3/μL": createConversion(
    "10^9/L", 
    (v) => v, 
    (v) => v
  ),
  "10^9/L": identityConversion("10^9/L"),
};

// ===== PLATELET COUNT =====
const plateletUnits: UnitConversionMap = {
  "K/μL": createConversion(
    "10^9/L", 
    (v) => v, 
    (v) => v
  ),
  "K/mm^3": createConversion(
    "10^9/L", 
    (v) => v, 
    (v) => v
  ),
  "10^3/μL": createConversion(
    "10^9/L", 
    (v) => v, 
    (v) => v
  ),
  "10^9/L": identityConversion("10^9/L"),
};

// ===== RED BLOOD CELL COUNT =====
const rbcUnits: UnitConversionMap = {
  "M/μL": createConversion(
    "10^12/L", 
    (v) => v, 
    (v) => v
  ),
  "M/mm^3": createConversion(
    "10^12/L", 
    (v) => v, 
    (v) => v
  ),
  "10^6/μL": createConversion(
    "10^12/L", 
    (v) => v, 
    (v) => v
  ),
  "10^12/L": identityConversion("10^12/L"),
};

// Master map of lab test codes to their unit conversions
export const labUnits: LabUnitMap = {
  // Glucose
  "GLU": glucoseUnits,
  "GLUCOSE": glucoseUnits,
  "FBS": glucoseUnits,
  "GLUC": glucoseUnits,
  
  // Cholesterol
  "CHOL": cholesterolUnits,
  "TC": cholesterolUnits,
  "CHOLESTEROL": cholesterolUnits,
  "HDL": cholesterolUnits,
  "HDL-C": cholesterolUnits,
  "LDL": cholesterolUnits,
  "LDL-C": cholesterolUnits,
  "VLDL": cholesterolUnits,
  
  // Triglycerides
  "TRIG": triglyceridesUnits,
  "TG": triglyceridesUnits,
  "TRIGLYCERIDES": triglyceridesUnits,
  
  // Creatinine
  "CREAT": creatinineUnits,
  "CREA": creatinineUnits,
  "CR": creatinineUnits,
  "CREATININE": creatinineUnits,
  
  // BUN
  "BUN": bunUnits,
  "UREA": bunUnits,
  "UREA-N": bunUnits,
  
  // Calcium
  "CA": calciumUnits,
  "CALCIUM": calciumUnits,
  
  // Vitamin D
  "VIT-D": vitaminDUnits,
  "25-OH-D": vitaminDUnits,
  "25-HYDROXYVITAMIN-D": vitaminDUnits,
  "VIT D": vitaminDUnits,
  "25OHD": vitaminDUnits,
  
  // Vitamin B12
  "B12": vitaminB12Units,
  "VIT-B12": vitaminB12Units,
  "COBALAMIN": vitaminB12Units,
  
  // Thyroid markers
  "TSH": tshUnits,
  "THYROTROPIN": tshUnits,
  "T4": t4Units,
  "THYROXINE": t4Units,
  "FT4": t4Units,
  "FREE T4": t4Units,
  "T3": t3Units,
  "TRIIODOTHYRONINE": t3Units,
  "FT3": t3Units,
  "FREE T3": t3Units,
  
  // Ferritin
  "FERRITIN": ferritinUnits,
  "FER": ferritinUnits,
  
  // Hemoglobin
  "HGB": hemoglobinUnits,
  "HB": hemoglobinUnits,
  "HEMOGLOBIN": hemoglobinUnits,
  
  // Complete Blood Count
  "WBC": wbcUnits,
  "WHITE BLOOD CELLS": wbcUnits,
  "LEUKOCYTES": wbcUnits,
  
  "PLT": plateletUnits,
  "PLATELETS": plateletUnits,
  "THROMBOCYTES": plateletUnits,
  
  "RBC": rbcUnits,
  "RED BLOOD CELLS": rbcUnits,
  "ERYTHROCYTES": rbcUnits,
};

// Main conversion function
export function convertToSI(testCode: string, value: number, unit: string): { value_si: number, unit_si: string } {
  // Normalize test code
  const normalizedCode = testCode.toUpperCase().trim();
  
  // Normalize unit (case-insensitive)
  const normalizedUnit = unit.toLowerCase().trim();
  
  // Find the appropriate unit conversion map
  const unitMap = labUnits[normalizedCode];
  
  if (!unitMap) {
    // If we don't have conversion for this test, return as is
    return { value_si: value, unit_si: unit };
  }
  
  // Try to find an exact match for the unit
  let conversion = unitMap[normalizedUnit];
  
  // If no exact match, try a fuzzy match (ignoring spaces, dashes, etc.)
  if (!conversion) {
    const cleanedUnit = normalizedUnit.replace(/[\s\-\/]/g, '');
    const unitKey = Object.keys(unitMap).find(u => 
      u.toLowerCase().replace(/[\s\-\/]/g, '') === cleanedUnit
    );
    
    if (unitKey) {
      conversion = unitMap[unitKey];
    }
  }
  
  // If we found a conversion, apply it
  if (conversion) {
    return {
      value_si: conversion.toSI(value),
      unit_si: conversion.siUnit
    };
  }
  
  // If no conversion found, return as is
  return { value_si: value, unit_si: unit };
}

// Function to convert from SI back to original unit
export function convertFromSI(testCode: string, value_si: number, target_unit: string): number {
  const normalizedCode = testCode.toUpperCase().trim();
  const normalizedUnit = target_unit.toLowerCase().trim();
  
  const unitMap = labUnits[normalizedCode];
  
  if (!unitMap) {
    return value_si;
  }
  
  const conversion = unitMap[normalizedUnit];
  
  if (conversion) {
    return conversion.fromSI(value_si);
  }
  
  return value_si;
}

// Get the SI unit for a test
export function getSIUnit(testCode: string): string | null {
  const normalizedCode = testCode.toUpperCase().trim();
  const unitMap = labUnits[normalizedCode];
  
  if (!unitMap) {
    return null;
  }
  
  // Get the first conversion in the map and return its SI unit
  const firstKey = Object.keys(unitMap)[0];
  return unitMap[firstKey].siUnit;
}
