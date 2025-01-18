#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PRISMA_DIR="$SCRIPT_DIR/../prisma"

echo "Starting database reset..."

# Stop and remove existing container
echo "Stopping and removing existing container..."
docker stop issuestasks-db || true
docker rm issuestasks-db || true

# Create fresh container
echo "Creating fresh container..."
docker run --name issuestasks-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -d postgres:14

# Wait for PostgreSQL to start
echo "Waiting for PostgreSQL to start..."
sleep 3

# Create database
echo "Creating database..."
docker exec -it issuestasks-db psql -U postgres -c "CREATE DATABASE issuestasks_dev;"

# Drop and recreate schema
echo "Resetting schema..."
docker exec -it issuestasks-db psql -U postgres -d issuestasks_dev -c "
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;"

# Apply first migration
echo "Applying first migration..."
docker exec -i issuestasks-db psql -U postgres -d issuestasks_dev < "${PRISMA_DIR}/migrations/20250115201136_add_workspace_tables/migration.sql"
echo "Checking tables after first migration:"
docker exec -it issuestasks-db psql -U postgres -d issuestasks_dev -c "\dt"

# Apply second migration
echo "Applying second migration..."
docker exec -i issuestasks-db psql -U postgres -d issuestasks_dev < "${PRISMA_DIR}/migrations/20250115202344_full_schema/migration.sql"
echo "Checking tables after second migration:"
docker exec -it issuestasks-db psql -U postgres -d issuestasks_dev -c "\dt"

# Final verification
echo "Final table list:"
docker exec -it issuestasks-db psql -U postgres -d issuestasks_dev -c "\pset pager off" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;"

echo "Verifying all required tables..."
REQUIRED_TABLES=(
  "Team"
  "TeamMember"
  "User"
  "Workspace"
  "WorkspaceInvite"
  "WorkspaceMember"
  "user_preferences"
  "workspace_user_preferences"
)

for table in "${REQUIRED_TABLES[@]}"; do
  echo -n "Checking $table... "
  COUNT=$(docker exec -it issuestasks-db psql -U postgres -d issuestasks_dev -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table';")
  if [ "$(echo $COUNT | tr -d ' ')" = "1" ]; then
    echo "✓"
  else
    echo "✗ MISSING!"
  fi
done 