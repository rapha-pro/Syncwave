import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import youtube, spotify, transfer, auth
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
backend_dir = Path(__file__).parent.resolve()
load_dotenv(backend_dir / ".env")


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(youtube.router, prefix="/youtube", tags=["YouTube"])
app.include_router(spotify.router, prefix="/spotify", tags=["Spotify"])
app.include_router(transfer.router, prefix="/transfer", tags=["Transfer"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Syncwave API"}