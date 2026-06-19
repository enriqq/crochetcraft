/*
  # Custom Stitch Counters

  Add support for user-defined custom stitch counters
  stored as JSONB for maximum flexibility.
*/

-- Add custom_counters column to store user-defined counters
ALTER TABLE counters ADD COLUMN IF NOT EXISTS custom_counters jsonb DEFAULT '[]'::jsonb;

-- Example custom counter structure stored in the array:
-- [
--   { "id": "uuid", "name": "Punto Alto", "abbr": "pa", "count": 0, "color": "blue" }
-- ]
