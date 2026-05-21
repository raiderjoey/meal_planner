#!/usr/bin/env bash

# HarvestPlan LXC Update Script
# This script is intended to be run inside the Debian 12 LXC container.

set -e

UPDATE_ID=$1
TARGET_VERSION=$2

# Configuration for DB reporting
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"54322"}
DB_NAME=${DB_NAME:-"postgres"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}
export PGPASSWORD=$DB_PASSWORD

# Logging
LOG_FILE="update_${UPDATE_ID:-"manual"}.log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Starting HarvestPlan Update: $(date)"

INSTALL_DIR="/opt/meal_planner"

report_status() {
    local status=$1
    local log_file=$2
    if [ -n "$UPDATE_ID" ]; then
        # Capture last 50KB of logs and escape for SQL
        local log_content=$(tail -c 50000 "$log_file" | sed "s/'/''/g")
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "UPDATE system_updates SET status = '$status', log_output = '$log_content', updated_at = now() WHERE id = '$UPDATE_ID';"
        
        if [ "$status" == "completed" ]; then
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "UPDATE system_info SET current_version = '$TARGET_VERSION', updated_at = now() WHERE id = 1;"
        fi
    fi
}

# Ensure we report failure if any command fails
trap 'report_status "failed" "$LOG_FILE"' ERR

if [ ! -d "$INSTALL_DIR" ]; then
    echo "Error: Installation directory $INSTALL_DIR not found."
    exit 1
fi

cd "$INSTALL_DIR"

# 1. Pull latest changes
echo "Pulling latest changes from Git..."
sudo -u harvest git pull

# 2. Install NPM dependencies
echo "Installing NPM dependencies..."
sudo -u harvest npm install

# 3. Apply database migrations
echo "Checking for database migrations..."
# Explicitly run migrations to ensure they are applied
sudo -u harvest -H -E npx --yes supabase migration up

# Restart service to ensure everything is fresh
systemctl restart harvestplan-backend.service

# 4. Rebuild frontend
echo "Building frontend..."
# Ensure the build uses the latest .env
sudo -u harvest -H /usr/bin/npm run build

# 5. Restart Nginx to pick up new build
echo "Restarting Nginx..."
systemctl restart nginx

# 6. If manual, update the DB version to match package.json
if [ -z "$UPDATE_ID" ]; then
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "Manual update detected. Updating system_info to v$CURRENT_VERSION..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "UPDATE system_info SET current_version = '$CURRENT_VERSION', updated_at = now() WHERE id = 1;" || echo "Warning: Could not update version in DB. This is expected if the table doesn't exist yet."
fi

echo "-------------------------------------------------------"
echo "HarvestPlan update complete!"
echo "-------------------------------------------------------"

report_status "completed" "$LOG_FILE"
