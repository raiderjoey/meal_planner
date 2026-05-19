# HarvestPlan: Meal Planning Specification (003-meal-planning)

## Overview
Track 003 bridges the Recipe Library with the Dashboard. It implements the scheduling engine, allows for adhoc (standalone) meal logging, and provides a dynamic nutrition scaling system based on household participation.

## Core Features

### 1. The Scheduling Engine (Unified Entry)
- **Universal Meal Modal**: A single interface to add meals to the dashboard. Users can search for existing **Recipes** or **Standard Items** (via Nutrition API).
- **Polymorphic Scheduling**: The system handles both `recipe_id` references and `standalone_data` (JSONB) for adhoc items.
- **Meal Types**: Mapping to Breakfast, Lunch, Dinner, Dessert, Drinks, and Snacks.

### 2. Household Participation & Scaling
- **Default Inclusion**: By default, new meals include all members of the household.
- **Participation Selection**: Users can toggle individual members on/off for specific meal instances (e.g., "Kids only").
- **Manual Portion Adjustment**: Every participant has a `portion_multiplier` (default 1.0). This can be adjusted manually on the dashboard to reflect if someone ate more or less than a standard serving.

### 3. Nutrition Progress Tracking
- **Planned vs. Consumed**: Participants have a status (`planned` | `consumed`).
- **Dashboard Visualization**: 
  - **Planned Bar**: Shows total nutritional intent for the day.
  - **Consumed Bar**: Shows nutrition from meals marked as "checked off."
- **Rollup Logic**: Individual nutrition totals are calculated as `Base_Nutrition * Portion_Multiplier`.

### 4. Shopping List Integration (Foundation)
- **Ingredient Aggregation**: The "Planned" state of meals populates the Household Shopping List.
- **Quantity Calculation**: Total quantities are scaled by the sum of `portion_multipliers` for all participants in a meal.

## Technical Requirements

### Database Schema (Supabase)
- **`meal_plans`**:
  - `id` (UUID), `household_id` (FK), `scheduled_date` (Date), `meal_type` (Enum).
  - `recipe_id` (FK, Nullable), `standalone_data` (JSONB, Nullable).
- **`meal_participants`**:
  - `meal_plan_id` (FK), `user_id` (FK).
  - `portion_multiplier` (Decimal, Default 1.0).
  - `status` (Enum: `planned`, `consumed`).

### Frontend (React)
- **Dashboard Grid**: Interactive calendar view showing scheduled meals.
- **Meal Entry Modal**: Integrated search (Library + API) and participant toggle.
- **Progress Components**: Dual-state progress bars for Calories and Macros.

## Success Criteria
- [ ] Users can schedule a recipe to a specific day/meal slot.
- [ ] Users can add a standalone item via quick search.
- [ ] Nutrition bars update based on who is participating and their portion sizes.
- [ ] Toggling a meal to "Consumed" updates the "Reality" progress bar.
- [ ] Ingredient quantities are correctly aggregated for the shopping list based on participant counts.
