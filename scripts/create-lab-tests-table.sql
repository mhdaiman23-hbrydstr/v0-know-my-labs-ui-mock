-- Create lab tests table to store user lab test results
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  panels TEXT[] DEFAULT '{}',
  file_name TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_lab_tests_user_id ON lab_tests(user_id);

-- Create an index on test_date for chronological queries
CREATE INDEX IF NOT EXISTS idx_lab_tests_test_date ON lab_tests(test_date);

-- Enable Row Level Security
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own lab tests
CREATE POLICY "Users can view their own lab tests" ON lab_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab tests" ON lab_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab tests" ON lab_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab tests" ON lab_tests
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_lab_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lab_tests_updated_at
  BEFORE UPDATE ON lab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_tests_updated_at();
