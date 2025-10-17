"""Configuration management for Newsly Recommendations API"""
import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "localhost")
    DATABASE_PORT: int = int(os.getenv("DATABASE_PORT", "5432"))
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "newsly_recommendations")
    DATABASE_USER: str = os.getenv("DATABASE_USER", "newsly_user")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "newsly_secure_2024")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    # Dell Server Configuration
    DELL_SERVER_HOST: str = os.getenv("DELL_SERVER_HOST", "localhost")
    DELL_SERVER_PORT: int = int(os.getenv("DELL_SERVER_PORT", "3333"))
    DELL_SERVER_API_URL: str = os.getenv("DELL_SERVER_API_URL", "http://localhost:8000")
    DELL_SERVER_DB_HOST: str = os.getenv("DELL_SERVER_DB_HOST", "localhost")
    DELL_SERVER_DB_PORT: int = int(os.getenv("DELL_SERVER_DB_PORT", "5432"))
    DELL_SERVER_DB_NAME: str = os.getenv("DELL_SERVER_DB_NAME", "personalized_news")
    DELL_SERVER_DB_USER: str = os.getenv("DELL_SERVER_DB_USER", "news_user")
    DELL_SERVER_DB_PASSWORD: str = os.getenv("DELL_SERVER_DB_PASSWORD", "campuslens2024")

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    RATE_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_HOUR", "1000"))

    # Cache
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "86400"))

    # Onboarding password
    ONBOARDING_PASSWORD: str = "I like apples"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8002/auth/google/callback")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    @property
    def database_url(self) -> str:
        """Get database connection URL"""
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

    @property
    def dell_database_url(self) -> str:
        """Get Dell server database connection URL"""
        return f"postgresql://{self.DELL_SERVER_DB_USER}:{self.DELL_SERVER_DB_PASSWORD}@{self.DELL_SERVER_DB_HOST}:{self.DELL_SERVER_DB_PORT}/{self.DELL_SERVER_DB_NAME}"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'  # Ignore extra fields from .env


# Initialize settings with overrides
settings = Settings()
# Override CORS_ORIGINS from env if needed
cors_env = os.getenv("CORS_ORIGINS")
if cors_env:
    settings.CORS_ORIGINS = [url.strip() for url in cors_env.split(",")]
