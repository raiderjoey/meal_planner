-- Cleanup old foundation placeholder tables
DROP TABLE IF EXISTS user_meal_portions;
DROP TABLE IF EXISTS meal_ingredients;
DROP TABLE IF EXISTS meals;

-- Add meal_type enum
DO $$ BEGIN
    CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'drinks', 'snacks');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add participation_status enum
DO $$ BEGIN
    CREATE TYPE participation_status AS ENUM ('planned', 'consumed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create meal_plans table
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  meal_type meal_type NOT NULL,
  recipe_id UUID,
  standalone_data JSONB, -- { name: string, nutrition: { calories: number, ... } }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique for multi-tenant FKs
  UNIQUE (id, household_id),
  
  -- Ensure either recipe or standalone data exists
  CONSTRAINT recipe_or_standalone CHECK (
    (recipe_id IS NOT NULL AND standalone_data IS NULL) OR 
    (recipe_id IS NULL AND standalone_data IS NOT NULL)
  ),
  
  -- Composite FK for recipe to ensure it belongs to the same household
  CONSTRAINT meal_plans_recipe_id_household_id_fkey 
    FOREIGN KEY (recipe_id, household_id) REFERENCES recipes(id, household_id) ON DELETE SET NULL
);

-- Create meal_participants table
CREATE TABLE meal_participants (
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  meal_plan_id UUID NOT NULL,
  user_id UUID NOT NULL,
  portion_multiplier DECIMAL(4,2) DEFAULT 1.0 CONSTRAINT portion_multiplier_positive CHECK (portion_multiplier > 0),
  status participation_status DEFAULT 'planned',
  
  PRIMARY KEY (meal_plan_id, user_id),
  
  -- Composite FKs for multi-tenancy and integrity
  CONSTRAINT meal_participants_meal_plan_id_household_id_fkey
    FOREIGN KEY (meal_plan_id, household_id) REFERENCES meal_plans(id, household_id) ON DELETE CASCADE,
  CONSTRAINT meal_participants_user_id_household_id_fkey
    FOREIGN KEY (user_id, household_id) REFERENCES profiles(id, household_id) ON DELETE CASCADE
);

-- Add indexes for RLS and performance
CREATE INDEX idx_meal_plans_household ON meal_plans(household_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(scheduled_date);
CREATE INDEX idx_meal_participants_household ON meal_participants(household_id);
CREATE INDEX idx_meal_participants_user ON meal_participants(user_id);

-- Updated_at trigger
CREATE TRIGGER on_meal_plan_update
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Manage household meal plans" ON meal_plans
  FOR ALL USING (household_id = get_current_user_household_id());

CREATE POLICY "View household meal participants" ON meal_participants
  FOR SELECT USING (household_id = get_current_user_household_id());

CREATE POLICY "Add household meal participants" ON meal_participants
  FOR INSERT WITH CHECK (household_id = get_current_user_household_id());

CREATE POLICY "Update household meal participation" ON meal_participants
  FOR UPDATE USING (household_id = get_current_user_household_id());

CREATE POLICY "Delete household meal participation" ON meal_participants
  FOR DELETE USING (household_id = get_current_user_household_id());
