# Implementation Plan - HarvestPlan

## Phase 1: Backend Setup
- [x] Task 1: Define and apply PocketBase schema (meals, meal_plans, prep_tasks, shopping_items).
- [x] Task 2: Update `pocketbase.ts` client configuration.

## Phase 2: Core UI Development
- [x] Task 3: Implement `Layout` component with TopNavBar and Footer.
- [x] Task 4: Implement `WeekView` dashboard with 7-day grid and slot navigation.
- [ ] Task 5: Implement `MealLibrary` with Bento-grid layout and filtering.

## Phase 3: Functionality & Sync
- [ ] Task 6: Implement meal scheduling logic (linking `meals` to `meal_plans`).
- [ ] Task 7: Implement automated Shopping List aggregation from `meal_plans`.
- [ ] Task 8: Implement automated Prep Task generation from `meal_plans`.

## Phase 4: Refinement & Mobile
- [ ] Task 9: Implement responsive mobile views (Plan and Shopping List).
- [ ] Task 10: Apply final styling polish and animations.
