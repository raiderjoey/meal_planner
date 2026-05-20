# HarvestPlan 🥗

HarvestPlan is a multi-tenant meal planning and grocery aggregation application built with **React**, **TypeScript**, and **Supabase**. It helps households organize their recipes, schedule meals, and automatically generate consolidated shopping lists based on portion multipliers and existing pantry stock.

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)
- [Docker](https://www.docker.com/) (required by Supabase CLI)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/raiderjoey/meal_planner.git
cd meal_planner

# Install dependencies
npm install
```

### 3. Local Database Setup
HarvestPlan uses Supabase for Auth, Database, and Edge Functions.
```bash
# Initialize Supabase locally
npx supabase start

# The migrations in `supabase/migrations` will be applied automatically.
```

### 4. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```
*(You can find these keys by running `npx supabase status` after starting the local stack.)*

### 5. Start the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Architecture & Protocol

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **Testing**: Vitest, React Testing Library
- **Orchestration**: Gemini CLI + Conductor Track System

### Team Protocols (Mandatory)
This project follows strict engineering standards defined in [GEMINI.md](./GEMINI.md).
- **Double-Audit Security**: Every feature requires a Plan Audit and a Final Audit by a `security_engineer`.
- **TDD**: All features must include comprehensive tests created alongside implementation.
- **Multi-Tenancy**: All data access must use `household_id` and the `get_current_user_household_id()` RLS helper.

## 🧪 Testing
```bash
# Run all tests
npm run test

# Run tests in UI mode
npx vitest --ui
```

## 🛤️ Roadmap
- [x] **Track 001**: Foundation (Auth & Household Context)
- [x] **Track 002**: Recipe Library
- [x] **Track 003**: Meal Planning & Scheduling
- [x] **Track 004**: Shopping List Aggregation (Current)
- [ ] **Track 005**: Advanced Pantry Management & Nutrition API
