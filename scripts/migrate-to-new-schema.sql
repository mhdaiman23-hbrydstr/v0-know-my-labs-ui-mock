-- Migration: Replace lab_tests table with new schema
-- This migration creates three new tables: lab_sets, lab_results, interpretations
-- and drops the old lab_tests table

-- Drop the old lab_tests table
DROP TABLE IF EXISTS lab_tests CASCADE;

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
  created_at timestamptz DEFAULT now()
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
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE lab_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interpretations ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS lab_sets_user_idx ON lab_sets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_results_set_idx ON lab_results (set_id);
CREATE INDEX IF NOT EXISTS interpretations_set_idx ON interpretations (set_id);
