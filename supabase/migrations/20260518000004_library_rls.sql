-- Collections: Owner can do anything; Household can view/edit if toggled
CREATE POLICY "Manage own collections" ON collections FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "View shared household collections" ON collections FOR SELECT
  USING (household_id = get_current_user_household_id() AND is_shared_with_household = true);

CREATE POLICY "Edit shared household collections" ON collections FOR UPDATE
  USING (household_id = get_current_user_household_id() AND is_shared_with_household = true AND can_household_edit = true);

-- Junctions: Restricted by parent collection access
CREATE POLICY "Manage collection recipes" ON collection_recipes FOR ALL
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
