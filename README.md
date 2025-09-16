# KnowMyLabs Database Migration

## Running the Database Migration

To migrate from the old `lab_tests` table to the new three-table schema, run the following commands:

### Option 1: Using the v0 Scripts Runner
1. Navigate to the Scripts tab in v0
2. Run the `migrate-to-new-schema.sql` script

### Option 2: Using Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/migrate-to-new-schema.sql`
4. Click "Run" to execute the migration

### Option 3: Using psql Command Line
\`\`\`bash
psql $POSTGRES_URL -f scripts/migrate-to-new-schema.sql
\`\`\`

## New Schema Overview

The migration replaces the single `lab_tests` table with three specialized tables:

- **`lab_sets`**: Stores metadata about each lab test upload/session
- **`lab_results`**: Stores individual test results with both SI and raw values
- **`interpretations`**: Stores AI-generated analysis and recommendations

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## Important Notes

⚠️ **This migration will delete all existing data in the `lab_tests` table.** Make sure to backup any important data before running the migration.

The new schema supports:
- Multiple lab panels per test session
- SI unit conversion with original value preservation
- Structured AI interpretation storage
- Enhanced security with RLS policies
