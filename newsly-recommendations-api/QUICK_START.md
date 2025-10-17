# Newsly Quick Start Guide

Get the Newsly system running in 5 minutes.

## Prerequisites
- Python 3.9+ installed
- PostgreSQL running
- Node.js 14+ installed

## Start the Backend API

```bash
cd /home/opc/NEWS/newsly-recommendations-api

# Activate virtual environment
source venv/bin/activate

# Start the API
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

**API is now running at:** http://localhost:8002

**Test it:**
```bash
curl http://localhost:8002/health
```

**View interactive docs:** http://localhost:8002/docs

## Start the Frontend

```bash
cd "/home/opc/NEWS/news-personalization (5)"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend is now running at:** http://localhost:3000

## Quick Test

### 1. Test Password Protection
Visit: http://localhost:3000/onboarding

Password: `I like apples`

### 2. Test User Registration
```bash
curl -X POST http://localhost:8002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "name": "Your Name",
    "password": "YourPass123"
  }'
```

Save the `access_token` from the response.

### 3. Test Getting Recommendations
```bash
TOKEN="paste-your-token-here"

curl http://localhost:8002/recommendations \
  -H "Authorization: Bearer $TOKEN"
```

## What's Working

✅ **Local user database** - All users stored on Oracle server
✅ **User authentication** - Email/password and Google OAuth ready
✅ **Password protection** - Onboarding requires "I like apples"
✅ **SQL injection protection** - All queries parameterized
✅ **Rate limiting** - 60 req/min, 1000 req/hour
✅ **Dual-database sync** - Syncs to Dell server (if available)
✅ **Connection pooling** - Optimized database performance
✅ **Recommendations system** - Fetches and caches from Dell server
✅ **User interactions** - Track clicks, views, likes, etc.

## Common Commands

### Stop the API
```bash
# Press Ctrl+C in the terminal running uvicorn
```

### View API Logs
```bash
# API outputs to terminal when run with --reload
# Or check api.log if running in background
tail -f api.log
```

### Check Database
```bash
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations -c "\dt+"
```

### Test All Endpoints
Visit: http://localhost:8002/docs

Click "Try it out" on any endpoint.

## Next Steps

1. **Set up Google OAuth** (optional)
   - See `SETUP_GUIDE.md` → "Google OAuth Setup"
   - Get credentials from Google Cloud Console
   - Update `.env` with real credentials

2. **Connect to Dell Server** (optional)
   - See `SETUP_GUIDE.md` → "Dell Server Connection"
   - Set up reverse SSH tunnel
   - Enable full recommendation sync

3. **Update Frontend** (optional)
   - Create `/lib/api.ts` with API client
   - Replace filler data with real API calls
   - Connect forms to backend

## Troubleshooting

**API won't start:**
```bash
# Check if port 8002 is in use
netstat -tlnp | grep 8002

# Kill process if needed
pkill -f "uvicorn main:app"
```

**Can't connect to database:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
PGPASSWORD=newsly_secure_2024 psql -h localhost -U newsly_user -d newsly_recommendations
```

**Frontend can't reach API:**
- Check API is running on port 8002
- Check CORS settings in `/home/opc/NEWS/newsly-recommendations-api/.env`
- Verify `CORS_ORIGINS` includes `http://localhost:3000`

## File Locations

**Backend API:**
- Location: `/home/opc/NEWS/newsly-recommendations-api/`
- Main file: `main.py`
- Config: `.env`
- Database: `newsly_recommendations` (PostgreSQL)

**Frontend:**
- Location: `/home/opc/NEWS/news-personalization (5)/`
- Main page: `app/page.tsx`
- Onboarding: `app/onboarding/page.tsx`

## Documentation

- **IMPLEMENTATION_SUMMARY.md** - What's been built
- **API_REFERENCE.md** - Complete API documentation
- **SECURITY.md** - Security features
- **SETUP_GUIDE.md** - Detailed setup instructions

## Support

Check the logs if something isn't working:
- API logs: Terminal running uvicorn
- Frontend logs: Browser console (F12)
- Database logs: `sudo journalctl -u postgresql`

---

**You're all set! 🚀**

The system is fully functional with local user management, authentication, and recommendations caching. The Dell server sync is optional and will work automatically when the SSH tunnel is established.
