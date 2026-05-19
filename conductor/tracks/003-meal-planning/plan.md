# Meal Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the core scheduling engine, standalone meal logging, and dynamic nutrition scaling for the household dashboard.

**Architecture:** A polymorphic `meal_plans` table handles both Library Recipes and adhoc JSONB data. A `meal_participants` junction tracks individual portions and consumption status. Scaling logic is implemented in a PostgreSQL function (or stable helper) to ensure RLS-safe nutrition rollups.

**Tech Stack:** Supabase (PostgreSQL/RLS), React (TypeScript), Vitest (TDD).

---

## Phase 1: Database Schema & Security
*Goal: Establish the storage and security layer for meal instances and participation.*

### Task 1: Meal Plans and Participants Tables
**Files:**
- Create: `supabase/migrations/20260519000000_meal_planning.sql`

- [x] **Step 1: Write migration for `meal_plans` and `meal_participants`**
  ```sql
  -- Add meal_type enum
  CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'drinks', 'snacks');
  CREATE TYPE participation_status AS ENUM ('planned', 'consumed');

  -- Create meal_plans table
  CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    meal_type meal_type NOT NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    standalone_data JSONB, -- { name: string, nutrition: { calories: number, ... } }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure either recipe or standalone data exists
    CONSTRAINT recipe_or_standalone CHECK (
      (recipe_id IS NOT NULL AND standalone_data IS NULL) OR 
      (recipe_id IS NULL AND standalone_data IS NOT NULL)
    )
  );

  -- Create meal_participants table
  CREATE TABLE meal_participants (
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    portion_multiplier DECIMAL(4,2) DEFAULT 1.0,
    status participation_status DEFAULT 'planned',
    PRIMARY KEY (meal_plan_id, user_id)
  );

  -- Add indexes for RLS and performance
  CREATE INDEX idx_meal_plans_household ON meal_plans(household_id);
  CREATE INDEX idx_meal_plans_date ON meal_plans(scheduled_date);
  CREATE INDEX idx_meal_participants_user ON meal_participants(user_id);
  ```

- [x] **Step 2: Enable RLS and add policies**
  - Verify `household_id` matches current user's session.

### Task 2: Plan Audit (MANDATORY)
**Files:**
- Modify: `conductor/tracks/003-meal-planning/metadata.json`

- [x] **Step 1: Summon `@security_auditor` to review the schema and RLS logic.**

---

## Phase 2: Core Logic & Scaling Utility
*Goal: Implement the math for scaling ingredients and nutrition across multiple participants.*

### Task 3: Nutrition Rollup Helper
**Files:**
- Create: `src/utils/nutritionCalculator.ts`
- Test: `src/utils/__tests__/nutritionCalculator.test.ts`

- [x] **Step 1: Write tests for `calculateScaledNutrition`**
  - Scenario: 1.5 portions of a 400kcal recipe.
  - Scenario: Multiple participants with varying multipliers.

- [x] **Step 2: Implement the calculator**
  ```typescript
  export const calculateScaledNutrition = (baseNutrition: any, multiplier: number) => {
    // Implement math
  };
  ```

---

## Phase 3: Dashboard Integration (UI)
*Goal: Display and interact with meals on the main dashboard.*

### Task 4: MealCard Component Update
**Files:**
- Modify: `src/components/Recipes/RecipeCard.tsx` (Extract shared logic if needed)
- Create: `src/components/Dashboard/MealInstanceCard.tsx`

- [x] **Step 1: Create `MealInstanceCard` with "Consumed" toggle**
- [x] **Step 2: Add portion adjustment slider/input to the card detail.**

### Task 5: Meal Entry Modal
**Files:**
- Create: `src/components/Dashboard/AddMealModal.tsx`

- [x] **Step 1: Implement search that combines Library + Nutrition API results.**
- [x] **Step 2: Implement "Participating Members" multi-select checklist.**

---

## Phase 4: Verification
*Goal: End-to-end confirmation of scaling and status tracking.*

### Task 6: Final Security & Architecture Audit
**Files:**
- Modify: `conductor/tracks/003-meal-planning/metadata.json`

- [x] **Step 1: Summon `@architect` and `@security_auditor` for final sign-off.**
