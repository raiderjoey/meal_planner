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

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Households
CREATE POLICY "Users can view their own household" ON households
  FOR SELECT USING (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own household" ON households
  FOR UPDATE USING (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policies for Profiles
CREATE POLICY "Profiles are viewable by household members" ON profiles
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
