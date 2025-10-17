# CampusLens API

FastAPI backend for CampusLens personalized news recommendation system.

## Features

- 🔐 **JWT Authentication** - Secure login/register with Bearer tokens
- 📰 **Recommendations** - Personalized article recommendations using Thompson Sampling
- 📋 **Briefings** - AI-generated news briefings with Gemini API
- 👤 **User Profiles** - Manage interests, preferences, and settings
- 📊 **Analytics** - Track user interactions and engagement

## Quick Start

### 1. Database Migration

Add password column to database:

```bash
conda activate newsenv
psql -d personalized_news -U news_user -f migrations/001_add_password_column.sql
```

### 2. Install Dependencies

```bash
cd /home/campuslens/news/api
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and update:
# - SECRET_KEY (use a strong random key)
# - GEMINI_API_KEY
# - CORS_ORIGINS (add your Oracle frontend URL)
```

### 4. Run API Server

```bash
# Development (with auto-reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. Access Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/refresh` | Refresh access token |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/` | Get recommendations (paginated) |
| POST | `/recommendations/interaction` | Record interaction (view/click/share) |
| POST | `/recommendations/regenerate` | Generate fresh recommendations |
| GET | `/recommendations/article/{id}` | Get article details |

### Briefings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/briefings/` | Get user's briefings |
| GET | `/briefings/latest` | Get latest briefing |
| POST | `/briefings/generate` | Generate new briefing |
| POST | `/briefings/mark-viewed` | Mark briefing as viewed |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update profile |
| GET | `/users/preferences` | Get news preferences |
| PUT | `/users/preferences` | Update preferences |
| GET | `/users/stats` | Get user statistics |

## Authentication Flow

### 1. Register/Login

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePass123",
    "name": "John Doe",
    "age_range": "19-22",
    "field_of_study": "Computer Science"
  }'

# Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 42,
  "name": "John Doe"
}
```

### 2. Use Token for Protected Endpoints

```bash
curl -X GET http://localhost:8000/recommendations/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Frontend Integration

### Example: React/Vue Frontend on Oracle Server

```javascript
// api.js - API client setup
const API_BASE = 'http://your-dell-server-ip:8000';

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  // Store token
  localStorage.setItem('token', data.access_token);

  return data;
}

// Get recommendations
async function getRecommendations(page = 1) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}/recommendations/?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}

// Record click interaction
async function recordClick(articleId, timeSpent) {
  const token = localStorage.getItem('token');

  await fetch(`${API_BASE}/recommendations/interaction`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      article_id: articleId,
      interaction_type: 'click',
      time_spent_seconds: timeSpent
    })
  });
}
```

## Architecture

```
Oracle Server (Frontend)           Dell Server (Backend)
┌─────────────────────┐           ┌──────────────────────┐
│  React/Vue App      │  ←HTTPS→  │  FastAPI (Port 8000) │
│  - Login UI         │           │  - JWT Auth          │
│  - Feed Display     │           │  - /recommendations  │
│  - Article View     │           │  - /briefings        │
└─────────────────────┘           └──────────────────────┘
                                           ↓
                                   ┌──────────────────────┐
                                   │  PostgreSQL DB       │
                                   │  - users            │
                                   │  - recommendations  │
                                   │  - interactions     │
                                   └──────────────────────┘
```

## CORS Configuration

The API is configured to accept requests from your Oracle frontend. Update `config.py`:

```python
CORS_ORIGINS: List[str] = [
    "http://your-oracle-server-ip",
    "https://your-oracle-server-domain.com",
]
```

## Security Best Practices

### Production Deployment

1. **Use HTTPS**: Deploy behind nginx with SSL certificate
2. **Change SECRET_KEY**: Generate strong random key
3. **Restrict CORS**: Only allow your Oracle frontend domain
4. **Rate Limiting**: Add rate limiting middleware (e.g., slowapi)
5. **Environment Variables**: Never commit .env file

### Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name api.campuslens.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Schema Requirements

The API expects these tables:

- `users_personalized` - User profiles (with `password_hash` column)
- `news_articles` - Articles with NLP features
- `user_recommendations` - Generated recommendations
- `user_interactions` - User engagement tracking
- `user_briefings` - Generated briefings

See `migrations/` for SQL scripts.

## Performance

- **Recommendations endpoint**: ~50-200ms (cached)
- **Briefing generation**: ~5-10s (Gemini API call)
- **Authentication**: ~10-30ms
- **Profile updates**: ~20-50ms

### Scaling

For high traffic:
- Add Redis caching for recommendations
- Use connection pooling (already configured)
- Deploy with multiple workers: `--workers 4`
- Use Gunicorn + Uvicorn workers

## Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# Get recommendations (replace TOKEN)
curl http://localhost:8000/recommendations/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Automated Testing

```bash
# Install pytest
pip install pytest pytest-asyncio httpx

# Run tests (coming soon)
pytest tests/
```

## Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`
- Test connection: `psql -d personalized_news -U news_user`

### "Could not validate credentials"
- Check token is valid (not expired)
- Ensure `Authorization: Bearer <token>` header is set
- Token expires after 7 days by default

### "CORS error"
- Add your frontend URL to `CORS_ORIGINS` in `config.py`
- Restart API server after config changes

### "Import errors"
- Ensure `newsenv` conda environment is activated
- Check Python path includes recommendation/briefing modules
- Verify all dependencies installed: `pip install -r requirements.txt`

## Development

### Project Structure

```
api/
├── main.py              # FastAPI app & startup
├── config.py            # Settings & environment
├── database.py          # DB connection pooling
├── requirements.txt     # Python dependencies
├── .env.example         # Example environment config
├── routers/             # API endpoints
│   ├── auth.py          # Authentication
│   ├── recommendations.py
│   ├── briefings.py
│   └── users.py
├── schemas/             # Pydantic models
│   ├── user.py
│   ├── recommendation.py
│   └── briefing.py
├── utils/               # Helper functions
│   └── auth.py          # JWT & password utils
└── migrations/          # Database migrations
    └── 001_add_password_column.sql
```

### Adding New Endpoints

1. Create schema in `schemas/`
2. Add router in `routers/`
3. Include router in `main.py`
4. Test with Swagger UI at `/docs`

## License

Proprietary - CampusLens

---

**Questions?** Check the [full documentation](../OPTIMIZATION_GUIDE.md) or [open an issue](https://github.com/your-repo/issues).
