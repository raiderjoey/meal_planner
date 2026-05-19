# HarvestPlan: Specification (001-foundation)

## Overview
HarvestPlan is a multi-tenant meal planning web application designed for households. It allows families to plan shared meals while tracking individual nutritional goals, prep tasks, and a smart shopping list integrated with a digital pantry.

## Core Features

### 1. Household Multi-Tenancy
- **Unified Dashboard**: A shared calendar view for the entire household.
- **Individual Customization**: Users can add personal snacks or drinks to the shared timeline.
- **Security**: Data isolation using Supabase Row Level Security (RLS) tied to `household_id`.

### 2. Meal & Recipe Management
- **Labels**: Breakfast, Lunch, Dinner, Dessert, Drinks, Snacks.
- **Flexibility**: Meals can be based on reusable Recipes or one-off Standalone ingredients.
- **Portion Tracking**: Support for per-user portion sizes to ensure accurate individual nutrition tracking.

### 3. Nutrition & Goal Tracking
- **API Integration**: Automatically fetch nutritional data (Calories, Fat, Sodium, Protein, Fiber, Carbs, Sugar) via external API (e.g., Edamam/Nutritionix).
- **Manual Overrides**: Support for custom food entries and metadata editing.
- **Dual State Goals**: Progress bars show "Planned" vs "Consumed" status to visualize intent vs reality.

### 4. Smart Shopping List & Pantry
- **Auto-Consolidation**: Combine similar ingredients from multiple recipes (e.g., "3 Onions").
- **Pantry Cross-Reference**: Automatically check off items already in stock in the digital Pantry.
- **Quantity Tracking**: Support for units and manual overrides.

### 5. Prep List
- **Task Management**: Manually entered prep tasks linked to specific meals.
- **Timing**: Tasks appear on a dedicated "Prep List" view based on their scheduled prep time.

## Technical Architecture

### Frontend
- **Framework**: React (Vite) with TypeScript.
- **Styling**: Vanilla CSS (maintaining the "Harvest" aesthetic).
- **State Management**: React Context API for Household/User session data.

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security.
- **Auth**: Supabase Auth for household invitations and user management.
- **Serverless**: Edge Functions for external Nutrition API requests.
- **Storage**: Supabase Storage for recipe and meal imagery.

### Mobile Strategy
- Architecture is API-first to support a future React Native or Flutter mobile application.

## Design Philosophy
- **Farm-to-Table Aesthetic**: Clean, airy, high-key lighting, organic textures (as seen in `ui_designs/`).
- **Ease of Use**: Minimize "CRUD" overhead, focus on planning and visibility.
