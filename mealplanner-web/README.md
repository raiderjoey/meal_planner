# HarvestPlan Frontend 🌿

This directory contains the React/Vite frontend for HarvestPlan.

## Architecture
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS v4 using the "HarvestPlan" organic design system.
- **Routing**: React Router v6 with responsive navigation.
- **API Client**: PocketBase JS SDK with real-time capabilities.

## Directory Structure
- `src/components/ui/`: Centralized UI component library (Buttons, Badges, Cards, etc.).
- `src/pages/`: Main application views (Dashboard, Library, Prep List, Shopping List).
- `src/lib/`: Library configurations, including the PocketBase client.
- `src/index.css`: Tailwind v4 theme configuration and design tokens.

## Design Tokens (Tailwind v4)
Our design tokens are defined in `src/index.css` under the `@theme` block:
- **Primary Color**: `#4c6151` (Forest Green)
- **Secondary Color**: `#7b5737` (Sienna Brown)
- **Background**: `#f8faf9` (Off-white / Stone)
- **Headline Font**: `Quicksand`
- **Body Font**: `Inter`

## Component Guidelines
- Always use components from `src/components/ui` for consistency.
- Adhere to the spacing variables (e.g., `px-margin-mobile`, `gap-base`).
- Use `material-symbols-outlined` for functional icons and Lucide icons (where applicable) for decorative elements.

## Scripts
- `npm run dev`: Starts the development server with proxying to PocketBase on port 8090.
- `npm run build`: Generates the production build in the `dist` folder.
- `npm run lint`: Runs ESLint for code quality checks.
