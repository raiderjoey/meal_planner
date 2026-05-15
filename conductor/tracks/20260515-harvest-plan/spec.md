# Specification - HarvestPlan Implementation

## 1. Project Overview
A weekly meal planning application that integrates recipe management, scheduling, automated shopping list generation, and prep-task tracking.

## 2. Data Model (PocketBase)
- `meals`: Recipes with ingredients and prep steps.
- `meal_plans`: Calendar slots linked to meals.
- `prep_tasks`: Auto-generated or manual prep actions.
- `shopping_items`: Aggregated ingredients from planned meals.

## 3. Key Components
- `WeekView`: 7-day dashboard.
- `MealLibrary`: Browse/Add meals.
- `ShoppingList`: Categorized items.
- `PrepList`: Task management.
