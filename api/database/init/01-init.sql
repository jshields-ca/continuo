-- Database initialization script for Continuo

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE continuo_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'continuo_dev')\gexec

-- Connect to the database
\c continuo_dev;

-- Create user if it doesn't exist
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'continuo') THEN
      CREATE ROLE continuo LOGIN PASSWORD 'continuo_password';
   END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE continuo_dev TO continuo;
GRANT ALL PRIVILEGES ON SCHEMA public TO continuo;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS audit; 