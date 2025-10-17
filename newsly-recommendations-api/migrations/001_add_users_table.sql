-- Migration 001: Add users table with OAuth support
-- This table mirrors the Dell server users but adds local authentication

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,  -- NULL for OAuth-only users

    -- OAuth fields
    oauth_provider TEXT,  -- 'google', 'email', etc.
    oauth_provider_id TEXT,  -- Google ID, etc.
    oauth_access_token TEXT,
    oauth_refresh_token TEXT,
    oauth_token_expires_at TIMESTAMP WITH TIME ZONE,
    picture_url TEXT,  -- Profile picture from OAuth

    -- User profile fields (from onboarding)
    age_range TEXT,
    education_level TEXT,
    field_of_study TEXT,
    primary_interests TEXT[],
    secondary_interests TEXT[],
    hobbies TEXT[],
    topics_to_avoid TEXT[],

    -- Preferences
    preferred_complexity TEXT,
    preferred_article_length TEXT,
    news_frequency TEXT,
    preferred_content_types TEXT[],
    political_orientation TEXT,
    credibility_threshold REAL DEFAULT 0.6,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,

    -- Dell server sync
    dell_server_user_id INTEGER,  -- ID on Dell server
    last_synced_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT unique_oauth_provider UNIQUE(oauth_provider, oauth_provider_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_dell_id ON users(dell_server_user_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE users TO newsly_user;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO newsly_user;
