# backend/api/auth.py

import os
import requests
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import json
from typing import Dict, Any
from dotenv import load_dotenv
from pathlib import Path

from backend.models.oauth import (
    OAuthCallbackRequest, 
    SpotifyTokenResponse, 
    YouTubeTokenResponse,
    UserInfo,
    OAuthError
)

import logging

# Setup a logger instance for this module
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add a basic console handler
console_handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)

# Add handler only if not already added
if not logger.handlers:
    logger.addHandler(console_handler)


router = APIRouter()
backend_dir = Path(__file__).parent.parent.resolve()
load_dotenv(backend_dir / ".env")

@router.post("/spotify/callback", response_model=SpotifyTokenResponse)
async def spotify_oauth_callback(request: OAuthCallbackRequest):
    """
    Exchange Spotify authorization code for access token

    Args:
        request: OAuthCallbackRequest containing the authorization code and redirect URI.
    Returns:
        SpotifyTokenResponse: Contains the access token, refresh token, user info, and other details
    """
    try:
        logger.info(f"[SpotifyOAuth] - Received callback request: code={request.code[:10]}..., redirect_uri={request.redirect_uri}")
        
        # Spotify token exchange endpoint
        token_url = "https://accounts.spotify.com/api/token"
        
        # Prepare token exchange data
        token_data = {
            "grant_type": "authorization_code",
            "code": request.code,
            "redirect_uri": request.redirect_uri,
            "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
            "client_secret": os.getenv("SPOTIFY_CLIENT_SECRET"),
        }
        
        logger.info(f"[SpotifyOAuth] - Exchanging code for token with Spotify")
        
        # Exchange code for token
        response = requests.post(token_url, data=token_data)
        
        if not response.ok:
            error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
            logger.error(f"[SpotifyOAuth] - Token exchange failed: {response.status_code}, {error_data}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Spotify token exchange failed: {error_data.get('error_description', response.text)}"
            )
        
        token_response = response.json()
        logger.info(f"[SpotifyOAuth] - Token exchange successful")
        
        # Get user info using the access token
        user_info = None
        try:
            user_response = requests.get(
                "https://api.spotify.com/v1/me",
                headers={"Authorization": f"Bearer {token_response['access_token']}"}
            )
            if user_response.ok:
                user_data = user_response.json()
                user_info = {
                    "id": user_data["id"],
                    "name": user_data["display_name"],
                    "email": user_data.get("email"),
                    "image": user_data["images"][0]["url"] if user_data["images"] else None,
                    "platform": "spotify"
                }
                logger.info(f"[SpotifyOAuth] - Retrieved user info for: {user_info['name']}")
        except Exception as e:
            logger.error(f"[SpotifyOAuth] - Failed to get user info: {e}")
        
        return SpotifyTokenResponse(
            access_token=token_response["access_token"],
            refresh_token=token_response.get("refresh_token"),
            expires_in=token_response["expires_in"],
            token_type=token_response["token_type"],
            scope=token_response["scope"],
            user_info=user_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SpotifyOAuth] - Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth callback failed: {str(e)}"
        )

@router.post("/youtube/callback", response_model=YouTubeTokenResponse)
async def youtube_oauth_callback(request: OAuthCallbackRequest):
    """
    Exchange Google/YouTube authorization code for access token
    Args:
        request: OAuthCallbackRequest containing the authorization code and redirect URI.
    Returns:
        YouTubeTokenResponse: Contains the access token, refresh token, user info, and other
    """
    try:
        logger.info(f"[YouTubeOAuth] - Received callback request: code={request.code[:10]}..., redirect_uri={request.redirect_uri}")
        
        # Load Google client secrets (resolve relative paths to backend_dir)
        google_secrets_env = os.getenv("YOUTUBE_CLIENT_JSON")
        if not google_secrets_env:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google client secrets file not configured"
            )

        client_json_path = Path(google_secrets_env)
        if not client_json_path.is_absolute():
            client_json_path = backend_dir / client_json_path

        if not client_json_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google client secrets file not found: {client_json_path}"
            )

        with open(client_json_path, 'r', encoding='utf-8') as f:
            google_secrets = json.load(f)
        
        client_info = google_secrets.get("web") or google_secrets.get("installed")
        if not client_info:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid Google client secrets format"
            )
        
        # Google token exchange endpoint
        token_url = "https://oauth2.googleapis.com/token"
        
        # Prepare token exchange data
        token_data = {
            "grant_type": "authorization_code",
            "code": request.code,
            "redirect_uri": request.redirect_uri,
            "client_id": client_info["client_id"],
            "client_secret": client_info["client_secret"],
        }
        
        logger.info(f"[YouTubeOAuth] - Exchanging code for token with Google")
        
        # Exchange code for token
        response = requests.post(token_url, data=token_data)
        
        if not response.ok:
            error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
            logger.error(f"[YouTubeOAuth] - Token exchange failed: {response.status_code}, {error_data}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token exchange failed: {error_data.get('error_description', response.text)}"
            )
        
        token_response = response.json()
        logger.info(f"[YouTubeOAuth] - Token exchange successful")
        
        # Get user info using the access token
        user_info = None
        try:
            user_response = requests.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token_response['access_token']}"}
            )
            if user_response.ok:
                user_data = user_response.json()
                user_info = {
                    "id": user_data["id"],
                    "name": user_data["name"],
                    "email": user_data.get("email"),
                    "image": user_data.get("picture"),
                    "platform": "youtube"
                }
                logger.info(f"[YouTubeOAuth] - Retrieved user info for: {user_info['name']}")
        except Exception as e:
            logger.error(f"[YouTubeOAuth] - Failed to get user info: {e}")
        
        return YouTubeTokenResponse(
            access_token=token_response["access_token"],
            refresh_token=token_response.get("refresh_token"),
            expires_in=token_response["expires_in"],
            token_type=token_response["token_type"],
            scope=token_response["scope"],
            user_info=user_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[YouTubeOAuth] - Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth callback failed: {str(e)}"
        )

@router.get("/status")
async def auth_status():
    """
    Check if OAuth credentials are configured correctly
    """
    try:
        status_info = {
            "spotify_configured": bool(os.getenv("SPOTIFY_CLIENT_ID") and os.getenv("SPOTIFY_CLIENT_SECRET")),
            "youtube_configured": bool(os.getenv("YOUTUBE_CLIENT_JSON") and os.path.exists(os.getenv("YOUTUBE_CLIENT_JSON", ""))),
            "message": "OAuth configuration status"
        }
        
        logger.info(f"[AuthStatus] - Configuration check: {status_info}")
        return status_info
        
    except Exception as e:
        logger.error(f"[AuthStatus] - Error checking status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check auth status: {str(e)}"
        )