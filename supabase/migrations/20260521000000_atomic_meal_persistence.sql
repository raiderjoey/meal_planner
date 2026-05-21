-- Atomic Meal Persistence RPC
-- This migration adds a function to create a meal plan and its participants in a single transaction.

CREATE OR REPLACE FUNCTION create_meal_with_participants(
  p_household_id UUID,
  p_scheduled_date DATE,
  p_meal_type meal_type,
  p_recipe_id UUID DEFAULT NULL,
  p_standalone_data JSONB DEFAULT NULL,
  p_participant_ids UUID[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_meal_plan_id UUID;
  v_current_household_id UUID;
BEGIN
  -- 1. Validate authentication and household
  v_current_household_id := get_current_user_household_id();
  
  IF v_current_household_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated or no household assigned';
  END IF;

  IF p_household_id != v_current_household_id THEN
    RAISE EXCEPTION 'Unauthorized: Household ID mismatch';
  END IF;

  -- 2. Insert into meal_plans
  INSERT INTO meal_plans (
    household_id,
    scheduled_date,
    meal_type,
    recipe_id,
    standalone_data
  ) VALUES (
    p_household_id,
    p_scheduled_date,
    p_meal_type,
    p_recipe_id,
    p_standalone_data
  ) RETURNING id INTO v_meal_plan_id;

  -- 3. Insert into meal_participants
  IF array_length(p_participant_ids, 1) > 0 THEN
    INSERT INTO meal_participants (
      household_id,
      meal_plan_id,
      user_id,
      portion_multiplier,
      status
    )
    SELECT 
      p_household_id,
      v_meal_plan_id,
      u_id,
      1.0,
      'planned'
    FROM unnest(p_participant_ids) AS u_id;
  END IF;

  RETURN v_meal_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_meal_with_participants TO authenticated;

-- Ensure RLS policies are robust for the new RPC
-- The RPC is SECURITY DEFINER, so it bypasses RLS, but we've added manual household validation.
-- No additional RLS changes are strictly required for the RPC to function, 
-- but we ensure the existing policies on meal_participants are consistent.
COMMENT ON FUNCTION create_meal_with_participants IS 'Creates a meal plan and associated participants in a single atomic transaction.';
