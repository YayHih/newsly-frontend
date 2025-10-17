# Newsly API Reference

Complete API documentation for the Newsly Recommendations Service.

**Base URL:** `http://localhost:8002`
**Version:** 2.0.0

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### POST /auth/register
Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as `/auth/register`

---

### GET /auth/google
Initiate Google OAuth login flow.

**Response:** Redirects to Google OAuth consent screen

---

### GET /auth/google/callback
Handle Google OAuth callback (called by Google).

**Response:** Redirects to frontend with token: `http://localhost:3000/auth/success?token=<jwt-token>`

---

### GET /auth/me
Get current user information.

**Requires:** Authentication

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "picture_url": "https://lh3.googleusercontent.com/...",
  "primary_interests": ["Technology", "Science"],
  "secondary_interests": ["Sports"],
  "email_verified": true
}
```

---

### PUT /auth/profile
Update user profile.

**Requires:** Authentication

**Request Body:** (all fields optional)
```json
{
  "name": "Jane Doe",
  "age_range": "25-30",
  "education_level": "Graduate",
  "field_of_study": "Computer Science",
  "primary_interests": ["AI", "Machine Learning", "Data Science"],
  "secondary_interests": ["Photography"],
  "hobbies": ["Reading", "Hiking"],
  "topics_to_avoid": ["Politics"],
  "preferred_complexity": "advanced",
  "preferred_article_length": "long",
  "news_frequency": "daily",
  "preferred_content_types": ["research", "analysis"],
  "political_orientation": "moderate",
  "credibility_threshold": 0.8
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

## Recommendations

### GET /recommendations
Get personalized article recommendations.

**Requires:** Authentication

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Items per page

**Response:**
```json
[
  {
    "id": 123,
    "article_id": 456,
    "relevance_score": 0.92,
    "recommendation_reason": "Matches your interest in AI",
    "article_title": "Breakthrough in Machine Learning",
    "article_source": "Nature",
    "article_url": "https://example.com/article",
    "article_description": "Researchers develop new algorithm...",
    "created_at": "2025-10-17T14:30:00Z"
  }
]
```

---

### POST /interactions
Record user interaction with an article.

**Requires:** Authentication

**Request Body:**
```json
{
  "article_id": 456,
  "interaction_type": "click",
  "time_spent_seconds": 120,
  "completion_rate": 0.75,
  "scroll_depth": 0.85,
  "position_in_feed": 3
}
```

**Interaction Types:** `view`, `click`, `like`, `share`, `hide`, `bookmark`

**Response:**
```json
{
  "status": "success",
  "message": "Interaction recorded"
}
```

---

### GET /stats
Get user statistics.

**Requires:** Authentication

**Response:**
```json
{
  "total_recommendations": 150,
  "served_count": 120,
  "clicked_count": 45,
  "avg_relevance_score": 0.87,
  "last_recommendation_at": "2025-10-17T14:30:00Z",
  "click_through_rate": 37.5
}
```

---

## Utility Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-17T14:30:00.000Z",
  "service": "newsly-recommendations-api",
  "version": "2.0.0"
}
```

---

### POST /auth/verify-password
Verify onboarding password.

**Request Body:**
```json
{
  "password": "I like apples"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Password verified"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (invalid credentials) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Rate Limits

- **Per Minute:** 60 requests
- **Per Hour:** 1000 requests

Rate limits are per user (when authenticated) or per IP address (when anonymous).

---

## Example Usage

### JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:8002';

// Register
const register = async (email: string, name: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password })
  });
  return response.json();
};

// Login
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get recommendations
const getRecommendations = async (token: string, page = 1) => {
  const response = await fetch(
    `${API_BASE}/recommendations?page=${page}&limit=20`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};

// Record interaction
const recordInteraction = async (
  token: string,
  articleId: number,
  type: string
) => {
  const response = await fetch(`${API_BASE}/interactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      article_id: articleId,
      interaction_type: type
    })
  });
  return response.json();
};
```

### Python

```python
import requests

API_BASE = 'http://localhost:8002'

# Register
response = requests.post(f'{API_BASE}/auth/register', json={
    'email': 'user@example.com',
    'name': 'John Doe',
    'password': 'SecurePass123'
})
data = response.json()
token = data['access_token']

# Get recommendations
response = requests.get(
    f'{API_BASE}/recommendations',
    headers={'Authorization': f'Bearer {token}'},
    params={'page': 1, 'limit': 20}
)
recommendations = response.json()
```

---

## Interactive Documentation

Visit **http://localhost:8002/docs** for interactive Swagger UI documentation where you can test all endpoints directly.
