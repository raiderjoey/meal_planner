CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Households table
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  household_id uuid REFERENCES households ON DELETE SET NULL,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (id, household_id)
);

-- Add index for performance
CREATE INDEX idx_profiles_household_id ON profiles(household_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Function to get household_id without recursion, marked as STABLE for performance
CREATE OR REPLACE FUNCTION get_current_user_household_id()
RETURNS uuid AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Households
CREATE POLICY "Authenticated users can create a household" ON households
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own household" ON households
  FOR ALL USING (id = get_current_user_household_id());

-- Policies for Profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile fields" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (household_id IS NOT DISTINCT FROM (SELECT household_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can view household members" ON profiles
  FOR SELECT USING (
    household_id = get_current_user_household_id()
  );

-- Function for atomic household creation
CREATE OR REPLACE FUNCTION create_household(household_name text)
RETURNS households AS $$
DECLARE
  new_household households;
BEGIN
  -- Harden check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO households (name) VALUES (household_name) RETURNING * INTO new_household;
  UPDATE profiles SET household_id = new_household.id WHERE id = auth.uid();
  RETURN new_household;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop direct insert policy
DROP POLICY "Authenticated users can create a household" ON households;
