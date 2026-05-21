#!/usr/bin/env bash

# HarvestPlan LXC Install Script
# This script is intended to be run inside a Debian 12 LXC container.

set -e

# Logging
LOG_FILE="install.log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Logging to $LOG_FILE"

echo "Starting HarvestPlan Installation..."

# 1. Update System
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# 2. Install Dependencies
apt-get install -y curl git sudo build-essential ca-certificates gnupg nginx postgresql-client

# 3. Install Docker
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -sSL https://get.docker.com | sh
fi

# 4. Install Node.js (v20 LTS)
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi

# 5. Install Supabase CLI
if ! command -v supabase &> /dev/null; then
  echo "Installing Supabase CLI..."
  curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
fi

# 6. Clone Repository
REPO_URL="https://github.com/raiderjoey/meal_planner.git"
INSTALL_DIR="/opt/meal_planner"

if [ -d "$INSTALL_DIR" ]; then
  if [[ "$1" == "--force" ]]; then
    echo "Forcing re-installation. Cleaning up existing directory..."
    rm -rf "$INSTALL_DIR"
  else
    echo "Directory $INSTALL_DIR already exists. Skipping clone and using existing files."
    echo "Use --force to wipe and reinstall."
    cd "$INSTALL_DIR"
    sudo -u harvest git pull
    # Skip to dependency installation
  fi
fi

if [ ! -d "$INSTALL_DIR" ]; then
  echo "Cloning repository..."
  if [ -n "$GITHUB_TOKEN" ]; then
    git clone "https://${GITHUB_TOKEN}@github.com/raiderjoey/meal_planner.git" "$INSTALL_DIR"
  else
    git clone "$REPO_URL" "$INSTALL_DIR"
  fi
  chown -R harvest:harvest "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# 7. Install NPM Dependencies
echo "Installing NPM dependencies..."
sudo -u harvest -H /usr/bin/npm install

# 8. Initialize Backend
echo "Starting Supabase backend (this may take a few minutes)..."
# Ensure docker is running
service docker start || true
# Add harvest to docker group
usermod -aG docker harvest

export SUPABASE_TELEMETRY_DISABLED=1
# Use the global supabase binary if available, otherwise use npx with --yes
if command -v supabase &> /dev/null; then
  sudo -u harvest -H -E supabase start
else
  sudo -u harvest -H -E npx --yes supabase start
fi

# 9. Extract URL and Anon Key and create .env
echo "Configuring environment variables..."
if command -v supabase &> /dev/null; then
  STATUS=$(sudo -u harvest -H -E supabase status)
else
  STATUS=$(sudo -u harvest -H -E npx --yes supabase status)
fi

API_URL=$(echo "$STATUS" | grep "API URL" | awk '{print $3}')
ANON_KEY=$(echo "$STATUS" | grep "anon key" | awk '{print $3}')

if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "Error: Could not extract Supabase API URL or Anon Key."
  echo "Status output was:"
  echo "$STATUS"
  exit 1
fi

# Fix API_URL to use the container's IP instead of localhost/127.0.0.1
# This is required so that browsers on other machines can reach the API
LXC_IP=$(ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1)
if [ -n "$LXC_IP" ]; then
  echo "Detected LXC IP: $LXC_IP"
  API_URL=$(echo "$API_URL" | sed "s/127.0.0.1/$LXC_IP/")
  API_URL=$(echo "$API_URL" | sed "s/localhost/$LXC_IP/")
fi

echo "Using API URL: $API_URL"

cat <<EOF > .env
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
EOF
chown harvest:harvest .env

# 10. Build frontend
echo "Building frontend..."
sudo -u harvest -H /usr/bin/npm run build

# 11. Configure Nginx and systemd services

echo "Configuring Nginx..."
cat <<EOF > /etc/nginx/sites-available/harvestplan
server {
    listen 80;
    server_name _;

    root $INSTALL_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/harvestplan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "Configuring systemd services..."

# Backend Service (Ensures Supabase is running)
cat <<EOF > /etc/systemd/system/harvestplan-backend.service
[Unit]
Description=HarvestPlan Supabase Backend
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=harvest
Group=harvest
WorkingDirectory=$INSTALL_DIR
Environment=SUPABASE_TELEMETRY_DISABLED=1
# Use the installed supabase binary directly for better performance
ExecStart=/usr/local/bin/supabase start
ExecStop=/usr/local/bin/supabase stop
TimeoutStartSec=600
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 11. Enable and Start Services
systemctl daemon-reload
systemctl enable harvestplan-backend.service
systemctl enable nginx
systemctl start harvestplan-backend.service
systemctl restart nginx

echo "-------------------------------------------------------"
echo "HarvestPlan installation complete!"
echo "Frontend: http://<LXC_IP>"
echo "Supabase Studio: $(echo "$STATUS" | grep "Studio URL" | awk '{print $3}')"
echo "-------------------------------------------------------"
