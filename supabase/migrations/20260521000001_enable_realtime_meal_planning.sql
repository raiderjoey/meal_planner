-- Enable Realtime for Meal Planning tables
-- This allows the frontend to receive push updates when meals or participants change.

-- 1. Ensure the publication exists (usually created by Supabase default)
-- But we use a DO block to be safe.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- 2. Add tables to the publication
-- We use individual ALTER statements to be explicit.
ALTER PUBLICATION supabase_realtime ADD TABLE meal_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_participants;

COMMENT ON TABLE meal_plans IS 'Realtime updates enabled for weekly planning sync.';
COMMENT ON TABLE meal_participants IS 'Realtime updates enabled for household participant sync.';
