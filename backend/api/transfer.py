# backend/api/transfer.py (updated)
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from backend.services.youtube_api import get_authenticated_service_with_token
from backend.services.spotify_api import get_spotify_client_with_token
from backend.services.transfer_api import transfer_playlist_api
from backend.models.transfer import TransferRequest, TransferResponse

router = APIRouter(tags=["Transfer"])

@router.post("/", response_model=TransferResponse)
def transfer_playlist(
    request: TransferRequest,
    spotify_token: Optional[str] = Header(None, alias="X-Spotify-Token"),
    youtube_token: Optional[str] = Header(None, alias="X-YouTube-Token")
) -> TransferResponse:
    """
    Transfers a YouTube playlist to Spotify using the authenticated user's tokens.
    
    This endpoint:
    - Uses the user's OAuth tokens for authentication
    - Extracts all videos from the user's YouTube playlist
    - Searches for each song on Spotify using user's account
    - Creates a new Spotify playlist in user's account
    - Adds found songs to the playlist
    - Returns detailed results for each song
    
    Args:
        request: Transfer request with playlist URL, name, and settings
        spotify_token: User's Spotify access token from header
        youtube_token: User's YouTube access token from header
        
    Returns:
        TransferResponse: Complete transfer results with song details, timing, and statistics
    """
    
    # Validate that we have both tokens
    if not spotify_token:
        raise HTTPException(
            status_code=401, 
            detail="Missing Spotify authentication token. Please reconnect your Spotify account."
        )
    
    if not youtube_token:
        raise HTTPException(
            status_code=401, 
            detail="Missing YouTube authentication token. Please reconnect your YouTube account."
        )
    
    try:
        # Get authenticated services using user's tokens
        youtube = get_authenticated_service_with_token(youtube_token)
        if not youtube:
            raise HTTPException(
                status_code=401, 
                detail="Invalid or expired YouTube token. Please reconnect your YouTube account."
            )
        
        sp = get_spotify_client_with_token(spotify_token)
        if not sp:
            raise HTTPException(
                status_code=401, 
                detail="Invalid or expired Spotify token. Please reconnect your Spotify account."
            )

        # Perform the transfer with user's authenticated services
        result = transfer_playlist_api(
            youtube=youtube,
            sp=sp,
            playlist_url=str(request.playlist_url),
            playlist_name=request.playlist_name,
            is_public=request.is_public,
            description=request.description or "",
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[Transfer] - Error during playlist transfer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")


# Keep your existing health check endpoint
@router.get("/health")
def health_check():
    """Health check endpoint to verify the service is running."""
    return {"status": "healthy", "service": "playlist-transfer"}