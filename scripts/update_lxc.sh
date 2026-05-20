#!/usr/bin/env bash

# HarvestPlan LXC Update Script
# This script is intended to be run inside the Debian 12 LXC container.

set -e

# Logging
LOG_FILE="update.log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Starting HarvestPlan Update: $(date)"

INSTALL_DIR="/opt/meal_planner"

if [ ! -d "$INSTALL_DIR" ]; then
    echo "Error: Installation directory $INSTALL_DIR not found."
    exit 1
fi

cd "$INSTALL_DIR"

# 1. Pull latest changes
echo "Pulling latest changes from Git..."
# If it's a private repo, we might need to handle the token again, 
# but usually the remote is already configured with it from the install.
sudo -u harvest git pull

# 2. Install NPM dependencies
echo "Installing NPM dependencies..."
sudo -u harvest npm install

# 3. Apply database migrations
echo "Checking for database migrations..."
# Since supabase start is managed by systemd, we can either restart the service
# or run migrations explicitly. Restarting the service is safer as it ensures
# all containers are up to date and migrations are applied.
systemctl restart harvestplan-backend.service

# 4. Rebuild frontend
echo "Building frontend..."
sudo -u harvest npm run build

# 5. Restart Nginx to pick up new build
echo "Restarting Nginx..."
systemctl restart nginx

echo "-------------------------------------------------------"
echo "HarvestPlan update complete!"
echo "-------------------------------------------------------"
