import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse
from backend.api import youtube, spotify, transfer, auth
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
backend_dir = Path(__file__).parent.resolve()
load_dotenv(backend_dir / ".env")


# HTTPS redirect middleware for production
class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Only enforce HTTPS in production
        if os.getenv("ENVIRONMENT") == "production":
            # Check if request is HTTP (not HTTPS)
            if request.url.scheme == "http":
                # Redirect to HTTPS
                url = request.url.replace(scheme="https")
                return RedirectResponse(url, status_code=301)
        
        response = await call_next(request)
        return response


tags_metadata = [
    {
        "name": "Authentication",
        "description": "OAuth endpoints for Spotify and YouTube authentication."
    },
    {
        "name": "YouTube",
        "description": "Operations related to importing/exporting playlists from YouTube."
    },
    {
        "name": "Spotify",
        "description": "Endpoints to interact with Spotify"
    },
    {
        "name": "Transfer",
        "description": "Transfer playlists between YouTube and Spotify. This includes creating new playlists, searching for tracks, and adding them to Spotify playlists."
    },
]

app = FastAPI(
    title="Syncwave API",
    description="Transfer playlists from YouTube to Spotify",
    version="1.0.0",
    tags_metadata=tags_metadata,
    openapi_tags=tags_metadata,
)

# Get allowed origins from environment variable or use defaults
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

# Add HTTPS redirect middleware for production
app.add_middleware(HTTPSRedirectMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if os.getenv("ENVIRONMENT") == "production":
    # Extract hostnames from allowed origins
    allowed_hosts = []
    for origin in allowed_origins:
        # Remove http:// or https:// and extract hostname
        hostname = origin.replace("https://", "").replace("http://", "").split(":")[0]
        if hostname and hostname not in allowed_hosts:
            allowed_hosts.append(hostname)
    
    # Add render.com for backend health checks
    if not any("onrender.com" in host for host in allowed_hosts):
        allowed_hosts.append("*.onrender.com")
    
    if allowed_hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(youtube.router, prefix="/youtube", tags=["YouTube"])
app.include_router(spotify.router, prefix="/spotify", tags=["Spotify"])
app.include_router(transfer.router, prefix="/transfer", tags=["Transfer"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Syncwave API"}