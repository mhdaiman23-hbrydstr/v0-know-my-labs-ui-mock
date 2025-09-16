-- Migration: Replace lab_tests table with new schema
-- This migration creates four new tables: lab_sets, lab_results, interpretations, marker_catalog
-- and drops the old lab_tests table

-- Drop the old lab_tests table
DROP TABLE IF EXISTS lab_tests CASCADE;

-- Create marker_catalog table for reference lab markers
CREATE TABLE IF NOT EXISTS marker_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel text NOT NULL,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  synonyms text[],
  unit_si text,
  reference_min numeric,
  reference_max numeric,
  reference_unit text,
  optimal_min numeric,
  optimal_max numeric,
  optimal_unit text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lab_sets table to store test metadata
CREATE TABLE IF NOT EXISTS lab_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  source text CHECK (source IN ('upload','manual')) NOT NULL,
  collected_at date,
  input_units text,
  parse_method text, -- 'pdf'|'csv'|'manual'
  status text,       -- 'parsed'|'interpreted'|'error'
  panel_selection text[],
  demographics jsonb, -- {ageYears,sex,ethnicity,fasting}
  created_at timestamptz DEFAULT now(),
  -- Add updated_at column
  updated_at timestamptz DEFAULT now()
);

-- Create lab_results table to store individual test results in SI units
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES lab_sets(id) ON DELETE CASCADE,
  panel text,
  code text,
  name text,
  value_si numeric,
  unit_si text,
  value_raw numeric,
  unit_raw text,
  created_at timestamptz DEFAULT now(),
  -- Add updated_at column
  updated_at timestamptz DEFAULT now(),
  UNIQUE (set_id, code)
);

-- Create interpretations table to store AI analysis results
CREATE TABLE IF NOT EXISTS interpretations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES lab_sets(id) ON DELETE CASCADE,
  model text,
  summary text,
  flags jsonb,
  considerations jsonb,
  lifestyle jsonb,
  questions jsonb,
  safety_notice text,
  created_at timestamptz DEFAULT now(),
  -- Add updated_at column
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_marker_catalog_updated_at BEFORE UPDATE ON marker_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_sets_updated_at BEFORE UPDATE ON lab_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interpretations_updated_at BEFORE UPDATE ON interpretations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE marker_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interpretations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for marker_catalog (public read access)
CREATE POLICY "marker_catalog_read_all" ON marker_catalog FOR SELECT USING (true);
CREATE POLICY "marker_catalog_admin_only" ON marker_catalog FOR INSERT WITH CHECK (false);
CREATE POLICY "marker_catalog_admin_update" ON marker_catalog FOR UPDATE USING (false);
CREATE POLICY "marker_catalog_admin_delete" ON marker_catalog FOR DELETE USING (false);

-- Create RLS policies for user data isolation
CREATE POLICY "lab_sets_self" ON lab_sets
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lab_results_via_set" ON lab_results
FOR ALL USING (EXISTS (SELECT 1 FROM lab_sets s WHERE s.id = lab_results.set_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM lab_sets s WHERE s.id = lab_results.set_id AND s.user_id = auth.uid()));

CREATE POLICY "interpretations_via_set" ON interpretations
FOR ALL USING (EXISTS (SELECT 1 FROM lab_sets s WHERE s.id = interpretations.set_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM lab_sets s WHERE s.id = interpretations.set_id AND s.user_id = auth.uid()));

-- Create performance indexes
CREATE INDEX IF NOT EXISTS marker_catalog_panel_idx ON marker_catalog (panel);
CREATE INDEX IF NOT EXISTS marker_catalog_code_idx ON marker_catalog (code);
CREATE INDEX IF NOT EXISTS lab_sets_user_idx ON lab_sets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_results_set_idx ON lab_results (set_id);
CREATE INDEX IF NOT EXISTS lab_results_code_idx ON lab_results (code);
CREATE INDEX IF NOT EXISTS interpretations_set_idx ON interpretations (set_id);

-- Insert initial marker catalog data with conflict handling
INSERT INTO marker_catalog (panel, code, name, synonyms, unit_si, reference_min, reference_max, reference_unit, optimal_min, optimal_max, optimal_unit, description)
VALUES 
  -- Lipid Panel
  ('lipid', 'CHOL', 'Total Cholesterol', ARRAY['cholesterol', 'total cholesterol', 'chol', 'tc'], 'mmol/L', 3.9, 5.2, 'mmol/L', 3.9, 5.0, 'mmol/L', 'Total cholesterol in blood'),
  ('lipid', 'HDL', 'HDL Cholesterol', ARRAY['hdl', 'hdl cholesterol', 'high density lipoprotein'], 'mmol/L', 1.0, 2.6, 'mmol/L', 1.6, 2.6, 'mmol/L', 'High-density lipoprotein cholesterol, protective against heart disease'),
  ('lipid', 'LDL', 'LDL Cholesterol', ARRAY['ldl', 'ldl cholesterol', 'low density lipoprotein'], 'mmol/L', 1.8, 3.4, 'mmol/L', 0.0, 2.6, 'mmol/L', 'Low-density lipoprotein cholesterol, can contribute to arterial plaque'),
  ('lipid', 'TRIG', 'Triglycerides', ARRAY['triglycerides', 'trig', 'trigs'], 'mmol/L', 0.4, 1.7, 'mmol/L', 0.4, 1.1, 'mmol/L', 'Blood fats used for energy storage'),
  
  -- Basic Metabolic Panel
  ('metabolic', 'GLU', 'Glucose', ARRAY['glucose', 'blood glucose', 'bg', 'glu'], 'mmol/L', 3.9, 5.6, 'mmol/L', 4.4, 5.0, 'mmol/L', 'Blood sugar level'),
  ('metabolic', 'BUN', 'Blood Urea Nitrogen', ARRAY['bun', 'blood urea nitrogen', 'urea nitrogen'], 'mmol/L', 2.5, 7.1, 'mmol/L', 3.6, 6.4, 'mmol/L', 'Waste product filtered by kidneys'),
  ('metabolic', 'CREAT', 'Creatinine', ARRAY['creatinine', 'creat', 'cr'], 'μmol/L', 62, 106, 'μmol/L', 62, 97, 'μmol/L', 'Muscle waste product, kidney function marker'),
  ('metabolic', 'EGFR', 'eGFR', ARRAY['egfr', 'estimated gfr', 'glomerular filtration rate'], 'mL/min/1.73m²', 90, 120, 'mL/min/1.73m²', 90, 120, 'mL/min/1.73m²', 'Estimated kidney filtration rate'),
  
  -- Thyroid Panel
  ('thyroid', 'TSH', 'Thyroid Stimulating Hormone', ARRAY['tsh', 'thyroid stimulating hormone', 'thyrotropin'], 'mIU/L', 0.4, 4.0, 'mIU/L', 1.0, 2.5, 'mIU/L', 'Hormone that regulates thyroid function'),
  ('thyroid', 'T4', 'Free T4', ARRAY['free t4', 'ft4', 'thyroxine'], 'pmol/L', 12, 22, 'pmol/L', 15, 20, 'pmol/L', 'Main thyroid hormone, regulates metabolism'),
  ('thyroid', 'T3', 'Free T3', ARRAY['free t3', 'ft3', 'triiodothyronine'], 'pmol/L', 3.1, 6.8, 'pmol/L', 4.0, 6.0, 'pmol/L', 'Active thyroid hormone'),
  
  -- Complete Blood Count
  ('cbc', 'WBC', 'White Blood Cell Count', ARRAY['wbc', 'white blood cell', 'leukocytes'], '×10⁹/L', 4.0, 11.0, '×10⁹/L', 5.0, 8.0, '×10⁹/L', 'Immune system cells'),
  ('cbc', 'RBC', 'Red Blood Cell Count', ARRAY['rbc', 'red blood cell', 'erythrocytes'], '×10¹²/L', 4.2, 5.4, '×10¹²/L', 4.5, 5.2, '×10¹²/L', 'Oxygen-carrying blood cells'),
  ('cbc', 'HGB', 'Hemoglobin', ARRAY['hemoglobin', 'hgb', 'hb'], 'g/L', 120, 160, 'g/L', 135, 155, 'g/L', 'Oxygen-carrying protein in red blood cells'),
  ('cbc', 'HCT', 'Hematocrit', ARRAY['hematocrit', 'hct', 'packed cell volume'], '%', 36, 46, '%', 40, 45, '%', 'Percentage of blood volume that is red blood cells'),
  ('cbc', 'PLT', 'Platelet Count', ARRAY['platelets', 'plt', 'thrombocytes'], '×10⁹/L', 150, 450, '×10⁹/L', 200, 350, '×10⁹/L', 'Blood clotting cells'),
  
  -- Liver Function
  ('liver', 'ALT', 'Alanine Aminotransferase', ARRAY['alt', 'alanine aminotransferase', 'sgpt'], 'U/L', 7, 56, 'U/L', 10, 30, 'U/L', 'Liver enzyme, marker of liver health'),
  ('liver', 'AST', 'Aspartate Aminotransferase', ARRAY['ast', 'aspartate aminotransferase', 'sgot'], 'U/L', 10, 40, 'U/L', 15, 30, 'U/L', 'Liver enzyme, also found in heart and muscle'),
  ('liver', 'ALP', 'Alkaline Phosphatase', ARRAY['alp', 'alkaline phosphatase', 'alk phos'], 'U/L', 44, 147, 'U/L', 50, 120, 'U/L', 'Enzyme found in liver, bone, and other tissues'),
  ('liver', 'TBIL', 'Total Bilirubin', ARRAY['total bilirubin', 'tbil', 'bilirubin'], 'μmol/L', 5, 21, 'μmol/L', 5, 17, 'μmol/L', 'Waste product from red blood cell breakdown'),
  
  -- Vitamins and Minerals
  ('vitamins', 'VIT_D', 'Vitamin D', ARRAY['vitamin d', '25-oh vitamin d', 'calcidiol'], 'nmol/L', 75, 250, 'nmol/L', 100, 200, 'nmol/L', 'Essential vitamin for bone health and immune function'),
  ('vitamins', 'VIT_B12', 'Vitamin B12', ARRAY['vitamin b12', 'b12', 'cobalamin'], 'pmol/L', 148, 664, 'pmol/L', 300, 600, 'pmol/L', 'Essential vitamin for nerve function and red blood cell formation'),
  ('vitamins', 'FOLATE', 'Folate', ARRAY['folate', 'folic acid', 'vitamin b9'], 'nmol/L', 10, 42, 'nmol/L', 15, 35, 'nmol/L', 'B vitamin essential for DNA synthesis and red blood cell formation'),
  ('vitamins', 'FERRITIN', 'Ferritin', ARRAY['ferritin', 'iron stores'], 'μg/L', 15, 400, 'μg/L', 50, 150, 'μg/L', 'Iron storage protein, marker of iron status'),
  
  -- Inflammatory Markers
  ('inflammatory', 'CRP', 'C-Reactive Protein', ARRAY['crp', 'c-reactive protein'], 'mg/L', 0, 3, 'mg/L', 0, 1, 'mg/L', 'Marker of inflammation in the body'),
  ('inflammatory', 'ESR', 'Erythrocyte Sedimentation Rate', ARRAY['esr', 'sed rate'], 'mm/hr', 0, 30, 'mm/hr', 0, 15, 'mm/hr', 'Non-specific marker of inflammation'),
  
  -- Cardiac Markers
  ('cardiac', 'TROP_I', 'Troponin I', ARRAY['troponin i', 'trop i', 'cardiac troponin'], 'ng/L', 0, 40, 'ng/L', 0, 15, 'ng/L', 'Heart muscle protein, marker of heart damage'),
  ('cardiac', 'CK_MB', 'CK-MB', ARRAY['ck-mb', 'creatine kinase mb'], 'μg/L', 0, 6.3, 'μg/L', 0, 3.0, 'μg/L', 'Heart muscle enzyme'),
  
  -- Diabetes Markers
  ('diabetes', 'HBA1C', 'Hemoglobin A1C', ARRAY['hba1c', 'a1c', 'glycated hemoglobin'], '%', 4.0, 5.6, '%', 4.0, 5.0, '%', 'Average blood sugar over 2-3 months'),
  ('diabetes', 'INSULIN', 'Insulin', ARRAY['insulin', 'fasting insulin'], 'pmol/L', 18, 173, 'pmol/L', 18, 85, 'pmol/L', 'Hormone that regulates blood sugar')
ON CONFLICT (code) DO UPDATE SET
  panel = EXCLUDED.panel,
  name = EXCLUDED.name,
  synonyms = EXCLUDED.synonyms,
  unit_si = EXCLUDED.unit_si,
  reference_min = EXCLUDED.reference_min,
  reference_max = EXCLUDED.reference_max,
  reference_unit = EXCLUDED.reference_unit,
  optimal_min = EXCLUDED.optimal_min,
  optimal_max = EXCLUDED.optimal_max,
  optimal_unit = EXCLUDED.optimal_unit,
  description = EXCLUDED.description,
  updated_at = now();

-- Grant appropriate permissions
GRANT SELECT ON marker_catalog TO authenticated;
GRANT ALL ON lab_sets, lab_results, interpretations TO authenticated;

-- Migration completed successfully
SELECT 'Migration completed: Created lab_sets, lab_results, interpretations, and marker_catalog tables with RLS policies and indexes' as status;
