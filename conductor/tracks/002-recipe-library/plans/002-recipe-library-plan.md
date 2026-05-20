# HarvestPlan Recipe Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive Recipe Library with natural language ingredient parsing, dynamic nutritional scaling, and intra-household collection sharing.

**Architecture:** Extends the multi-tenant Supabase schema with collections and tags. Uses a custom parsing utility (Regex/NLP) on the frontend for ingredient entry, backed by a Supabase Edge Function for Nutrition API queries.

**Tech Stack:** React, TypeScript, Supabase (PostgreSQL, Storage, Edge Functions), Vanilla CSS.

---

### Status Report (Task 4 - Ingredient Parser)
The initial implementation of the `ingredientParser` utility and its tests revealed several robustness flaws that require refinement:
- **Attached Units:** Strings like "1lb chicken" or "500g beef" are incorrectly parsed because the current logic splits by whitespace. The parser must detect where digits end and unit names begin.
- **Noise Words:** "of" noise words (e.g., "1 cup of sugar") are currently included in the ingredient name ("of sugar") instead of being stripped.
- **Unit Normalization:** The `KNOWN_UNITS` list contains singular and plural forms, but the parser does not currently normalize them to a standard form (e.g., "lbs" -> "lb").
- **Current State:** Basic parsing works, but the "attached unit" test case is failing.

---

### Task 1: Schema Phase A - Collections & Tags

**Files:**
- Create: `supabase/migrations/20260518000002_collections_tags.sql`

- [x] **Step 1: Write Migration for core entities**
- [x] **Step 2: Immediate Review**
- [x] **Step 3: Commit**

---

### Task 2: Schema Phase B - Relationships & Junctions

**Files:**
- Create: `supabase/migrations/20260518000003_library_relationships.sql`

- [x] **Step 1: Create Junction Tables with Composite FKs**
- [x] **Step 2: Immediate Review**
- [x] **Step 3: Commit**

---

### Task 3: Schema Phase C - Integrity & RLS

**Files:**
- Create: `supabase/migrations/20260518000004_library_rls.sql`

- [x] **Step 1: Implement RLS Policies for Sharing**
```sql
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- Collections: Owner can do anything; Household can view/edit if toggled
CREATE POLICY "Manage own collections" ON collections FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "View shared household collections" ON collections FOR SELECT
  USING (household_id = get_current_user_household_id() AND is_shared_with_household = true);

CREATE POLICY "Edit shared household collections" ON collections FOR UPDATE
  USING (household_id = get_current_user_household_id() AND is_shared_with_household = true AND can_household_edit = true);

-- Junctions: Restricted by parent collection access
CREATE POLICY "View collection recipes" ON collection_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (c.user_id = auth.uid() OR (c.household_id = get_current_user_household_id() AND c.is_shared_with_household = true))
    )
  );

CREATE POLICY "Modify collection recipes" ON collection_recipes FOR INSERT, UPDATE, DELETE
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
```

- [x] **Step 2: Immediate Review**
- [x] **Step 3: Commit**

---

### Task 4: Ingredient Parser Logic (Refined)

**Files:**
- `src/utils/ingredientParser.ts`
- `src/utils/__tests__/ingredientParser.test.ts`

- [x] **Step 1: Write comprehensive tests for parsing** (Included "of" and edge cases)
- [x] **Step 2: Implement Robust Parser**
    - [x] Handle attached units via regex (e.g., `^(\d+)(\w+)`)
    - [x] Strip "of" noise words between unit and ingredient
    - [x] Normalize units to singular or consistent form
- [x] **Step 3: Verify all tests pass (including "1lb chicken")**
---

### Task 5: Recipe Creator UI

**Files:**
- `src/pages/Recipes/RecipeCreator.tsx`
- `src/components/Recipes/IngredientEntry.tsx`
- `src/pages/Recipes/__tests__/RecipeCreator.test.tsx`

- [x] **Step 1: Implement multi-step form**
- [x] **Step 2: Implement "Interactive Correction"** (Implemented basic preview; full correction deferred to future phase)
- [x] **Step 3: Implement Unit Tests** (Verified step navigation and input validation)
- [x] **Step 4: Commit**

---

### Task 6: Library View & Filtering

**Files:**
- `src/pages/Recipes/RecipeLibrary.tsx`
- `src/components/Recipes/RecipeCard.tsx`
- `src/components/Recipes/__tests__/RecipeCard.test.tsx`
- `src/pages/Recipes/__tests__/RecipeLibrary.test.tsx`

- [x] **Step 1: Implement Bento Grid Library**
- [x] **Step 2: Implement Tag & Collection Sidebar**
- [x] **Step 3: Implement Unit & Integration Tests** (Verified rendering, navigation, and filter toggling)
- [x] **Step 4: Commit**

---
