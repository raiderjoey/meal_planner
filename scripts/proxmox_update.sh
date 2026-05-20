#!/usr/bin/env bash

# HarvestPlan Proxmox Update Helper
# This script triggers the update script inside an existing LXC container.

set -e

# Colors
RD=$(echo -en "\e[31m")
GN=$(echo -en "\e[32m")
YL=$(echo -en "\e[33m")
BL=$(echo -en "\e[34m")
NC=$(echo -en "\e[0m")

echo -e "${BL}###########################################################${NC}"
echo -e "${BL}#                                                         #${NC}"
echo -e "${BL}#             HarvestPlan Proxmox Update Helper           #${NC}"
echo -e "${BL}#                                                         #${NC}"
echo -e "${BL}###########################################################${NC}"

# Check if running on Proxmox
if ! command -v pveversion >/dev/null 2>&1; then
  echo -e "${RD}Error: This script must be run on a Proxmox VE host.${NC}"
  exit 1
fi

# List running containers for selection
echo -e "${YL}Available Containers:${NC}"
pct list

read -p "Enter the Container ID to update: " CTID

if ! pct status $CTID >/dev/null 2>&1; then
  echo -e "${RD}Error: Container $CTID not found or invalid ID.${NC}"
  exit 1
fi

# Locate update_lxc.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATE_SCRIPT="$SCRIPT_DIR/update_lxc.sh"

if [ ! -f "$UPDATE_SCRIPT" ]; then
    echo -e "${RD}Error: update_lxc.sh not found at $UPDATE_SCRIPT.${NC}"
    exit 1
fi

echo -e "${YL}Pushing update script to container $CTID...${NC}"
pct push $CTID "$UPDATE_SCRIPT" /tmp/update_lxc.sh
pct exec $CTID -- chmod +x /tmp/update_lxc.sh

echo -e "${YL}Running update inside container...${NC}"
pct exec $CTID -- /tmp/update_lxc.sh

echo -e "${GN}Update finished for Container $CTID!${NC}"
