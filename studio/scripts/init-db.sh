#!/bin/bash
set -e

# This script runs automatically when the PostgreSQL container starts for the first time

echo "Initializing Nesolagus Studio database..."

# The database is already created by POSTGRES_DB env var
# This script is here in case you need additional initialization
# For example: creating extensions, seed data, etc.

# Example: Enable extensions if needed
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
#     CREATE EXTENSION IF NOT EXISTS "pg_trgm";
# EOSQL

echo "Database initialization complete!"
