# Newsly Database Documentation

This database is currently being stored on the dell server, we want to create a seprate smaller database just containing the user reccomendations (articles reccomended to the users). we have the apis that you can see in api.md to call them (however the dell server is reverse sshed onto the oracle one so you will have to manage that.) I want you to run and compile news-personalization, create the small fast user reccomedtions database here (in postgress and fast api) link the two of them make sure it is secure. we want to run this in the future at scale for this website so make sure it is highly optimized. users should not be able to see the main page also unless they enter in a passweord during the questions step. make the password (I like apples)

## Overview

The CampusLens database is a PostgreSQL-based system with pgvector extension for semantic search. It powers the personalized news recommendation engine and AI-generated briefing system.

**Database:** `personalized_news`
**User:** `news_user`
**Password:** `campuslens2024`
**Port:** 5432 (default)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Directory Structure](#directory-structure)
3. [Database Architecture](#database-architecture)
4. [Schema Details](#schema-details)
5. [Migrations](#migrations)
6. [Data Flow](#data-flow)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Initial Setup (Fresh Install)

```bash
# 1. Create database and user
sudo -u postgres psql -f schema/createdb.sql

# 2. Connect to database and enable extensions
sudo -u postgres psql -d personalized_news
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

# 3. Apply all migrations in order
cd /home/campuslens/news/Database/migrations
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 003_create_user_briefings.sql
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 004_add_api_indexes.sql
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 005_add_vector_index.sql
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 006_archival_setup.sql
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 007_monitoring_setup.sql

# 4. Apply API migrations (for OAuth support)
cd /home/campuslens/news/api/migrations
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 001_add_password_column.sql
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 002_add_oauth_columns.sql

# 5. Verify setup
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "\dt+"
```

### Connect to Database

```bash
# Using psql
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user

# Using Python (psycopg2)
import psycopg2
conn = psycopg2.connect(
    host='localhost',
    database='personalized_news',
    user='news_user',
    password='campuslens2024',
    port=5432
)
```

---

## Directory Structure

```
Database/
├── README.md                              # This file
├── DATABASE_OPTIMIZATION_RECOMMENDATIONS.md  # Performance guide
│
├── schema/                                # Table definitions
│   ├── createdb.sql                       # Initial database setup
│   └── enhanced_user_weights.sql          # User interest weights schema
│
├── migrations/                            # Sequential database changes
│   ├── 003_create_user_briefings.sql      # Briefing storage table
│   ├── 004_add_api_indexes.sql            # FastAPI performance indexes
│   ├── 005_add_vector_index.sql           # pgvector IVFFlat index
│   ├── 006_archival_setup.sql             # Automatic archival system
│   └── 007_monitoring_setup.sql           # Monitoring views & functions
│
├── archived_migrations/                   # Historical migrations
│   └── 001_sentiment_inflammatory.sql     # Sentiment analysis columns
│
└── data_samples/                          # Sample data (gitignored)
    ├── newusers.sql                       # Sample user profiles
    └── userdb.sql                         # Sample user database
```

**Note:** Migrations 001-002 are in `/api/migrations/` (authentication-related)

---

## Database Architecture

### Entity-Relationship Diagram

```
┌─────────────────────┐
│ users_personalized  │──┐
│ (User Profiles)     │  │
└─────────────────────┘  │
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│user_interest │  │user_inter-   │  │user_recom-   │
│_weights      │  │actions       │  │mendations    │
└──────────────┘  └──────┬───────┘  └─────┬────────┘
                         │                │
                         └────────┬───────┘
                                  │
                                  ↓
                         ┌─────────────────┐
                         │ news_articles   │
                         │ (22K articles)  │
                         └─────────────────┘
                                  ↓
                         ┌─────────────────┐
                         │news_articles_   │
                         │archive (old)    │
                         └─────────────────┘

        ┌────────────────────────────────────────┐
        │              user_briefings            │
        │         (AI-generated summaries)       │
        └────────────────────────────────────────┘
```

### Core Tables

1. **users_personalized** - Rich user profiles with 40+ attributes
   - Demographics (age, education, field of study)
   - Interests (primary, secondary, hobbies, topics to avoid)
   - Preferences (complexity, bias awareness, credibility threshold)
   - Behavior (reading time, device, attention span)

2. **news_articles** - Article storage with NLP features
   - Content (title, description, full text)
   - NLP (768-dim embeddings, sentiment, topics, entities)
   - Metadata (credibility score, source, published date)

3. **user_recommendations** - Stored recommendations
   - Article-user pairs with relevance scores
   - Score breakdown (JSONB for explainability)
   - Interaction tracking (served, clicked)

4. **user_interactions** - User engagement tracking
   - Interaction types (view, click, like, share, hide)
   - Engagement metrics (time spent, scroll depth, completion rate)
   - Used by Thompson Sampling for exploration-exploitation

5. **user_briefings** - AI-generated news briefings
   - Markdown-formatted briefings
   - Metadata (num articles, avg impact score, action items)
   - View tracking

6. **user_interest_weights** - Interest vectors for multi-interest modeling
   - Clustered interests from interaction history
   - Declared interests for cold start
   - 768-dim embeddings per interest

---

## Schema Details

### users_personalized (80 KB, ~40 users)

**Key Columns:**
```sql
id                          SERIAL PRIMARY KEY
email                       TEXT UNIQUE              -- For authentication
name                        TEXT NOT NULL
primary_interests           TEXT[] NOT NULL          -- e.g. ['AI', 'quantum computing']
secondary_interests         TEXT[]
age_range                   TEXT                     -- '19-22', '23-25', etc.
education_level             TEXT                     -- 'undergraduate', 'graduate'
political_orientation       TEXT                     -- 'moderate', 'liberal', etc.
credibility_threshold       REAL DEFAULT 0.6         -- Min credibility (0-1)
inflammatory_tolerance      DECIMAL(3,2) DEFAULT 0.3 -- Tolerance for controversial content
profile_embedding           VECTOR(384)              -- Deprecated, kept for compatibility
last_recommendation_at      TIMESTAMP WITH TIME ZONE
created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes:**
- `users_personalized_pkey` - Primary key
- `users_personalized_email_key` - Unique email constraint
- `idx_users_interests` - GIN index on primary_interests
- `idx_users_secondary` - GIN index on secondary_interests

**Foreign Keys:**
- Referenced by user_recommendations, user_interactions, user_briefings, user_interest_weights

### news_articles (142 MB, 22,122 articles)

**Key Columns:**
```sql
id                   SERIAL PRIMARY KEY
title                TEXT NOT NULL
source               TEXT                         -- 'Reuters', 'BBC', etc.
author               TEXT
published_at         TIMESTAMP WITH TIME ZONE
url                  TEXT UNIQUE NOT NULL
description          TEXT
content              TEXT                         -- Full article text
content_hash         VARCHAR(32) UNIQUE           -- MD5 for deduplication
word_count           INTEGER

-- NLP Features
embedding            VECTOR(768)                  -- all-mpnet-base-v2 embeddings
sentiment_score      REAL                         -- -1 to 1
sentiment_label      VARCHAR(20)                  -- 'positive', 'negative', 'neutral'
readability_score    REAL                         -- Flesch reading ease
topics               JSONB                        -- {'politics': 0.8, 'technology': 0.5}
entities             JSONB                        -- {'PERSON': ['Biden'], 'ORG': ['NASA']}
inflammatory_score   DECIMAL(3,2) DEFAULT 0.0     -- 0-1 controversy score

-- Scoring
relevance_score      REAL
credibility_score    REAL                         -- Source credibility (0-1)

-- Metadata
article_type         TEXT DEFAULT 'news'          -- 'news', 'government', 'academic'
nlp_processed        BOOLEAN DEFAULT FALSE        -- Has NLP been run?
created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes:**
- `news_articles_pkey` - Primary key
- `news_articles_url_key` - Unique URL constraint
- `idx_articles_processed` - (nlp_processed) - **Most used index** (1,243 scans)
- `idx_articles_published_at` - (published_at DESC) - For time-range queries
- `idx_articles_embedding_ivfflat` - Vector similarity search (after migration 005)
- `idx_articles_nlp_published_type` - Composite for recommendation queries

**Critical Note:** Embedding dimension changed from 384 to 768 in v2.0. Ensure `all-mpnet-base-v2` model is used.

### user_recommendations (896 KB, ~14,000 rows)

**Key Columns:**
```sql
id                    SERIAL PRIMARY KEY
user_id               INTEGER REFERENCES users_personalized(id) ON DELETE CASCADE
article_id            INTEGER REFERENCES news_articles(id) ON DELETE CASCADE
relevance_score       REAL NOT NULL              -- Final score (0-1)
score_breakdown       JSONB                      -- {'similarity': 0.8, 'credibility': 0.9, ...}
algorithm_version     TEXT DEFAULT 'v2.0'
recommendation_reason TEXT                       -- Explainability
served                BOOLEAN DEFAULT FALSE       -- Has user seen this?
served_at             TIMESTAMP WITH TIME ZONE
clicked               BOOLEAN DEFAULT FALSE       -- Did user click?
clicked_at            TIMESTAMP WITH TIME ZONE
created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes:**
- `idx_recommendations_user_score` - (user_id, relevance_score DESC) - 164 scans
- `idx_recommendations_served` - (served, created_at)
- `idx_recommendations_user_served_score` - Composite for API pagination (after migration 004)

### user_interactions (8 KB, ~50 rows)

**Key Columns:**
```sql
id                       SERIAL PRIMARY KEY
user_id                  INTEGER REFERENCES users_personalized(id) ON DELETE CASCADE
article_id               INTEGER REFERENCES news_articles(id) ON DELETE CASCADE
interaction_type         TEXT NOT NULL           -- 'view', 'click', 'like', 'share', 'hide'
time_spent_seconds       INTEGER DEFAULT 0       -- Dwell time
completion_rate          REAL                    -- 0-1, how much was read
scroll_depth             REAL                    -- 0-1, how far scrolled
recommended_score        REAL                    -- Score at time of recommendation
position_in_feed         INTEGER                 -- Position in feed (1, 2, 3, ...)
device_type              TEXT                    -- 'mobile', 'desktop'
created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes:**
- `idx_interactions_user_type` - (user_id, interaction_type) - 201 scans
- `idx_interactions_article_user` - (article_id, user_id, created_at DESC) - After migration 004

**Usage:** Thompson Sampling uses this table to calculate Beta distribution for exploration scores.

### user_briefings (Created by migration 003)

**Key Columns:**
```sql
id                    SERIAL PRIMARY KEY
user_id               INTEGER REFERENCES users_personalized(id) ON DELETE CASCADE
briefing_text         TEXT NOT NULL              -- Full markdown briefing
briefing_format       VARCHAR(20) DEFAULT 'markdown'
num_articles          INTEGER                    -- Number of articles in briefing
briefing_summary      TEXT                       -- One-paragraph summary
avg_impact_score      DECIMAL(3,1)               -- Average 0-10 impact score
num_action_items      INTEGER                    -- Total actionable items
viewed                BOOLEAN DEFAULT FALSE       -- Has user viewed?
viewed_at             TIMESTAMP WITH TIME ZONE
time_spent_seconds    INTEGER
created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
generated_by          VARCHAR(50) DEFAULT 'gemini-2.0-flash'
```

**Indexes:**
- `idx_briefings_user_created` - (user_id, created_at DESC)
- `idx_briefings_viewed` - (viewed, created_at DESC)

### user_interest_weights (976 KB, ~1,000 rows)

**Schema:**
```sql
id                 SERIAL PRIMARY KEY
user_id            INTEGER REFERENCES users_personalized(id) ON DELETE CASCADE
interest_name      TEXT NOT NULL                -- 'quantum computing', 'basketball', etc.
weight             REAL DEFAULT 1.0             -- Interest strength (0-1)
interest_embedding VECTOR(768)                  -- Embedding of interest phrase
category           TEXT                         -- 'primary', 'secondary', 'hobby', 'clustered'
is_declared        BOOLEAN DEFAULT TRUE         -- User-declared vs. inferred
created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()

UNIQUE(user_id, interest_name)                  -- One weight per interest per user
```

**Indexes:**
- `user_interest_weights_user_id_interest_name_key` - Unique constraint (470 scans)
- `idx_user_weight_category` - (user_id, category) - 105 scans
- `idx_interest_embedding` - Vector index

---

## Migrations

Migrations are applied sequentially and are **idempotent** (safe to re-run).

### Migration History

| # | File | Description | Date | Applied? |
|---|------|-------------|------|----------|
| 001 | `/api/migrations/001_add_password_column.sql` | Add password_hash for authentication | 2025-10-16 | ✅ |
| 002 | `/api/migrations/002_add_oauth_columns.sql` | Add OAuth provider columns | 2025-10-16 | ❓ |
| 003 | `003_create_user_briefings.sql` | Create briefings table | 2025-10-16 | ❌ |
| 004 | `004_add_api_indexes.sql` | API performance indexes | 2025-10-16 | ❌ |
| 005 | `005_add_vector_index.sql` | IVFFlat index for similarity | 2025-10-16 | ❌ |
| 006 | `006_archival_setup.sql` | Archival procedure | 2025-10-16 | ❌ |
| 007 | `007_monitoring_setup.sql` | Monitoring views | 2025-10-16 | ❌ |

### Apply Pending Migrations

```bash
# Check which migrations are applied
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "\dt user_briefings"

# Apply all pending migrations
cd /home/campuslens/news/Database/migrations
for f in 00{3..7}*.sql; do
    echo "Applying $f..."
    PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f "$f"
done

# Apply API migrations
cd /home/campuslens/news/api/migrations
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 002_add_oauth_columns.sql
```

### Create a New Migration

```bash
# Create new migration file
cd /home/campuslens/news/Database/migrations
touch 008_your_migration_name.sql

# Add idempotent SQL (use IF NOT EXISTS, IF EXISTS)
cat > 008_your_migration_name.sql <<'EOF'
-- Migration 008: Description
-- Date: 2025-10-XX

ALTER TABLE your_table
ADD COLUMN IF NOT EXISTS new_column TEXT;

CREATE INDEX IF NOT EXISTS idx_name ON your_table(new_column);
EOF

# Test migration on dev database
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news_dev -U news_user -f 008_your_migration_name.sql

# Apply to production
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f 008_your_migration_name.sql
```

---

## Data Flow

### 1. Article Ingestion Pipeline

```
┌──────────────┐
│ newsScraper  │ ──> Fetches 800-1000 articles/day
│  .py         │     - NewsAPI (10 queries)
└──────┬───────┘     - Government APIs (Congress, NASA, etc.)
       │             - RSS feeds (ESPN, higher ed, tech)
       ↓
┌──────────────┐
│ news_articles│ ──> Stores raw articles
│ (nlp_processed│     - content_hash for deduplication
│  = FALSE)    │     - processed = TRUE
└──────┬───────┘
       │
       ↓
┌──────────────┐
│newsArticle-  │ ──> Batch NLP processing (GPU)
│Bert.py       │     - Generates 768-dim embeddings
└──────┬───────┘     - Sentiment, topics, entities, readability
       │             - Batch size: 32 articles
       ↓
┌──────────────┐
│ news_articles│ ──> Updates with NLP features
│ (nlp_processed│     - nlp_processed = TRUE
│  = TRUE)     │
└──────────────┘
```

### 2. Recommendation Generation Pipeline

```
┌──────────────┐
│users_        │ ──> Rich user profiles
│personalized  │     - Interests, preferences, behavior
└──────┬───────┘
       │
       ↓
┌──────────────┐
│articleRec-   │ ──> Generates recommendations
│ommendation.py│     - Multi-interest clustering (K=4)
└──────┬───────┘     - Hybrid retrieval (dense + BM25)
       │             - Thompson Sampling exploration
       │             - Personalized scoring
       ↓
┌──────────────┐
│user_         │ ──> Stores recommendations
│recommendations│     - relevance_score, score_breakdown
│ (served=FALSE)│     - served = FALSE initially
└──────┬───────┘
       │
       ↓ (API call)
┌──────────────┐
│ GET /recom-  │ ──> User fetches recommendations
│ mendations   │     - served = TRUE
└──────┬───────┘     - Returns paginated results
       │
       ↓
┌──────────────┐
│ POST /inter- │ ──> User interacts with article
│ actions      │     - Records click, time_spent, etc.
└──────┬───────┘
       │
       ↓
┌──────────────┐
│user_         │ ──> Stores interaction data
│interactions  │     - Used by Thompson Sampling
└──────────────┘     - Improves future recommendations
```

### 3. Briefing Generation Pipeline

```
┌──────────────┐
│user_         │ ──> Served recommendations
│recommendations│     - Top 20 articles for user
│ (served=TRUE)│
└──────┬───────┘
       │
       ↓
┌──────────────┐
│personalized_ │ ──> AI briefing generation
│briefing_     │     - Gemini 2.0 Flash API
│generator.py  │     - Summarizes articles
└──────┬───────┘     - Extracts impact scores
       │             - Generates action items
       ↓
┌──────────────┐
│user_briefings│ ──> Stores generated briefing
│              │     - Markdown format
└──────────────┘     - Metadata (num_articles, avg_impact_score)
```

---

## Performance Optimization

### Query Performance Tips

1. **Always filter by nlp_processed = TRUE**
   ```sql
   -- Good
   SELECT * FROM news_articles WHERE nlp_processed = TRUE;

   -- Bad (sequential scan)
   SELECT * FROM news_articles;
   ```

2. **Use time-range filters**
   ```sql
   -- Good (uses idx_articles_published_at)
   SELECT * FROM news_articles
   WHERE published_at > NOW() - INTERVAL '30 days';

   -- Bad (scans all 22K rows)
   SELECT * FROM news_articles WHERE source = 'Reuters';
   ```

3. **Set ivfflat.probes for vector search**
   ```sql
   -- Before similarity queries
   SET ivfflat.probes = 10;  -- Balance speed vs accuracy

   SELECT id, 1 - (embedding <=> query_vector) as similarity
   FROM news_articles
   WHERE nlp_processed = TRUE
   ORDER BY embedding <=> query_vector
   LIMIT 50;
   ```

4. **Use pagination with LIMIT/OFFSET**
   ```sql
   -- Good (uses idx_recommendations_user_served_score)
   SELECT * FROM user_recommendations
   WHERE user_id = 41 AND served = TRUE
   ORDER BY relevance_score DESC
   LIMIT 20 OFFSET 0;
   ```

### Index Maintenance

```sql
-- Rebuild vector index if table grows 50%+
REINDEX INDEX CONCURRENTLY idx_articles_embedding_ivfflat;

-- Update statistics weekly
ANALYZE news_articles;
ANALYZE user_recommendations;

-- Check for unused indexes
SELECT * FROM index_usage_stats WHERE usage_category = 'UNUSED';
```

### Archival Strategy

```sql
-- Manual archival (or set up cron job)
CALL archive_old_articles(90);  -- Archive articles older than 90 days

-- View archive status
SELECT * FROM archive_status;

-- Cron job (add to crontab)
0 2 * * 0 PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "CALL archive_old_articles();"
```

---

## Monitoring & Maintenance

### Daily Health Check

```sql
-- Quick health check
SELECT * FROM daily_health_check();

-- Recommendation system status
SELECT * FROM recommendation_system_health;

-- Table sizes and bloat
SELECT * FROM table_health;

-- Slow queries (requires pg_stat_statements)
SELECT * FROM slow_queries;

-- Index usage
SELECT * FROM index_usage_stats;
```

### Connection Monitoring

```sql
-- Active connections
SELECT * FROM connection_pool_status;

-- Connection limit check
SHOW max_connections;  -- Default 100

-- Kill idle connections (if needed)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';
```

### Weekly Maintenance Tasks

```bash
# 1. Archive old articles
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "CALL archive_old_articles();"

# 2. Update statistics
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "ANALYZE;"

# 3. Check for dead tuples
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "
SELECT relname, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;"

# 4. Review slow queries
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -c "SELECT * FROM slow_queries;"
```

---

## Backup & Recovery

### Backup Strategy

```bash
# 1. Full database backup (includes schema + data)
pg_dump -h localhost -U news_user -d personalized_news -F c -f backup_$(date +%Y%m%d).dump

# 2. Schema-only backup
pg_dump -h localhost -U news_user -d personalized_news --schema-only -f schema_$(date +%Y%m%d).sql

# 3. Data-only backup (specific tables)
pg_dump -h localhost -U news_user -d personalized_news -t users_personalized -t user_interest_weights -F c -f users_backup_$(date +%Y%m%d).dump

# 4. Backup user data only (for migrations)
pg_dump -h localhost -U news_user -d personalized_news -t users_personalized --data-only -f users_data_$(date +%Y%m%d).sql
```

### Restore

```bash
# 1. Restore full database
pg_restore -h localhost -U news_user -d personalized_news -c backup_20251016.dump

# 2. Restore specific table
pg_restore -h localhost -U news_user -d personalized_news -t users_personalized users_backup_20251016.dump

# 3. Restore from SQL file
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user -f schema_20251016.sql
```

### Automated Backups

```bash
# Add to crontab: Daily backup at 1 AM
0 1 * * * pg_dump -h localhost -U news_user -d personalized_news -F c -f /backups/personalized_news_$(date +\%Y\%m\%d).dump

# Retention: Keep last 7 days
0 2 * * * find /backups -name "personalized_news_*.dump" -mtime +7 -delete
```

---

## Troubleshooting

### Common Issues

#### 1. "Peer authentication failed for user news_user"

**Problem:** PostgreSQL using peer authentication instead of password

**Solution:**
```bash
# Add -h localhost to force TCP connection
PGPASSWORD=campuslens2024 psql -h localhost -d personalized_news -U news_user

# Or update pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Change: local all all peer
# To:     local all all md5
sudo systemctl restart postgresql
```

#### 2. "Extension vector not found"

**Problem:** pgvector extension not installed

**Solution:**
```bash
sudo apt-get install postgresql-15-pgvector
sudo -u postgres psql -d personalized_news -c "CREATE EXTENSION vector;"
```

#### 3. "Dimension mismatch: expected 384, got 768"

**Problem:** Codebase uses all-mpnet-base-v2 (768-dim) but database has old 384-dim column

**Solution:**
```sql
-- Check current dimension
SELECT embedding FROM news_articles LIMIT 1;

-- If 384-dim, update:
ALTER TABLE news_articles ALTER COLUMN embedding TYPE vector(768);

-- Reprocess all articles with new model
UPDATE news_articles SET nlp_processed = FALSE;
```

#### 4. Slow queries

**Problem:** Missing indexes or outdated statistics

**Solution:**
```sql
-- Check index usage
SELECT * FROM index_usage_stats WHERE usage_category = 'UNUSED';

-- Update statistics
ANALYZE news_articles;

-- Check query plan
EXPLAIN ANALYZE SELECT * FROM news_articles WHERE nlp_processed = TRUE LIMIT 10;
```

#### 5. Connection pool exhausted

**Problem:** Too many idle connections

**Solution:**
```sql
-- Check connections
SELECT * FROM connection_pool_status;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';
```

---

## Additional Resources

- **Performance Guide:** `DATABASE_OPTIMIZATION_RECOMMENDATIONS.md`
- **API Documentation:** `/api/README.md`
- **Recommendation Algorithm:** `/reccomendationAlgorithm/OPTIMIZATION_GUIDE.md`
- **Security:** `/api/SECURITY.md`

---

**Last Updated:** October 16, 2025
**Database Version:** PostgreSQL 15 with pgvector 0.5.0
**Maintained By:** CampusLens Team
