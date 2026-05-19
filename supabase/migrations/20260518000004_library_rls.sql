-- Collections: Owner can do anything; Household can view/edit if toggled
CREATE POLICY "Manage own collections" ON collections FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "View shared household collections" ON collections FOR SELECT
  USING (household_id = get_current_user_household_id() AND is_shared_with_household = true);

CREATE POLICY "Edit shared household collections" ON collections FOR UPDATE
  USING (household_id = get_current_user_household_id() AND is_shared_with_household = true AND can_household_edit = true)
  WITH CHECK (household_id = get_current_user_household_id() AND is_shared_with_household = true AND can_household_edit = true);

-- Junctions: Restricted by parent collection access
-- Drop the restrictive "FOR ALL" policy
DROP POLICY IF EXISTS "Manage collection recipes" ON collection_recipes;

-- Split into View vs Modify
CREATE POLICY "View collection recipes" ON collection_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (c.user_id = auth.uid() OR (c.household_id = get_current_user_household_id() AND c.is_shared_with_household = true))
    )
  );

-- VULN-001 Fix: Split into INSERT and UPDATE/DELETE to use WITH CHECK/USING correctly
CREATE POLICY "Insert collection recipes" ON collection_recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (c.user_id = auth.uid() OR (c.household_id = get_current_user_household_id() AND c.is_shared_with_household = true AND c.can_household_edit = true))
    )
  );

CREATE POLICY "Modify collection recipes" ON collection_recipes FOR UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (c.user_id = auth.uid() OR (c.household_id = get_current_user_household_id() AND c.is_shared_with_household = true AND c.can_household_edit = true))
    )
  );

-- Tags: Household-wide collaborative tagging
CREATE POLICY "Manage household tags" ON tags FOR ALL
  USING (household_id = get_current_user_household_id());

CREATE POLICY "Manage recipe tags" ON recipe_tags FOR ALL
  USING (household_id = get_current_user_household_id());
