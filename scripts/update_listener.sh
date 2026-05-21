#!/usr/bin/env bash

# HarvestPlan Update Listener
# This script polls the system_updates table for pending updates.

# Configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"54322"}
DB_NAME=${DB_NAME:-"postgres"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}

POLL_INTERVAL=60
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
UPDATE_SCRIPT="$SCRIPT_DIR/update_lxc.sh"

export PGPASSWORD=$DB_PASSWORD

echo "HarvestPlan Update Listener started. Polling every $POLL_INTERVAL seconds..."

while true; do
    # Check for pending updates
    # We use -A to disable alignment and -t to show only tuples
    PENDING_UPDATE=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -A -t -c "SELECT id, target_version FROM system_updates WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1;")

    if [ -n "$PENDING_UPDATE" ]; then
        # Parse ID and version (format is id|target_version)
        UPDATE_ID=$(echo "$PENDING_UPDATE" | cut -d'|' -f1)
        TARGET_VERSION=$(echo "$PENDING_UPDATE" | cut -d'|' -f2)

        echo "Found pending update: $UPDATE_ID (Target: $TARGET_VERSION)"

        # Set status to in-progress
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "UPDATE system_updates SET status = 'in-progress', updated_at = now() WHERE id = '$UPDATE_ID';"

        # Execute update script
        echo "Executing update script..."
        if "$UPDATE_SCRIPT" "$UPDATE_ID" "$TARGET_VERSION"; then
            echo "Update $UPDATE_ID completed successfully."
        else
            echo "Update $UPDATE_ID failed."
        fi
    fi

    sleep "$POLL_INTERVAL"
done
