-- Recipes table
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  title text NOT NULL,
  instructions text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meals table
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  recipe_id uuid REFERENCES recipes ON DELETE SET NULL,
  meal_type text CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks', 'Snack')),
  planned_at date NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_recipes_household_id ON recipes(household_id);
CREATE INDEX idx_meals_household_id ON meals(household_id);
CREATE INDEX idx_meals_planned_at ON meals(planned_at);

-- Triggers
CREATE TRIGGER on_recipe_update BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_meal_update BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their household recipes" ON recipes
  FOR ALL USING (household_id = get_current_user_household_id());

CREATE POLICY "Users can manage their household meals" ON meals
  FOR ALL USING (household_id = get_current_user_household_id());
