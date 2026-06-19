/*
  # General Round Counters

  Standalone counters for tracking crochet rounds
  outside of specific patterns.
*/

CREATE TABLE IF NOT EXISTS counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  current_round integer NOT NULL DEFAULT 0,
  target_rounds integer DEFAULT 0,
  notes text DEFAULT '',
  color text DEFAULT 'sage',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public access to counters" ON counters FOR ALL USING (true) WITH CHECK (true);
