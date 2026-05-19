-- Collection Recipes
CREATE TABLE collection_recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  collection_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (collection_id, household_id) REFERENCES collections(id, household_id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id, household_id) REFERENCES recipes(id, household_id) ON DELETE CASCADE,
  UNIQUE (collection_id, recipe_id)
);

-- Recipe Tags
CREATE TABLE recipe_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  recipe_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (recipe_id, household_id) REFERENCES recipes(id, household_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id, household_id) REFERENCES tags(id, household_id) ON DELETE CASCADE,
  UNIQUE (recipe_id, tag_id)
);

-- Performance Indexes
CREATE INDEX idx_collection_recipes_household_id ON collection_recipes(household_id);
CREATE INDEX idx_collection_recipes_collection_id ON collection_recipes(collection_id);
CREATE INDEX idx_collection_recipes_recipe_id ON collection_recipes(recipe_id);
CREATE INDEX idx_recipe_tags_household_id ON recipe_tags(household_id);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag_id ON recipe_tags(tag_id);

-- Enable RLS
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
