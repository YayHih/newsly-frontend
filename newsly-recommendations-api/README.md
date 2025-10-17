# Newsly Recommendations API

High-performance FastAPI service for personalized news recommendations. Optimized for scale with connection pooling, rate limiting, and efficient caching.

## Features

- **Fast PostgreSQL database** with optimized indexes
- **Connection pooling** for both local and Dell server databases
- **Rate limiting** to prevent abuse
- **JWT authentication** for secure API access
- **Password-protected onboarding** (password: "I like apples")
- **Automatic syncing** from Dell server via reverse SSH
- **Article caching** to reduce database load
- **User interaction tracking** for analytics

## Architecture

```
Next.js Frontend (Oracle Server)
         ↓
FastAPI Backend (Oracle Server) :8001
         ↓
    PostgreSQL (Oracle Server) - newsly_recommendations
         ↓ (reverse SSH)
    PostgreSQL (Dell Server via SSH tunnel) - personalized_news
```

## Installation

### 1. Install Dependencies

```bash
cd /home/opc/NEWS/newsly-recommendations-api

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Database Setup

The database has already been created. To verify:

```bash
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations -c "\dt+"
```

### 3. Configure Environment

Edit `.env` file if needed (default values should work):

```bash
nano .env
```

### 4. Run the API

#### Development Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### Production Mode

```bash
# Using uvicorn with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4

# Or using gunicorn (recommended for production)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## API Endpoints

### Health Check

```bash
curl http://localhost:8001/health
```

### Authentication

#### Verify Onboarding Password

```bash
curl -X POST http://localhost:8001/auth/verify-password \
  -H "Content-Type: application/json" \
  -d '{"password": "I like apples"}'
```

#### Register

```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Recommendations (Requires Authentication)

#### Get Recommendations

```bash
curl http://localhost:8001/recommendations?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Sync Recommendations from Dell Server

```bash
curl -X POST http://localhost:8001/recommendations/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Record Interaction

```bash
curl -X POST http://localhost:8001/interactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": 123,
    "interaction_type": "click",
    "time_spent_seconds": 45,
    "position_in_feed": 3
  }'
```

#### Get User Stats

```bash
curl http://localhost:8001/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### Tables

- `user_recommendations` - Cached recommendations from Dell server
- `user_interactions` - User engagement tracking
- `article_cache` - Article metadata cache (24h TTL)
- `user_sessions` - Active user sessions
- `rate_limits` - Rate limiting data

### Indexes

All tables have optimized indexes for fast queries:
- User ID lookups
- Time-range queries
- Relevance score sorting

## Performance Optimization

### Connection Pooling

- **Local DB Pool**: 2-20 connections
- **Dell Server Pool**: 1-10 connections

### Caching Strategy

- Articles cached for 24 hours
- Automatic cleanup of expired cache
- Recommendations synced from Dell server as needed

### Rate Limiting

- **Per Minute**: 60 requests
- **Per Hour**: 1000 requests

## Security Features

1. **Password Protection**: Onboarding requires password "I like apples"
2. **JWT Authentication**: All API endpoints require valid tokens
3. **Rate Limiting**: Prevents abuse
4. **Input Validation**: Pydantic models validate all inputs
5. **SQL Injection Protection**: Parameterized queries
6. **CORS Configuration**: Restricts allowed origins

## Reverse SSH Configuration

To connect to Dell server database:

### On Oracle Server

```bash
# SSH tunnel is already configured via:
# ssh -R 3333:localhost:22 opc@oracle-server

# Test connection to Dell server DB
PGPASSWORD=campuslens2024 psql -h localhost -p 5432 -U news_user -d personalized_news -c "SELECT COUNT(*) FROM news_articles;"
```

## Monitoring

### Check Connection Pool Status

```python
from database import local_connection_pool, dell_connection_pool

print(f"Local pool: {local_connection_pool.pool}")
print(f"Dell pool: {dell_connection_pool.pool}")
```

### View Rate Limits

```sql
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations -c "SELECT * FROM rate_limits ORDER BY window_start DESC LIMIT 10;"
```

### Check Recommendation Stats

```sql
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations -c "SELECT * FROM recommendation_stats;"
```

## Deployment

### Systemd Service

Create `/etc/systemd/system/newsly-api.service`:

```ini
[Unit]
Description=Newsly Recommendations API
After=network.target postgresql.service

[Service]
Type=simple
User=opc
WorkingDirectory=/home/opc/NEWS/newsly-recommendations-api
Environment="PATH=/home/opc/NEWS/newsly-recommendations-api/venv/bin"
ExecStart=/home/opc/NEWS/newsly-recommendations-api/venv/bin/gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable newsly-api
sudo systemctl start newsly-api
sudo systemctl status newsly-api
```

## Troubleshooting

### Connection Pool Errors

If you see connection pool exhaustion:

```bash
# Increase pool size in database.py
maxconn=20  # Increase this value
```

### Rate Limit Issues

To reset rate limits:

```sql
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations -c "DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';"
```

### Dell Server Connection Issues

Verify reverse SSH tunnel:

```bash
# On Dell server, check if tunnel is active
ps aux | grep ssh
netstat -tlnp | grep 3333
```

## API Documentation

Access interactive API documentation:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## License

Proprietary - Newsly/CampusLens
