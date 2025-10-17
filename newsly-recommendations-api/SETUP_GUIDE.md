# Complete Setup Guide for Newsly

This guide walks you through setting up the complete Newsly system from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup (FastAPI)](#backend-setup)
3. [Frontend Setup (Next.js)](#frontend-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Dell Server Connection](#dell-server-connection)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### On Oracle Server
- Python 3.9+
- PostgreSQL 10+
- Node.js 14+
- Git

### Check installations:
```bash
python --version  # Should be 3.9+
psql --version    # Should be 10+
node --version    # Should be 14+
```

---

## Backend Setup

### 1. Navigate to API directory
```bash
cd /home/opc/NEWS/newsly-recommendations-api
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Database is already set up!
The database `newsly_recommendations` has been created with all tables.

To verify:
```bash
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations -c "\dt+"
```

You should see these tables:
- users
- user_recommendations
- user_interactions
- article_cache
- user_sessions
- rate_limits

### 5. Configure environment variables
The `.env` file is already configured. To use Google OAuth, update these lines:

```bash
# Edit .env file
nano .env

# Update these lines with your Google OAuth credentials:
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 6. Start the API
```bash
# Development mode with auto-reload
uvicorn main:app --host 0.0.0.0 --port 8002 --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8002 --workers 4
```

### 7. Verify API is running
```bash
curl http://localhost:8002/health
```

Expected output:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-17T...",
  "service": "newsly-recommendations-api",
  "version": "2.0.0"
}
```

### 8. Test API endpoints
Visit: http://localhost:8002/docs

This opens interactive API documentation where you can test all endpoints.

---

## Frontend Setup

### 1. Navigate to Next.js app
```bash
cd "/home/opc/NEWS/news-personalization (5)"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create API client
Create `lib/api.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export const api = {
  // Auth
  async register(email: string, name: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getUser(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Recommendations
  async getRecommendations(token: string, page = 1, limit = 20) {
    const res = await fetch(
      `${API_BASE}/recommendations?page=${page}&limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async recordInteraction(token: string, articleId: number, type: string) {
    const res = await fetch(`${API_BASE}/interactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ article_id: articleId, interaction_type: type })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
```

### 4. Create environment file
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8002
```

### 5. Build the app
```bash
npm run build
```

### 6. Start the app
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit: http://localhost:3000

---

## Google OAuth Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a new project
- Click "Select a project" → "New Project"
- Name: "Newsly"
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Create OAuth credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Web application"
- Name: "Newsly Web Client"
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `http://localhost:8002`
- Authorized redirect URIs:
  - `http://localhost:8002/auth/google/callback`
  - `http://localhost:3000/auth/google/callback`
- Click "Create"

### 5. Copy credentials
- Copy "Client ID" and "Client secret"
- Update `.env` in the API directory:
  ```bash
  GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret-here
  ```

### 6. Restart API
```bash
# Stop the API (Ctrl+C)
# Start it again
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

### 7. Test OAuth
Visit: http://localhost:8002/auth/google

Should redirect to Google login.

---

## Dell Server Connection

The API is designed to sync with the Dell server database via reverse SSH.

### Current Status
- Local database is fully functional
- Dell server sync is **optional**
- API works without Dell connection (graceful degradation)

### To Enable Dell Server Sync

#### On the Dell/CampusLens server:
```bash
# Create reverse SSH tunnel
ssh -R 5433:localhost:5432 opc@129.153.226.112 -i /path/to/Martin.key -N
```

This forwards Dell's PostgreSQL (port 5432) to Oracle server's port 5433.

#### On Oracle server:
Update `.env`:
```bash
DELL_SERVER_DB_HOST=localhost
DELL_SERVER_DB_PORT=5433
DELL_SERVER_DB_NAME=personalized_news
DELL_SERVER_DB_USER=news_user
DELL_SERVER_DB_PASSWORD=campuslens2024
```

Restart API to pick up changes.

### Verify Dell Connection
Check API logs on startup:
```
INFO - Dell server database connection pool initialized
```

If you see:
```
WARNING - Dell server database connection failed (will retry on demand)
```

The Dell server is not available, but the API will continue to work with local data only.

---

## Testing

### 1. Test password protection
Visit: http://localhost:3000/onboarding

You should see a password prompt. Enter: `I like apples`

### 2. Test registration
```bash
curl -X POST http://localhost:8002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@newsly.com",
    "name": "Test User",
    "password": "TestPass123"
  }'
```

### 3. Test login
```bash
curl -X POST http://localhost:8002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@newsly.com",
    "password": "TestPass123"
  }'
```

Save the `access_token` from the response.

### 4. Test recommendations
```bash
TOKEN="your-token-here"
curl http://localhost:8002/recommendations \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test interaction recording
```bash
curl -X POST http://localhost:8002/interactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": 1,
    "interaction_type": "click"
  }'
```

---

## Production Deployment

### 1. Security Checklist

- [ ] Change SECRET_KEY in `.env` to a strong random value
- [ ] Update CORS_ORIGINS to production domain only
- [ ] Enable HTTPS (required for OAuth)
- [ ] Set up real Google OAuth credentials
- [ ] Configure firewall rules
- [ ] Set up PostgreSQL backups
- [ ] Review rate limits

### 2. Deploy API with systemd

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
ExecStart=/home/opc/NEWS/newsly-recommendations-api/venv/bin/gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8002
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

### 3. Deploy Next.js with PM2

```bash
npm install -g pm2
pm2 start npm --name "newsly-frontend" -- start
pm2 save
pm2 startup
```

### 4. Set up nginx (optional)

```nginx
server {
    listen 80;
    server_name newsly.example.com;

    location /api/ {
        proxy_pass http://localhost:8002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### API won't start
Check logs:
```bash
# If running manually
tail -f api.log

# If using systemd
sudo journalctl -u newsly-api -f
```

### Database connection error
```bash
# Test connection
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### Frontend can't reach API
Check CORS settings in API `.env`:
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### OAuth not working
1. Verify credentials in `.env`
2. Check redirect URIs in Google Console
3. Ensure HTTPS is enabled (required for production OAuth)

---

## Support

For issues, check:
- `SECURITY.md` - Security features and best practices
- `API_REFERENCE.md` - Complete API documentation
- `README.md` - General information

Database schema: `/migrations/001_add_users_table.sql`
