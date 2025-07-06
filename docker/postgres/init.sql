-- PostgreSQL initialization script for Linear Clone

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create database (if not exists)
SELECT 'CREATE DATABASE linear_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'linear_dev');

-- Create user for application (if not exists)
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'linear_user') THEN
      CREATE USER linear_user WITH PASSWORD 'linear_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE linear_dev TO linear_user;

-- Connect to the database
\c linear_dev;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO linear_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO linear_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO linear_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO linear_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO linear_user; 