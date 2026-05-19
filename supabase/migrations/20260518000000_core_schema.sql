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
  updated_at timestamptz DEFAULT now()
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

-- Function to get household_id without recursion
CREATE OR REPLACE FUNCTION get_current_user_household_id()
RETURNS uuid AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Households
CREATE POLICY "Authenticated users can create a household" ON households
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Households SELECT policy
CREATE POLICY "Users can view their own household" ON households
  FOR SELECT USING (id = get_current_user_household_id());

-- Households UPDATE/DELETE policy
CREATE POLICY "Users can manage their own household" ON households
  FOR ALL USING (id = get_current_user_household_id());

-- Policies for Profiles
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles SELECT policy
CREATE POLICY "Users can view household members" ON profiles
  FOR SELECT USING (
    (id = auth.uid()) OR 
    (household_id = get_current_user_household_id())
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
