#!/bin/bash

# HarvestPlan Release Automation Script
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

VERSION_TYPE=$1
if [[ -z "$VERSION_TYPE" ]]; then
  VERSION_TYPE="patch"
fi

# Ensure we are on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Error: Not on main branch. Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Ensure working directory is clean
if [[ -n $(git status -s) ]]; then
  echo "Error: Working directory is not clean. Please commit or stash changes."
  exit 1
fi

echo "Starting release process ($VERSION_TYPE)..."

# 1. Bump version in package.json
# We use --no-git-tag-version because we'll handle git operations manually after changelog update
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo "New version: $NEW_VERSION"

# 2. Update CHANGELOG.md
DATE=$(date +%Y-%m-%d)
CHANGELOG="CHANGELOG.md"

if [[ ! -f "$CHANGELOG" ]]; then
  echo "Error: $CHANGELOG not found."
  exit 1
fi

# Rename [Unreleased] to the new version and add a new [Unreleased] section
# We use a temporary file to ensure we don't corrupt the changelog if sed fails
sed "s/## \[Unreleased\]/## [Unreleased]\n\n### Added\n\n## [$NEW_VERSION] - $DATE/" "$CHANGELOG" > "${CHANGELOG}.tmp" && mv "${CHANGELOG}.tmp" "$CHANGELOG"

echo "Updated $CHANGELOG"

# 3. Update Database (Supabase)
# We'll use a SQL file for the update to make it cleaner
SQL_FILE="scripts/release_update.sql"
cat <<EOF > "$SQL_FILE"
-- Update system version
UPDATE system_info SET current_version = '${NEW_VERSION#v}', updated_at = now() WHERE id = 1;

-- Record the update
INSERT INTO system_updates (target_version, status, created_at) 
VALUES ('${NEW_VERSION#v}', 'completed', now());
EOF

echo "Database update SQL generated at $SQL_FILE"

if [[ -n "$DATABASE_URL" ]]; then
  echo "Executing database update..."
  if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f "$SQL_FILE"
  else
    echo "Warning: psql not found. Please run $SQL_FILE manually against your database."
  fi
else
  echo "Note: DATABASE_URL not set. Please run $SQL_FILE manually or set the variable."
fi

# 4. Git Commit and Tag
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): $NEW_VERSION"
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

# Cleanup
rm "$SQL_FILE"

echo "Release $NEW_VERSION completed successfully!"
echo "Don't forget to push: git push origin main --tags"
