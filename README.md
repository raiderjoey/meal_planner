# HarvestPlan 🌿

A premium, organic-themed meal planner and shopping list application designed for self-hosting in Proxmox LXC containers or local environments. HarvestPlan focuses on a clean, health-forward user experience with a focus on simplicity and performance.

## Core Pillars
- **Dashboard (Week View)**: A 7-day visual overview of your meal plan with quick-add actions and category filtering.
- **Meal Library**: A comprehensive recipe repository with tagging, search, and health metrics.
- **Prep List**: Intelligent task tracking to help you stay ahead of your weekly kitchen prep.
- **Shopping List**: Dynamic, category-sorted grocery list generated directly from your planned meals.

## Tech Stack
- **Frontend**: React (Vite, TypeScript), Tailwind CSS v4.
- **UI Components**: Radix-inspired custom component library with a focus on accessibility and style.
- **Icons**: Lucide Icons & Material Symbols for a modern, recognizable interface.
- **Backend**: PocketBase (High-performance Go-based database & static file server).
- **Deployment**: Optimized shell scripts for easy LXC deployment.

## Design System
HarvestPlan utilizes a carefully curated organic color palette and typography system:
- **Colors**: Deep "Forest" greens (`primary`), warm "Sienna" browns (`secondary`), and soft "Stone" neutrals.
- **Typography**: `Quicksand` for elegant, rounded headlines and `Inter` for clean, readable body text.
- **Layout**: Responsive mobile-first design with a fixed bottom navigation bar for small screens and a persistent header for desktop.

## UI Component Library
Located in `src/components/ui`, our modular library includes:
- **Badge**: Color-coded status and category indicators.
- **Button**: Versatile variants (Primary, Secondary, Ghost, Outline).
- **Card**: Elevated surfaces for meal and recipe display.
- **IconButton**: Streamlined icon-only interaction points.
- **PageHeader**: Consistent layout for top-level navigation pages.

## Setup Instructions

### 1. Initialize Database
Download and extract the PocketBase binary for your architecture:
```bash
./setup_pocketbase.sh
```

### 2. Import Schema
1. Start PocketBase to access the admin console:
   ```bash
   ./pocketbase serve
   ```
2. Navigate to `http://localhost:8090/_/` and create your admin account.
3. Go to **Settings -> Export/Import**.
4. Paste the content of `pb_schema.json` into the **Import** section and apply changes. This will create the `meals`, `meal_plans`, `prep_tasks`, and `shopping_items` collections.

### 3. Build & Serve
Compile the frontend and move the assets to the PocketBase `pb_public` directory:
```bash
./start_app.sh
```
The application will be live at `http://localhost:8090`.

## Local Development
To start the Vite development server with hot module replacement:
```bash
cd mealplanner-web
npm install
npm run dev
```

Ensure your local PocketBase instance is running on port `8090` for the development proxy to connect correctly.
