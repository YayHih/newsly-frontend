"""OAuth 2.0 integration for Google authentication"""
from authlib.integrations.starlette_client import OAuth
from config import settings

# Initialize OAuth
oauth = OAuth()

# Register Google OAuth provider
if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'redirect_uri': settings.GOOGLE_REDIRECT_URI
        }
    )
