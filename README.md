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

## 📦 Proxmox LXC Installation

For Proxmox users, you can install HarvestPlan in a dedicated Debian 12 LXC container using the following one-liner:

```bash
bash -c "$(curl -sSL https://raw.githubusercontent.com/raiderjoey/meal_planner/main/scripts/proxmox_lxc.sh)"
```

### Requirements
- **Proxmox VE Host**
- **Minimum Resources**: 2 vCPUs, 2GB RAM, 8GB Disk.
- **LXC Features**: Nesting and Keyctl must be enabled (the script handles this automatically).
- **Unprivileged Container**: Supported and recommended.

---

## 📦 Releases & Versioning

HarvestPlan uses a formalized versioning system to ensure consistency between the application code, database schema, and changelog.

### Release Automation
All releases must be performed using the `scripts/release.sh` script. This script automates several critical steps:
1.  **Version Bumping**: Updates the version in `package.json` and `package-lock.json`.
2.  **Changelog Update**: Moves entries from the `[Unreleased]` section to a new version header in `CHANGELOG.md`.
3.  **Database Synchronization**: Generates a SQL script to update the `system_info` table and record the update in `system_updates`.
4.  **Git Tagging**: Commits the changes and creates a git tag for the new version.

**Usage:**
```bash
./scripts/release.sh [patch|minor|major]
```

### Update Center
The application includes an **Update Center** located in the **Settings** page. 
- **Version Display**: The current version is displayed in the Dashboard footer and the Update Center.
- **Update Tracking**: Historical updates are recorded in the database and can be viewed in the Update Center.
- **Applying Updates**: Administrators can trigger the application of pending database updates through the UI.

### Technical Implementation
- **`useSystemVersion` Hook**: Provides real-time access to the current system version from the database, with support for live updates via Supabase Realtime.
- **Database Schema**: The `system_info` table acts as the single source of truth for the current application version.

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
- [x] **Track 004**: Shopping List Aggregation
- [x] **Track 005**: Advanced Pantry Management & Nutrition API
- [ ] **Track 006**: Prep List & Batch Cooking (Proposed)
- [ ] **Track 007**: Household Management & Member Invitations (Proposed)
