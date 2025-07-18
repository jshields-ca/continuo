-- Database initialization script for BizFlow
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS audit;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bizflow_dev TO bizflow;
GRANT ALL PRIVILEGES ON SCHEMA public TO bizflow;

-- The actual tables will be created by Prisma migrations 