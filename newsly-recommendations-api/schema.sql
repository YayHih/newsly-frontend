-- Newsly User Recommendations Database Schema
-- Optimized for fast reads and writes at scale
-- Contains only user-article recommendation mappings

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Recommendations Table
-- Stores recommendations fetched from the main Dell server
CREATE TABLE IF NOT EXISTS user_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    relevance_score REAL NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 1),
    score_breakdown JSONB,
    recommendation_reason TEXT,
    served BOOLEAN DEFAULT FALSE,
    served_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    algorithm_version TEXT DEFAULT 'v2.0',
    UNIQUE(user_id, article_id, created_at)
);

-- User Interactions Table
-- Tracks user engagement for analytics
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'like', 'share', 'hide', 'bookmark')),
    time_spent_seconds INTEGER DEFAULT 0,
    completion_rate REAL CHECK (completion_rate >= 0 AND completion_rate <= 1),
    scroll_depth REAL CHECK (scroll_depth >= 0 AND scroll_depth <= 1),
    recommended_score REAL,
    position_in_feed INTEGER,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache Table for Article Data
-- Stores frequently accessed article metadata to reduce Dell server calls
CREATE TABLE IF NOT EXISTS article_cache (
    article_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    url TEXT,
    description TEXT,
    category TEXT,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- User Session Table
-- Tracks active user sessions for rate limiting and security
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Rate Limiting Table
-- Tracks API requests per user/IP for security
CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    identifier TEXT NOT NULL, -- user_id or ip_address
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, endpoint, window_start)
);

-- Performance Indexes
-- Optimized for fast queries on user_id and created_at

-- User recommendations indexes
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_score ON user_recommendations(user_id, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_served ON user_recommendations(served, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_served ON user_recommendations(user_id, served, created_at DESC);

-- User interactions indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type, created_at DESC);

-- Article cache indexes
CREATE INDEX IF NOT EXISTS idx_article_cache_expires ON article_cache(expires_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint, window_start);

-- Automatic cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Automatic cleanup function for expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM article_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Automatic cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- View for recommendation statistics
CREATE OR REPLACE VIEW recommendation_stats AS
SELECT
    user_id,
    COUNT(*) as total_recommendations,
    COUNT(*) FILTER (WHERE served = TRUE) as served_count,
    COUNT(*) FILTER (WHERE clicked = TRUE) as clicked_count,
    ROUND(AVG(relevance_score)::numeric, 3) as avg_relevance_score,
    MAX(created_at) as last_recommendation_at
FROM user_recommendations
GROUP BY user_id;

-- Grant permissions to newsly_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO newsly_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO newsly_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO newsly_user;
