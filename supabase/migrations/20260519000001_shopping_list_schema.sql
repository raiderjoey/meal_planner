-- Create ad_hoc_shopping_items table
CREATE TABLE ad_hoc_shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  ingredient_id UUID, -- Optional link to an ingredient for pantry integration
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique for multi-tenant FKs
  UNIQUE (id, household_id),
  
  -- Composite FK for ingredient to ensure it belongs to the same household
  CONSTRAINT ad_hoc_shopping_items_ingredient_id_household_id_fkey 
    FOREIGN KEY (ingredient_id, household_id) REFERENCES ingredients(id, household_id) ON DELETE SET NULL
);

-- Add indexes for RLS and performance
CREATE INDEX idx_ad_hoc_shopping_items_household ON ad_hoc_shopping_items(household_id);
CREATE INDEX idx_ad_hoc_shopping_items_resolved ON ad_hoc_shopping_items(household_id, is_resolved);
CREATE INDEX idx_ad_hoc_shopping_items_ingredient ON ad_hoc_shopping_items(ingredient_id);

-- Updated_at trigger
CREATE TRIGGER on_ad_hoc_shopping_item_update
  BEFORE UPDATE ON ad_hoc_shopping_items
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Enable RLS
ALTER TABLE ad_hoc_shopping_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Manage household ad hoc shopping items" ON ad_hoc_shopping_items
  FOR ALL USING (household_id = get_current_user_household_id());

-- RPC: get_shopping_list
-- Aggregates ingredients from meal plans and ad-hoc items, subtracting pantry stock for recipe ingredients.
CREATE OR REPLACE FUNCTION get_shopping_list(start_date DATE, end_date DATE)
RETURNS TABLE (
  ingredient_id UUID,
  ad_hoc_id UUID,
  name TEXT,
  required_quantity NUMERIC,
  pantry_quantity NUMERIC,
  buy_quantity NUMERIC,
  unit TEXT,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH recipe_reqs AS (
    -- Aggregate ingredients from recipes in meal plans
    SELECT
      ri.ingredient_id,
      i.name,
      SUM(ri.quantity * COALESCE(mp_sum.total_portions, 1)) AS required_quantity,
      i.unit
    FROM meal_plans mp
    JOIN recipe_ingredients ri ON mp.recipe_id = ri.recipe_id AND mp.household_id = ri.household_id
    JOIN ingredients i ON ri.ingredient_id = i.id AND ri.household_id = i.household_id
    LEFT JOIN (
      SELECT meal_plan_id, SUM(portion_multiplier) AS total_portions
      FROM meal_participants
      GROUP BY meal_plan_id
    ) mp_sum ON mp.id = mp_sum.meal_plan_id
    WHERE mp.household_id = get_current_user_household_id()
      AND mp.scheduled_date >= start_date
      AND mp.scheduled_date <= end_date
    GROUP BY ri.ingredient_id, i.name, i.unit
  ),
  ad_hoc_reqs AS (
    -- Get unresolved ad-hoc items
    SELECT
      id AS ad_hoc_id,
      ad_hoc_shopping_items.ingredient_id,
      ad_hoc_shopping_items.name,
      quantity AS required_quantity,
      ad_hoc_shopping_items.unit
    FROM ad_hoc_shopping_items
    WHERE household_id = get_current_user_household_id()
      AND is_resolved = false
  )
  -- Recipe ingredients (subtracting pantry)
  SELECT
    r.ingredient_id,
    NULL::UUID AS ad_hoc_id,
    r.name,
    r.required_quantity,
    COALESCE(p.quantity, 0) AS pantry_quantity,
    GREATEST(0, r.required_quantity - COALESCE(p.quantity, 0)) AS buy_quantity,
    r.unit,
    'recipe'::TEXT AS source
  FROM recipe_reqs r
  LEFT JOIN pantry_items p ON r.ingredient_id = p.ingredient_id AND p.household_id = get_current_user_household_id() AND p.is_in_stock = true
  WHERE GREATEST(0, r.required_quantity - COALESCE(p.quantity, 0)) > 0

  UNION ALL

  -- Ad-hoc items (always buy full quantity)
  SELECT
    a.ingredient_id,
    a.ad_hoc_id,
    a.name,
    a.required_quantity,
    0 AS pantry_quantity,
    a.required_quantity AS buy_quantity,
    a.unit,
    'ad_hoc'::TEXT AS source
  FROM ad_hoc_reqs a;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- RPC: resolve_shopping_item
-- Marks an item as resolved and updates the pantry inventory.
-- Handles both ad-hoc items and direct ingredient IDs.
CREATE OR REPLACE FUNCTION resolve_shopping_item(p_item_id UUID, p_quantity NUMERIC)
RETURNS void AS $$
DECLARE
  v_household_id UUID;
  v_ingredient_id UUID;
BEGIN
  v_household_id := get_current_user_household_id();

  -- 1. Check if it's an ad-hoc item
  SELECT ingredient_id INTO v_ingredient_id
  FROM ad_hoc_shopping_items 
  WHERE id = p_item_id AND household_id = v_household_id;

  IF FOUND THEN
    -- Mark ad-hoc as resolved
    UPDATE ad_hoc_shopping_items
    SET is_resolved = true, updated_at = NOW()
    WHERE id = p_item_id AND household_id = v_household_id;

    -- If it was linked to an ingredient, update pantry too
    IF v_ingredient_id IS NOT NULL THEN
      INSERT INTO pantry_items (household_id, ingredient_id, quantity, is_in_stock)
      VALUES (v_household_id, v_ingredient_id, p_quantity, true)
      ON CONFLICT (household_id, ingredient_id)
      DO UPDATE SET 
        quantity = pantry_items.quantity + EXCLUDED.quantity,
        is_in_stock = true,
        updated_at = NOW();
    END IF;
    RETURN;
  END IF;

  -- 2. If not ad-hoc, check if it's a direct ingredient ID (from recipe aggregation)
  IF EXISTS (SELECT 1 FROM ingredients WHERE id = p_item_id AND household_id = v_household_id) THEN
    INSERT INTO pantry_items (household_id, ingredient_id, quantity, is_in_stock)
    VALUES (v_household_id, p_item_id, p_quantity, true)
    ON CONFLICT (household_id, ingredient_id)
    DO UPDATE SET 
      quantity = pantry_items.quantity + EXCLUDED.quantity,
      is_in_stock = true,
      updated_at = NOW();
    RETURN;
  END IF;

  RAISE EXCEPTION 'Item not found or does not belong to household';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
