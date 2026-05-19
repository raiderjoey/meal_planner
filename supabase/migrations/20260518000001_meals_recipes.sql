-- Recipes table
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  title text NOT NULL,
  instructions text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (id, household_id)
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE (id, household_id),
  UNIQUE (household_id, name)
);

-- Recipe Ingredients link (Junction table)
CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL, -- Denormalized for RLS
  recipe_id uuid NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity numeric NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (recipe_id, household_id) REFERENCES recipes(id, household_id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id, household_id) REFERENCES ingredients(id, household_id) ON DELETE CASCADE,
  UNIQUE (recipe_id, ingredient_id)
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE (id, household_id)
);

-- Meal Ingredients (Junction table for standalone additions to a meal)
CREATE TABLE meal_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL, -- Denormalized for RLS
  meal_id uuid NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity numeric NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (meal_id, household_id) REFERENCES meals(id, household_id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id, household_id) REFERENCES ingredients(id, household_id) ON DELETE CASCADE,
  UNIQUE (meal_id, ingredient_id)
);

-- User Meal Portions (Junction table)
CREATE TABLE user_meal_portions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL, -- Denormalized for RLS
  meal_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  portion_size numeric NOT NULL DEFAULT 1.0,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (meal_id, household_id) REFERENCES meals(id, household_id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id, household_id) REFERENCES profiles(id, household_id) ON DELETE CASCADE,
  UNIQUE (meal_id, profile_id)
);

-- Pantry Items
CREATE TABLE pantry_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity numeric DEFAULT 0,
  unit text,
  is_in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (ingredient_id, household_id) REFERENCES ingredients(id, household_id) ON DELETE CASCADE,
  UNIQUE (household_id, ingredient_id)
);

-- Indexes for performance
CREATE INDEX idx_recipes_household_id ON recipes(household_id);
CREATE INDEX idx_ingredients_household_id ON ingredients(household_id);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_recipe_ingredients_household_id ON recipe_ingredients(household_id);

CREATE INDEX idx_meals_household_id ON meals(household_id);
CREATE INDEX idx_meals_recipe_id ON meals(recipe_id);
CREATE INDEX idx_meals_planned_at ON meals(planned_at);

CREATE INDEX idx_meal_ingredients_meal_id ON meal_ingredients(meal_id);
CREATE INDEX idx_meal_ingredients_ingredient_id ON meal_ingredients(ingredient_id);
CREATE INDEX idx_meal_ingredients_household_id ON meal_ingredients(household_id);

CREATE INDEX idx_user_meal_portions_meal_id ON user_meal_portions(meal_id);
CREATE INDEX idx_user_meal_portions_profile_id ON user_meal_portions(profile_id);
CREATE INDEX idx_user_meal_portions_household_id ON user_meal_portions(household_id);

CREATE INDEX idx_pantry_items_household_id ON pantry_items(household_id);
CREATE INDEX idx_pantry_items_ingredient_id ON pantry_items(ingredient_id);

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
CREATE POLICY "Manage household recipe ingredients" ON recipe_ingredients FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household meals" ON meals FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household meal ingredients" ON meal_ingredients FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household portions" ON user_meal_portions FOR ALL USING (household_id = get_current_user_household_id());
CREATE POLICY "Manage household pantry" ON pantry_items FOR ALL USING (household_id = get_current_user_household_id());
