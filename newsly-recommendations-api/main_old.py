"""
Newsly Recommendations API
Fast, secure, and scalable recommendation service for the Newsly platform
"""
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from config import settings
from database import init_connection_pools, close_connection_pools, execute_query, get_db_cursor
from auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
    verify_onboarding_password
)
from rate_limiter import RateLimiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Newsly Recommendations API",
    description="High-performance recommendation service for personalized news",
    version="1.0.0"
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


# Pydantic models
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class PasswordVerification(BaseModel):
    password: str


class RecommendationResponse(BaseModel):
    id: int
    article_id: int
    relevance_score: float
    recommendation_reason: Optional[str]
    article_title: Optional[str]
    article_source: Optional[str]
    article_url: Optional[str]
    created_at: datetime


class InteractionCreate(BaseModel):
    article_id: int
    interaction_type: str = Field(..., pattern="^(view|click|like|share|hide|bookmark)$")
    time_spent_seconds: Optional[int] = 0
    completion_rate: Optional[float] = None
    scroll_depth: Optional[float] = None
    position_in_feed: Optional[int] = None


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize connection pools on startup"""
    logger.info("Starting Newsly Recommendations API")
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
        "service": "newsly-recommendations-api"
    }


# Authentication endpoints
@app.post("/auth/verify-password")
async def verify_password_endpoint(data: PasswordVerification):
    """Verify onboarding password"""
    if verify_onboarding_password(data.password):
        return {"valid": True, "message": "Password verified"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid password"
    )


@app.post("/auth/register")
async def register(user: UserRegister):
    """Register a new user"""
    try:
        # Check if user already exists
        query = "SELECT id FROM users_personalized WHERE email = %s"
        existing = execute_query(query, (user.email,), use_dell_server=True)

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Hash password
        hashed_password = get_password_hash(user.password)

        # Insert into Dell server database
        insert_query = """
            INSERT INTO users_personalized (email, name, password_hash, created_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING id
        """
        result = execute_query(
            insert_query,
            (user.email, user.name, hashed_password),
            use_dell_server=True
        )

        user_id = result[0][0]

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user_id), "email": user.email, "name": user.name}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "name": user.name
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
async def login(credentials: UserLogin):
    """Login user"""
    try:
        # Get user from Dell server database
        query = """
            SELECT id, name, email, password_hash
            FROM users_personalized
            WHERE email = %s
        """
        result = execute_query(query, (credentials.email,), use_dell_server=True)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user_id, name, email, password_hash = result[0]

        # Verify password
        if not verify_password(credentials.password, password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user_id), "email": email, "name": name}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "name": name
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user


# Recommendations endpoints
@app.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limiter)
):
    """
    Get personalized recommendations for current user

    Fetches from local cache first, then from Dell server if needed
    """
    try:
        user_id = current_user["user_id"]
        offset = (page - 1) * limit

        # Try to get from local database first
        query = """
            SELECT
                r.id,
                r.article_id,
                r.relevance_score,
                r.recommendation_reason,
                a.title as article_title,
                a.source as article_source,
                a.url as article_url,
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

        # Mark as served
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
                "created_at": rec[7]
            })

        return results

    except Exception as e:
        logger.error(f"Error fetching recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recommendations"
        )


@app.post("/recommendations/sync")
async def sync_recommendations(
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limiter)
):
    """Manually sync recommendations from Dell server"""
    try:
        user_id = current_user["user_id"]
        count = await sync_recommendations_from_dell(user_id)

        return {
            "status": "success",
            "synced_count": count,
            "message": f"Synced {count} recommendations from Dell server"
        }

    except Exception as e:
        logger.error(f"Error syncing recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync recommendations"
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

        # Insert interaction into local database
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

        return {
            "status": "success",
            "message": "Interaction recorded"
        }

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
    """
    Sync recommendations from Dell server to local database

    Args:
        user_id: User ID to sync recommendations for

    Returns:
        Number of recommendations synced
    """
    try:
        # Fetch recommendations from Dell server
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

        # Insert into local database
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
    uvicorn.run(app, host="0.0.0.0", port=8001)
