# Project Memory - HarvestPlan

## Core Architecture
- **Sync Logic**: The application uses a reactive sync pattern where `shopping_items` and `prep_tasks` are re-calculated or updated when `meal_plans` change.
- **Port Strategy**: All services (PocketBase, Vite Dev, Production Build) are synchronized on Port `8090` to simplify reverse proxy configuration in LXC environments.
- **Responsive Design**: The UI uses a breakpoint-based switch for the dashboard:
  - `Desktop`: 7-column grid showing the entire week.
  - `Mobile`: Single-day "Plan" view with horizontal day navigation.

## Technical Debt / Future Considerations
- **Image Optimization**: Current schema supports file uploads but needs a dedicated processing pipeline for high-resolution recipe images.
- **Offline Support**: PWA manifest and Service Worker are not yet implemented.
- **Multi-Tenant Support**: The current design is single-tenant (PocketBase default).

## Critical Configuration
- **PocketBase Schema**: `pb_schema.json` is the source of truth for the database structure.
- **Env Vars**: `VITE_PB_URL` should point to the PocketBase instance (defaults to current host).
