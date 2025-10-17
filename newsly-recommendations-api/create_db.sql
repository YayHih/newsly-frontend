-- Create database and user for Newsly user recommendations
-- This is a lightweight, optimized database separate from the main CampusLens DB

-- Create database
CREATE DATABASE newsly_recommendations;

-- Create user with password
CREATE USER newsly_user WITH ENCRYPTED PASSWORD 'newsly_secure_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE newsly_recommendations TO newsly_user;

-- Connect to the new database to set up privileges
\c newsly_recommendations

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO newsly_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO newsly_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO newsly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO newsly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO newsly_user;
