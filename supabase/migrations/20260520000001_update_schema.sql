-- Create user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'member' NOT NULL;

-- Create system_info table
CREATE TABLE IF NOT EXISTS system_info (
  id integer PRIMARY KEY CHECK (id = 1), -- Ensure only one row
  current_version text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create system_updates table
CREATE TABLE IF NOT EXISTS system_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_version text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  log_output text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE system_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- RLS Policies for system_info
DO $$ BEGIN
    CREATE POLICY "Authenticated users can read system_info" ON system_info
      FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for system_updates
DO $$ BEGIN
    CREATE POLICY "Authenticated users can read system_updates" ON system_updates
      FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can insert system_updates" ON system_updates
      FOR INSERT WITH CHECK (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can update system_updates" ON system_updates
      FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Trigger for updated_at on system_updates
DROP TRIGGER IF EXISTS on_system_updates_update ON system_updates;
CREATE TRIGGER on_system_updates_update
  BEFORE UPDATE ON system_updates
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Trigger for updated_at on system_info
DROP TRIGGER IF EXISTS on_system_info_update ON system_info;
CREATE TRIGGER on_system_info_update
  BEFORE UPDATE ON system_info
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Seed initial system info
INSERT INTO system_info (id, current_version) VALUES (1, '0.1.0') ON CONFLICT (id) DO NOTHING;
