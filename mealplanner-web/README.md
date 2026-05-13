# Meal Planner

A fully self-hostable weekly meal planner and shopping list application designed for Proxmox LXC containers.

## Architecture
- **Frontend**: React (Vite, TypeScript), TailwindCSS v4, Lucide Icons.
- **Backend**: PocketBase (Single-binary embedded database & static server).
- **Deployment**: Local shell scripts.

## Setup Instructions

### 1. Initialize Database
Download and extract the PocketBase binary for Linux (AMD64):
```bash
./setup_pocketbase.sh
```

### 2. Import Schema
1. Start PocketBase locally to access the admin UI:
   ```bash
   ./pocketbase serve
   ```
2. Navigate to `http://localhost:8090/_/` and create an admin account.
3. Go to **Settings -> Export/Import**.
4. Copy the contents of `pb_schema.json` and paste it into the Import text area. Apply changes.

### 3. Build & Run
Build the frontend and move it to the PocketBase public directory:
```bash
./start_app.sh
```
The application will be served at `http://localhost:8090`.

## Local Development
To run the Vite dev server with hot module replacement:
```bash
npm run dev
```
