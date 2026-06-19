/*
  # Enhanced Counters with Stitch Tracking

  Add stitch counters for tracking individual stitch types
  within each row/round.
*/

-- Add stitch counter columns to counters table
ALTER TABLE counters ADD COLUMN IF NOT EXISTS pb_count integer DEFAULT 0;
ALTER TABLE counters ADD COLUMN IF NOT EXISTS aum_count integer DEFAULT 0;
ALTER TABLE counters ADD COLUMN IF NOT EXISTS dism_count integer DEFAULT 0;
ALTER TABLE counters ADD COLUMN IF NOT EXISTS cad_count integer DEFAULT 0;
ALTER TABLE counters ADD COLUMN IF NOT EXISTS total_stitches integer DEFAULT 0;
