/*
  # Enhanced Pattern Management Schema

  1. Updates to patterns table
    - Add gauge (muestras)
    - Add finished measurements
    - Add abbreviations legend
    - Add materials list as JSONB

  2. New table: pattern_rounds
    - Individual round/row instructions within each section
    - Support for both written instructions and visual notes
    - Checkboxes for completion tracking

  3. Updates to pattern_sections
    - Remove total_rounds/current_round (now in pattern_rounds)
*/

-- Update patterns table with crochet-specific fields
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS gauge text;
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS measurements text;
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS abbreviations jsonb DEFAULT '[]'::jsonb;
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS pattern_materials jsonb DEFAULT '[]'::jsonb;

-- Update pattern_sections table
ALTER TABLE pattern_sections DROP COLUMN IF EXISTS total_rounds;
ALTER TABLE pattern_sections DROP COLUMN IF EXISTS current_round;

-- Create pattern_rounds table for detailed round tracking
CREATE TABLE IF NOT EXISTS pattern_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES pattern_sections(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  instruction text NOT NULL,
  stitch_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pattern_rounds ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public access to pattern_rounds" ON pattern_rounds FOR ALL USING (true) WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_pattern_rounds_section_id ON pattern_rounds(section_id);
CREATE INDEX IF NOT EXISTS idx_pattern_rounds_number ON pattern_rounds(section_id, round_number);
