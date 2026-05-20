#!/usr/bin/env bash

# HarvestPlan Proxmox LXC Installer
# This script creates a Debian 12 LXC container on Proxmox and installs HarvestPlan.

set -e

# Logging
LOG_FILE="install.log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Logging to $LOG_FILE"

# Colors
RD=$(echo -en "\e[31m")
GN=$(echo -en "\e[32m")
YL=$(echo -en "\e[33m")
BL=$(echo -en "\e[34m")
NC=$(echo -en "\e[0m")

echo -e "${BL}###########################################################${NC}"
echo -e "${BL}#                                                         #${NC}"
echo -e "${BL}#             HarvestPlan Proxmox LXC Installer           #${NC}"
echo -e "${BL}#                                                         #${NC}"
echo -e "${BL}###########################################################${NC}"

# Check if running on Proxmox
if ! command -v pveversion >/dev/null 2>&1; then
  echo -e "${RD}Error: This script must be run on a Proxmox VE host.${NC}"
  exit 1
fi

# Function to get next available CT ID
get_next_id() {
  local id=100
  while pct status $id >/dev/null 2>&1; do
    id=$((id + 1))
  done
  echo $id
}

NEXT_ID=$(get_next_id)

echo -e "${YL}--- Configuration ---${NC}"
read -p "Enter Container ID [$NEXT_ID]: " CTID
CTID=${CTID:-$NEXT_ID}

read -p "Enter Container Name [harvestplan]: " CTNAME
CTNAME=${CTNAME:-harvestplan}

read -p "Enter Storage [local-lvm]: " STORAGE
STORAGE=${STORAGE:-local-lvm}

read -p "Enter Disk Size in GB [16]: " DISK
DISK=${DISK:-16}

read -s -p "Enter Root Password: " PASSWORD
echo
echo -e "${YL}---------------------${NC}"

# Default settings
CORES=2
RAM=2048
DISK=8
BR=vmbr0
IP="dhcp"
TEMPLATE_STORAGE="local"

echo -e "${YL}Updating Proxmox template list...${NC}"
pveam update >/dev/null

echo -e "${YL}Selecting Debian 12 template...${NC}"
# Robust regex selection
TEMPLATE_NAME=$(pveam available | grep -oP "debian-12-standard_[^\s]+" | head -n1)

if [ -z "$TEMPLATE_NAME" ]; then
  echo -e "${RD}Error: Could not find a Debian 12 template in the available list.${NC}"
  exit 1
fi

if ! pveam list $TEMPLATE_STORAGE | grep -q "$(basename $TEMPLATE_NAME)"; then
  echo -e "${YL}Downloading $TEMPLATE_NAME...${NC}"
  pveam download $TEMPLATE_STORAGE $TEMPLATE_NAME
fi

# Find the actual template file name in storage using robust regex
TEMPLATE_FILE=$(pveam list $TEMPLATE_STORAGE | grep -oP "debian-12-standard_[^\s]+" | head -n1)

echo -e "${YL}Creating LXC Container ${CTID} (${CTNAME})...${NC}"
pct create $CTID $TEMPLATE_STORAGE:vztmpl/$(basename $TEMPLATE_FILE) \
  --hostname $CTNAME \
  --storage $STORAGE \
  --net0 name=eth0,bridge=$BR,ip=$IP \
  --cores $CORES \
  --memory $RAM \
  --rootfs "$STORAGE:$DISK" \
  --features nesting=1,keyctl=1 \
  --onboot 1 \
  --unprivileged 1

echo -e "${GN}LXC Container ${CTID} created successfully.${NC}"

echo -e "${YL}Starting Container...${NC}"
pct start $CTID

echo -e "${YL}Setting root password...${NC}"
echo "root:$PASSWORD" | pct exec $CTID -- chpasswd

echo -e "${YL}Waiting for network (10s)...${NC}"
sleep 10

# Locate install_lxc.sh
if [ -z "$GITHUB_TOKEN" ]; then
    read -p "Enter your GitHub Token (for private repo access): " GITHUB_TOKEN
fi

# Locate install_lxc.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_SCRIPT="$SCRIPT_DIR/install_lxc.sh"

if [ ! -f "$INSTALL_SCRIPT" ]; then
    echo -e "${YL}install_lxc.sh not found at $INSTALL_SCRIPT, attempting to download from GitHub...${NC}"
    curl -sSL -H "Authorization: token $GITHUB_TOKEN" "https://raw.githubusercontent.com/raiderjoey/meal_planner/main/scripts/install_lxc.sh" -o /tmp/install_lxc.sh
    INSTALL_SCRIPT="/tmp/install_lxc.sh"
fi

echo -e "${YL}Pushing installation script to container...${NC}"
pct push $CTID "$INSTALL_SCRIPT" /tmp/install_lxc.sh
pct exec $CTID -- chmod +x /tmp/install_lxc.sh

echo -e "${YL}Running installation inside container (this will take a while)...${NC}"
pct exec $CTID -- env GITHUB_TOKEN=$GITHUB_TOKEN /tmp/install_lxc.sh

echo -e "${GN}###########################################################${NC}"
echo -e "${GN}#                                                         #${NC}"
echo -e "${GN}#             HarvestPlan Installation Finished!          #${NC}"
echo -e "${GN}#                                                         #${NC}"
echo -e "${GN}###########################################################${NC}"

LXC_IP=$(pct exec $CTID -- ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1)
echo -e "${GN}Frontend: http://${LXC_IP}${NC}"
echo -e "${YL}Note: If the IP is not shown, check 'pct exec $CTID -- ip addr'${NC}"
