"""Rate limiting middleware"""
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from database import execute_query
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """Rate limiter using database storage"""

    def __init__(self, requests_per_minute: int = 60, requests_per_hour: int = 1000):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour

    async def __call__(self, request: Request):
        """Check rate limit for request"""
        # Get identifier (user_id or IP address)
        identifier = self._get_identifier(request)
        endpoint = request.url.path

        # Check minute limit
        if not self._check_limit(identifier, endpoint, "minute", self.requests_per_minute):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )

        # Check hour limit
        if not self._check_limit(identifier, endpoint, "hour", self.requests_per_hour):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Hourly rate limit exceeded. Please try again later."
            )

        # Record request
        self._record_request(identifier, endpoint)

    def _get_identifier(self, request: Request) -> str:
        """Get identifier for rate limiting (user_id or IP)"""
        # Try to get user_id from request state (set by auth middleware)
        if hasattr(request.state, "user") and request.state.user:
            return f"user_{request.state.user.get('user_id')}"

        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip_{forwarded.split(',')[0].strip()}"
        return f"ip_{request.client.host}"

    def _check_limit(self, identifier: str, endpoint: str, window: str, limit: int) -> bool:
        """Check if request is within rate limit"""
        try:
            # Calculate window start time
            if window == "minute":
                window_start = datetime.now() - timedelta(minutes=1)
            else:  # hour
                window_start = datetime.now() - timedelta(hours=1)

            # Count requests in window
            query = """
                SELECT COALESCE(SUM(request_count), 0) as total
                FROM rate_limits
                WHERE identifier = %s
                  AND endpoint = %s
                  AND window_start >= %s
            """
            result = execute_query(query, (identifier, endpoint, window_start))

            if result and len(result) > 0:
                total_requests = result[0][0]
                return total_requests < limit

            return True

        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            # On error, allow request (fail open for better UX)
            return True

    def _record_request(self, identifier: str, endpoint: str):
        """Record a request for rate limiting"""
        try:
            # Round to current minute for aggregation
            window_start = datetime.now().replace(second=0, microsecond=0)

            query = """
                INSERT INTO rate_limits (identifier, endpoint, request_count, window_start)
                VALUES (%s, %s, 1, %s)
                ON CONFLICT (identifier, endpoint, window_start)
                DO UPDATE SET request_count = rate_limits.request_count + 1
            """
            execute_query(query, (identifier, endpoint, window_start), fetch=False)

        except Exception as e:
            logger.error(f"Error recording request: {e}")
            # Continue even if recording fails
