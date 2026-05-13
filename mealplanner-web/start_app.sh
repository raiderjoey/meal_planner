#!/bin/bash
set -e

echo "Building React App..."
npm run build

echo "Clearing old pb_public..."
rm -rf pb_public
mkdir -p pb_public

echo "Copying built files to pb_public..."
cp -r dist/* pb_public/

echo "Starting PocketBase..."
./pocketbase serve --http="0.0.0.0:8090"
