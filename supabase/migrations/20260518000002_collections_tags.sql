-- Collections table
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  is_shared_with_household boolean DEFAULT false,
  can_household_edit boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (id, household_id) -- For composite FKs
);

-- Tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (household_id, name),
  UNIQUE (id, household_id) -- For composite FKs
);

-- Performance Indexes
CREATE INDEX idx_collections_household_id ON collections(household_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_tags_household_id ON tags(household_id);

-- Triggers for updated_at
CREATE TRIGGER on_collection_update BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
