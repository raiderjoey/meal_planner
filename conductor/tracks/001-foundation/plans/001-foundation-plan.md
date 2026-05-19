# HarvestPlan Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the core technical foundation for HarvestPlan, including the Supabase schema for multi-tenant households, the React project structure with Vite, and basic routing.

**Architecture:** A multi-tenant React SPA using Supabase for Auth, PostgreSQL (with RLS), and Storage. The architecture uses a "Household" context to isolate data at the database level.

**Tech Stack:** React, TypeScript, Vite, Supabase, Vanilla CSS.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [x] **Step 1: Create package.json with dependencies**
```json
{
  "name": "harvestplan",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  }
}
```

- [x] **Step 2: Create Vite and TypeScript configs**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

- [x] **Step 3: Create entry points**
```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [x] **Step 4: Verify build/start**
Run: `npm install && npm run build`
Expected: Successful build without errors.

- [x] **Step 5: Commit foundation**
```bash
git add package.json tsconfig.json vite.config.ts index.html src/
git commit -m "chore: initialize react vite foundation"
```

---

### Task 2: Supabase Client & Household Context

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/contexts/HouseholdContext.tsx`
- Create: `src/types/database.ts`

- [x] **Step 1: Define Database Types (Initial)**
```typescript
// src/types/database.ts
export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  household_id: string;
  full_name: string;
  avatar_url?: string;
}
```

- [x] **Step 2: Initialize Supabase Client**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [x] **Step 3: Create Household Context**
```tsx
// src/contexts/HouseholdContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const HouseholdContext = createContext<any>(null);

export const HouseholdProvider = ({ children }: { children: React.ReactNode }) => {
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logic to fetch household on auth state change
  return (
    <HouseholdContext.Provider value={{ household, loading }}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => useContext(HouseholdContext);
```

- [x] **Step 4: Commit Contexts**
```bash
git add src/lib/ src/contexts/ src/types/
git commit -m "feat: add supabase client and household context"
```

---

### Task 3: Core Database Schema (Migration Plan)

**Files:**
- Create: `supabase/migrations/20260518000000_core_schema.sql`

- [x] **Step 1: Write Migration for Households and Profiles**
```sql
-- Create Households table
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Profiles table (linked to auth.users and households)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  household_id uuid REFERENCES households ON DELETE SET NULL,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can only see profiles in their household
CREATE POLICY "Profiles are viewable by household members" ON profiles
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );
```

- [x] **Step 2: Commit Schema**
```bash
git add supabase/migrations/
git commit -m "feat: add core household and profile schema with RLS"
```

---

### Task 4: Meal & Recipe Tables

**Files:**
- Create: `supabase/migrations/20260518000001_meals_recipes.sql`

- [ ] **Step 1: Write Migration for Recipes, Meals, and Ingredients**
```sql
-- Recipes table
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  title text NOT NULL,
  instructions text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Meals table (The calendar entry)
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid REFERENCES households NOT NULL,
  recipe_id uuid REFERENCES recipes, -- Optional if standalone
  meal_type text CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks', 'Snack')),
  planned_at date NOT NULL,
  consumed_at timestamptz, -- For Actual vs Planned goals
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for meals/recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes viewable by household" ON recipes
  FOR ALL USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Meals viewable by household" ON meals
  FOR ALL USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));
```

- [ ] **Step 2: Commit Meal/Recipe Schema**
```bash
git add supabase/migrations/
git commit -m "feat: add recipes and meals schema with household RLS"
```

---

### Task 5: Base Layout & Dashboard Shell

**Files:**
- Create: `src/components/Layout/MainLayout.tsx`
- Create: `src/pages/Dashboard/Dashboard.tsx`
- Create: `src/components/Layout/MainLayout.css`

- [ ] **Step 1: Create MainLayout using existing design patterns**
Use the CSS variables and classes from `ui_designs/dashboard_desktop.html`.

- [ ] **Step 2: Implement Dashboard Page**
```tsx
// src/pages/Dashboard/Dashboard.tsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Your Weekly Plan</h1>
      {/* Grid placeholder */}
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 3: Commit Layout**
```bash
git add src/components/ src/pages/
git commit -m "feat: add main layout and dashboard shell"
```
