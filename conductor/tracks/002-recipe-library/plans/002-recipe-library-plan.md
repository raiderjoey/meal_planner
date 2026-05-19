# HarvestPlan Recipe Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive Recipe Library with natural language ingredient parsing, dynamic nutritional scaling, and intra-household collection sharing.

**Architecture:** Extends the multi-tenant Supabase schema with collections and tags. Uses a custom parsing utility (Regex/NLP) on the frontend for ingredient entry, backed by a Supabase Edge Function for Nutrition API queries.

**Tech Stack:** React, TypeScript, Supabase (PostgreSQL, Storage, Edge Functions), Vanilla CSS.

---

### Task 1: Schema Phase A - Collections & Tags

**Files:**
- Create: `supabase/migrations/20260518000002_collections_tags.sql`

- [x] **Step 1: Write Migration for core entities**
```sql
-- Collections table
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  is_shared_with_household boolean DEFAULT false,
  can_household_edit boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (id, household_id) -- For composite FKs
);

-- Tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (household_id, name),
  UNIQUE (id, household_id) -- For composite FKs
);
```

- [x] **Step 2: Immediate Review**
Dispatch `@architect` and `@refactorer` to verify structural integrity and performance.

- [x] **Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add collections and tags tables (Phase A)"
```

---

### Task 2: Schema Phase B - Relationships & Junctions

**Files:**
- Create: `supabase/migrations/20260518000003_library_relationships.sql`

- [ ] **Step 1: Create Junction Tables with Composite FKs**
```sql
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
```

- [ ] **Step 2: Immediate Review**
Dispatch `@architect` and `@refactorer` to verify composite FK integrity.

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add collection and tag junctions (Phase B)"
```

---

### Task 3: Schema Phase C - Integrity & RLS

**Files:**
- Create: `supabase/migrations/20260518000004_library_rls.sql`

- [ ] **Step 1: Implement RLS Policies for Sharing**
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
```

- [ ] **Step 2: Immediate Review**
Dispatch `@architect` and `@refactorer` to verify recursion safety and sharing logic.

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: implement RLS for shared collections (Phase C)"
```

---

### Task 4: Ingredient Parser Logic (TDD)

**Files:**
- Create: `src/utils/ingredientParser.ts`
- Create: `src/utils/__tests__/ingredientParser.test.ts`

- [ ] **Step 1: Write failing tests for parsing**
```typescript
test('parses simple ingredient string', () => {
  expect(parseIngredient('1.5 lbs chicken breast')).toEqual({
    quantity: 1.5,
    unit: 'lbs',
    ingredient: 'chicken breast'
  });
});
```

- [ ] **Step 2: Implement Regex-based parser**

- [ ] **Step 3: Verify tests pass**

- [ ] **Step 4: Commit**
```bash
git add src/utils/
git commit -m "feat: implement natural language ingredient parser"
```

---

### Task 5: Recipe Creator UI

**Files:**
- Create: `src/pages/Recipes/RecipeCreator.tsx`
- Create: `src/components/Recipes/IngredientEntry.tsx`

- [ ] **Step 1: Implement multi-step form**
Step 1: Basic Info (Title, Category).
Step 2: Dynamic Ingredient List (using the parser from Task 4).
Step 3: Instructions.

- [ ] **Step 2: Implement "Interactive Correction"**
Show parsed fields as editable chips.

- [ ] **Step 3: Commit**
```bash
git add src/pages/Recipes/ src/components/Recipes/
git commit -m "feat: add recipe creator with interactive ingredient entry"
```

---

### Task 6: Library View & Filtering

**Files:**
- Create: `src/pages/Recipes/RecipeLibrary.tsx`
- Create: `src/components/Recipes/RecipeCard.tsx`

- [ ] **Step 1: Implement Bento Grid Library**
- [ ] **Step 2: Implement Tag & Collection Sidebar**
- [ ] **Step 3: Commit**
```bash
git add src/pages/Recipes/ src/components/Recipes/
git commit -m "feat: implement filterable recipe library grid"
```
