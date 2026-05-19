# HarvestPlan: Recipe Library Specification (002-recipe-library)

## Overview
The Recipe Library is the central repository for meal blueprints. It enables users to create, organize, and share recipes within their household, while providing intelligent nutritional analysis and high-fidelity visuals.

## Core Features

### 1. Ingredient & Nutrition Engine
- **Scoped Search**: Search a global nutrition API (e.g., Edamam) for ingredients. Custom ingredients or brand-specific overrides are saved as household-private records.
- **Natural Language Parsing**: Users enter ingredients as strings (e.g., "1.5 lbs chicken breast"), which are parsed into structured data (Quantity, Unit, Ingredient Name).
- **Interactive Correction**: A UI mechanism to verify and correct parsed ingredient data.
- **Dynamic Scaling**: Ingredient quantities and nutritional totals scale dynamically based on the number of planned consumers.

### 2. Organization & Sharing
- **Multi-faceted Organization**:
  - **Tags**: Flexible labels for discovery (e.g., #Spicy, #Quick, #Vegan).
  - **Meal Types**: Standardized tags (Breakfast, Lunch, Dinner, Dessert, Drinks, Snacks).
  - **Collections**: User-defined folders for curation (e.g., "Favorites").
- **Intra-Household Sharing**: Collections can be marked as "Visible" or "Editable" by other members of the same household. Cross-household sharing is currently out of scope.

### 3. Visuals & Experience
- **"Posh" Visuals**: Recipes automatically fetch a high-quality stock photo (via Unsplash/Food API) based on their title.
- **Manual Overrides**: Users can upload their own images to Supabase Storage to replace the default visuals.
- **Farm-to-Table Aesthetic**: High-key lighting, organic textures, and a clean typography system (Quicksand/Inter).

## Technical Requirements

### Database Schema (Supabase)
- **Ingredients**: Structured records with nutritional metadata (Calories, Fat, Sodium, Protein, Fiber, Carbs, Sugar).
- **Recipes**: Title, instructions, image URL, and metadata.
- **Junctions**: `recipe_ingredients` and `collection_recipes` with composite foreign keys for multi-tenant integrity.
- **Collections**: User-level folders linked to a household.

### Frontend (React)
- **Recipe Creator**: Multi-step or dynamic form with natural language ingredient parsing.
- **Library View**: Filterable bento-style grid with tag and collection navigation.
- **Nutrition Rollup**: Utility functions to calculate scaled nutrition totals.

## Success Criteria
- [ ] Users can create a recipe using natural language entry.
- [ ] Recipes show accurate, scaled nutrition data.
- [ ] Collections can be toggled for household sharing.
- [ ] Visuals default to beautiful imagery with a manual override option.
