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

-- Ingredients table
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  name text NOT NULL,
  calories numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  sodium numeric DEFAULT 0,
  protein numeric DEFAULT 0,
  fiber numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  sugar numeric DEFAULT 0,
  unit text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recipe Ingredients link
CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients NOT NULL,
  quantity numeric NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now()
);

-- Meals table
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  recipe_id uuid REFERENCES recipes ON DELETE SET NULL,
  title text, -- For standalone meals
  meal_type text CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks', 'Snacks')),
  planned_at date NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meal Ingredients (for standalone additions to a meal)
CREATE TABLE meal_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id uuid REFERENCES meals ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients NOT NULL,
  quantity numeric NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now()
);

-- User Meal Portions
CREATE TABLE user_meal_portions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id uuid REFERENCES meals ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  portion_size numeric NOT NULL DEFAULT 1.0,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Pantry Items
CREATE TABLE pantry_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  ingredient_id uuid REFERENCES ingredients NOT NULL,
  quantity numeric DEFAULT 0,
  unit text,
  is_in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Triggers
CREATE TRIGGER on_recipe_update BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER on_ingredient_update BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER on_meal_update BEFORE UPDATE ON meals FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER on_pantry_item_update BEFORE UPDATE ON pantry_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meal_portions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage household recipes" ON recipes FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household ingredients" ON ingredients FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household recipe ingredients" ON recipe_ingredients FOR ALL USING (recipe_id IN (SELECT id FROM recipes WHERE household_id = get_current_user_household_id()));
CREATE POLICY "Manage household meals" ON meals FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household meal ingredients" ON meal_ingredients FOR ALL USING (meal_id IN (SELECT id FROM meals WHERE household_id = get_current_user_household_id()));
CREATE POLICY "Manage household portions" ON user_meal_portions FOR ALL USING (meal_id IN (SELECT id FROM meals WHERE household_id = get_current_user_household_id()));
CREATE POLICY "Manage household pantry" ON pantry_items FOR ALL USING (household_id = get_current_user_household_id());
