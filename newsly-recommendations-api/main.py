"""
Newsly Recommendations API v2
Secure, scalable FastAPI with Google OAuth and dual-database sync
All queries use parameterized statements to prevent SQL injection
"""
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from datetime import datetime, timedelta
import logging
import re

from config import settings
from database import init_connection_pools, close_connection_pools, execute_query
from auth import create_access_token, get_current_user
from user_service import UserService
from rate_limiter import RateLimiter
from oauth import oauth

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Newsly Recommendations API",
    description="Secure, high-performance recommendation service with OAuth",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter
rate_limiter = RateLimiter(
    requests_per_minute=settings.RATE_LIMIT_PER_MINUTE,
    requests_per_hour=settings.RATE_LIMIT_PER_HOUR
)


# Pydantic models with validation
class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

    @validator('name')
    def validate_name(cls, v):
        # Prevent SQL injection in name field
        if re.search(r'[;<>\'\"\\]', v):
            raise ValueError('Name contains invalid characters')
        return v.strip()

    @validator('password')
    def validate_password(cls, v):
        # Require strong password
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain number')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordVerification(BaseModel):
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    age_range: Optional[str] = None
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    primary_interests: Optional[List[str]] = Field(None, max_items=10)
    secondary_interests: Optional[List[str]] = Field(None, max_items=10)
    hobbies: Optional[List[str]] = Field(None, max_items=10)
    topics_to_avoid: Optional[List[str]] = Field(None, max_items=10)
    preferred_complexity: Optional[str] = None
    preferred_article_length: Optional[str] = None
    news_frequency: Optional[str] = None
    preferred_content_types: Optional[List[str]] = None
    political_orientation: Optional[str] = None
    credibility_threshold: Optional[float] = Field(None, ge=0, le=1)

    @validator('name', 'age_range', 'education_level', 'field_of_study',
               'preferred_complexity', 'preferred_article_length', 'news_frequency',
               'political_orientation')
    def validate_text_fields(cls, v):
        if v and re.search(r'[;<>\'\"\\]', v):
            raise ValueError('Field contains invalid characters')
        return v.strip() if v else v

    @validator('primary_interests', 'secondary_interests', 'hobbies',
               'topics_to_avoid', 'preferred_content_types')
    def validate_lists(cls, v):
        if v:
            for item in v:
                if re.search(r'[;<>\'\"\\]', item):
                    raise ValueError('List item contains invalid characters')
        return v


class RecommendationResponse(BaseModel):
    id: int
    article_id: int
    relevance_score: float
    recommendation_reason: Optional[str]
    article_title: Optional[str]
    article_source: Optional[str]
    article_url: Optional[str]
    article_description: Optional[str]
    created_at: datetime


class InteractionCreate(BaseModel):
    article_id: int = Field(..., gt=0)
    interaction_type: str = Field(..., pattern="^(view|click|like|share|hide|bookmark)$")
    time_spent_seconds: Optional[int] = Field(0, ge=0, le=86400)
    completion_rate: Optional[float] = Field(None, ge=0, le=1)
    scroll_depth: Optional[float] = Field(None, ge=0, le=1)
    position_in_feed: Optional[int] = Field(None, ge=1)


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize connection pools on startup"""
    logger.info("Starting Newsly Recommendations API v2")
    init_connection_pools()
    logger.info("Connection pools initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Close connection pools on shutdown"""
    logger.info("Shutting down Newsly Recommendations API")
    close_connection_pools()
    logger.info("Connection pools closed")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "newsly-recommendations-api",
        "version": "2.0.0"
    }


# Authentication endpoints
@app.post("/auth/verify-password")
async def verify_password_endpoint(data: PasswordVerification):
    """Verify onboarding password"""
    if data.password == settings.ONBOARDING_PASSWORD:
        return {"valid": True, "message": "Password verified"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid password"
    )


@app.post("/auth/register")
async def register(user: UserRegister, _: None = Depends(rate_limiter)):
    """Register a new user with email and password"""
    try:
        # Check if user exists
        existing_user = UserService.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Create user (with SQL injection protection in UserService)
        new_user = UserService.create_user(
            email=user.email,
            name=user.name,
            password=user.password,
            oauth_provider='email'
        )

        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(new_user['id']),
                "email": new_user['email'],
                "name": new_user['name']
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": new_user['id'],
            "name": new_user['name'],
            "email": new_user['email']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@app.post("/auth/login")
async def login(credentials: UserLogin, _: None = Depends(rate_limiter)):
    """Login with email and password"""
    try:
        # Verify credentials (protected against SQL injection)
        user = UserService.verify_credentials(credentials.email, credentials.password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(user['id']),
                "email": user['email'],
                "name": user['name']
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user['id'],
            "name": user['name'],
            "email": user['email']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@app.get("/auth/google")
async def google_login(request: Request):
    """Initiate Google OAuth flow"""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured"
        )

    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback"""
    try:
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Google OAuth not configured"
            )

        # Get token from Google
        token = await oauth.google.authorize_access_token(request)

        # Get user info
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )

        google_id = user_info['sub']
        email = user_info['email']
        name = user_info.get('name', email.split('@')[0])
        picture = user_info.get('picture')

        # Check if user exists
        user = UserService.get_user_by_oauth('google', google_id)

        if not user:
            # Check if email exists with different provider
            existing_email_user = UserService.get_user_by_email(email)
            if existing_email_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered with different method"
                )

            # Create new user
            user = UserService.create_user(
                email=email,
                name=name,
                oauth_provider='google',
                oauth_provider_id=google_id,
                oauth_access_token=token.get('access_token'),
                picture_url=picture
            )

        # Create JWT token
        access_token = create_access_token(
            data={
                "sub": str(user['id']),
                "email": user['email'],
                "name": user['name']
            }
        )

        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?error=authentication_failed"
        )


@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    # Get full user profile
    user = UserService.get_user_by_email(current_user['email'])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "picture_url": user.get('picture_url'),
        "primary_interests": user.get('primary_interests', []),
        "secondary_interests": user.get('secondary_interests', []),
        "email_verified": user.get('email_verified', False)
    }


@app.put("/auth/profile")
async def update_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limiter)
):
    """Update user profile"""
    try:
        # Filter out None values
        profile_data = {k: v for k, v in profile.dict().items() if v is not None}

        if not profile_data:
            return {"message": "No fields to update"}

        # Update profile (with SQL injection protection)
        success = UserService.update_profile(current_user['user_id'], profile_data)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )

        return {"message": "Profile updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


# Recommendations endpoints
@app.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    page: int = Field(1, ge=1),
    limit: int = Field(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limiter)
):
    """Get personalized recommendations for current user"""
    try:
        user_id = current_user["user_id"]
        offset = (page - 1) * limit

        # Parameterized query to prevent SQL injection
        query = """
            SELECT
                r.id,
                r.article_id,
                r.relevance_score,
                r.recommendation_reason,
                a.title as article_title,
                a.source as article_source,
                a.url as article_url,
                a.description as article_description,
                r.created_at
            FROM user_recommendations r
            LEFT JOIN article_cache a ON r.article_id = a.article_id
            WHERE r.user_id = %s
              AND r.served = FALSE
            ORDER BY r.relevance_score DESC, r.created_at DESC
            LIMIT %s OFFSET %s
        """
        recommendations = execute_query(query, (user_id, limit, offset))

        if not recommendations:
            # If no local recommendations, sync from Dell server
            await sync_recommendations_from_dell(user_id)
            recommendations = execute_query(query, (user_id, limit, offset))

        # Mark as served (parameterized query)
        if recommendations:
            rec_ids = [rec[0] for rec in recommendations]
            mark_served_query = """
                UPDATE user_recommendations
                SET served = TRUE, served_at = NOW()
                WHERE id = ANY(%s)
            """
            execute_query(mark_served_query, (rec_ids,), fetch=False)

        # Format response
        results = []
        for rec in recommendations:
            results.append({
                "id": rec[0],
                "article_id": rec[1],
                "relevance_score": rec[2],
                "recommendation_reason": rec[3],
                "article_title": rec[4],
                "article_source": rec[5],
                "article_url": rec[6],
                "article_description": rec[7],
                "created_at": rec[8]
            })

        return results

    except Exception as e:
        logger.error(f"Error fetching recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recommendations"
        )


@app.post("/interactions")
async def record_interaction(
    interaction: InteractionCreate,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limiter)
):
    """Record user interaction with an article"""
    try:
        user_id = current_user["user_id"]

        # Insert interaction (parameterized query)
        insert_query = """
            INSERT INTO user_interactions (
                user_id, article_id, interaction_type,
                time_spent_seconds, completion_rate, scroll_depth,
                position_in_feed, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """
        execute_query(
            insert_query,
            (
                user_id,
                interaction.article_id,
                interaction.interaction_type,
                interaction.time_spent_seconds,
                interaction.completion_rate,
                interaction.scroll_depth,
                interaction.position_in_feed
            ),
            fetch=False
        )

        # If it's a click, update recommendation table
        if interaction.interaction_type == "click":
            update_query = """
                UPDATE user_recommendations
                SET clicked = TRUE, clicked_at = NOW()
                WHERE user_id = %s AND article_id = %s
            """
            execute_query(update_query, (user_id, interaction.article_id), fetch=False)

        return {"status": "success", "message": "Interaction recorded"}

    except Exception as e:
        logger.error(f"Error recording interaction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record interaction"
        )


@app.get("/stats")
async def get_user_stats(
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limiter)
):
    """Get user statistics"""
    try:
        user_id = current_user["user_id"]

        # Parameterized query
        query = """
            SELECT
                total_recommendations,
                served_count,
                clicked_count,
                avg_relevance_score,
                last_recommendation_at
            FROM recommendation_stats
            WHERE user_id = %s
        """
        result = execute_query(query, (user_id,))

        if result:
            return {
                "total_recommendations": result[0][0],
                "served_count": result[0][1],
                "clicked_count": result[0][2],
                "avg_relevance_score": float(result[0][3]) if result[0][3] else 0,
                "last_recommendation_at": result[0][4],
                "click_through_rate": round((result[0][2] / result[0][1] * 100), 2) if result[0][1] > 0 else 0
            }

        return {
            "total_recommendations": 0,
            "served_count": 0,
            "clicked_count": 0,
            "avg_relevance_score": 0,
            "last_recommendation_at": None,
            "click_through_rate": 0
        }

    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )


# Helper functions
async def sync_recommendations_from_dell(user_id: int) -> int:
    """Sync recommendations from Dell server to local database"""
    try:
        # Parameterized query to fetch from Dell server
        query = """
            SELECT
                r.article_id,
                r.relevance_score,
                r.score_breakdown,
                r.recommendation_reason,
                r.algorithm_version,
                a.title,
                a.source,
                a.url,
                a.published_at,
                a.description
            FROM user_recommendations r
            JOIN news_articles a ON r.article_id = a.id
            WHERE r.user_id = %s
              AND r.created_at > NOW() - INTERVAL '7 days'
            ORDER BY r.relevance_score DESC
            LIMIT 100
        """
        recommendations = execute_query(query, (user_id,), use_dell_server=True)

        if not recommendations:
            return 0

        # Insert into local database (parameterized queries)
        count = 0
        for rec in recommendations:
            try:
                # Cache article data
                cache_query = """
                    INSERT INTO article_cache (
                        article_id, title, source, url, published_at, description
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (article_id) DO UPDATE SET
                        title = EXCLUDED.title,
                        source = EXCLUDED.source,
                        cached_at = NOW(),
                        expires_at = NOW() + INTERVAL '24 hours'
                """
                execute_query(cache_query, rec[5:11], fetch=False)

                # Insert recommendation
                rec_query = """
                    INSERT INTO user_recommendations (
                        user_id, article_id, relevance_score, score_breakdown,
                        recommendation_reason, algorithm_version, created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (user_id, article_id, created_at) DO NOTHING
                """
                execute_query(
                    rec_query,
                    (user_id, rec[0], rec[1], rec[2], rec[3], rec[4]),
                    fetch=False
                )
                count += 1

            except Exception as e:
                logger.error(f"Error syncing individual recommendation: {e}")
                continue

        return count

    except Exception as e:
        logger.error(f"Error syncing from Dell server: {e}")
        return 0


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
