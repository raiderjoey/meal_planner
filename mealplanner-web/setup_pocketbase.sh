#!/bin/bash
set -e

PB_VERSION="0.22.25"
OS="linux"
ARCH="amd64" # adjust if needed for your proxmox host

echo "Downloading PocketBase v${PB_VERSION}..."
curl -L -o pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"

echo "Extracting..."
python3 -c "import zipfile; z = zipfile.ZipFile('pocketbase.zip'); z.extract('pocketbase', '.')"
chmod +x pocketbase
rm pocketbase.zip

echo "Setup complete! You can run it via ./pocketbase serve"
