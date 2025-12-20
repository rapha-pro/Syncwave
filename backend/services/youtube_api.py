import os
import json
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build, Resource
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from typing import List
from backend.models.transfer import YouTubeVideo
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


backend_dir = Path(__file__).parent.parent
load_dotenv(backend_dir / ".env")

def get_authenticated_service_with_token(access_token: str) -> Resource:
    """
    Creates a YouTube API service instance using the user's access token.

    Args:
        access_token (str): The user's OAuth access token from frontend

    Returns:
        Resource: Authenticated YouTube API client resource.
    """
    try:
        logger.info(f"[YouTubeAPI] - Creating service with user access token")
        
        # Load client configuration for token refresh capability
        client_secrets_file = backend_dir / os.getenv("YOUTUBE_CLIENT_JSON")
        
        with open(client_secrets_file, 'r') as f:
            client_config = json.load(f)
        
        client_info = client_config.get("web") or client_config.get("installed")
        
        # Create credentials object from the access token
        # Note: For refresh capability, we'd need the refresh token too
        creds = Credentials(
            token=access_token,
            client_id=client_info["client_id"],
            client_secret=client_info["client_secret"],
            token_uri=client_info["token_uri"],
        )
        
        # Test if credentials are valid
        if not creds.valid:
            if creds.expired and creds.refresh_token:
                logger.info("[YouTubeAPI] - Refreshing expired token")
                creds.refresh(Request())
            else:
                logger.info("[YouTubeAPI] - Invalid credentials")
                return None
        
        # Build and return the service
        service = build("youtube", "v3", credentials=creds)
        
        # Test the service with a simple API call
        test_request = service.channels().list(part="id", mine=True, maxResults=1)
        test_request.execute()
        
        logger.info("[YouTubeAPI] - Successfully authenticated with user token")
        return service
        
    except Exception as e:
        logger.info(f"[YouTubeAPI] - Authentication failed: {str(e)}")
        return None


def create_credentials_from_token_data(token_data: dict) -> Credentials:
    """
    Creates Google credentials from token data received from frontend.
    
    Args:
        token_data: Dictionary containing access_token, refresh_token, etc.
    
    Returns:
        Credentials: Google OAuth2 credentials object
    """
    client_secrets_file = backend_dir / os.getenv("YOUTUBE_CLIENT_JSON")
    
    with open(client_secrets_file, 'r') as f:
        client_config = json.load(f)
    
    client_info = client_config.get("web") or client_config.get("installed")
    
    return Credentials(
        token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        client_id=client_info["client_id"],
        client_secret=client_info["client_secret"],
        token_uri=client_info["token_uri"],
        scopes=token_data.get("scope", "").split(" ")
    )


def get_authenticated_service(scopes: list[str] = None) -> Resource:
    """
    Authenticates and returns a YouTube API service instance.

    Args:
        scopes (list[str]): A list of OAuth scopes required for the API access.

    Returns:
        Resource: Authenticated YouTube API client resource.
    """

    if scopes is None:
        scopes = [os.getenv("YOUTUBE_SCOPE")]

    logger.info(f"Using client secrets file: {scopes}, {os.getenv("YOUTUBE_PLAYLIST_URL")}, {os.getenv("YOUTUBE_CLIENT_JSON")}")

    client_secrets_file = backend_dir / os.getenv("YOUTUBE_CLIENT_JSON")
    token_path = backend_dir / "credentials/youtube_token.pickle"
    creds = None


    # Load existing credentials if available
    if os.path.exists(token_path):
        with open(token_path, "rb") as token_file:
            creds = pickle.load(token_file)

    # If no (valid) credentials, authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, scopes)
            creds = flow.run_local_server(port=8080)

        # Save token for next time
        with open(token_path, "wb") as token_file:
            pickle.dump(creds, token_file)

    return build("youtube", "v3", credentials=creds)


def get_video_details_from_playlist(
    youtube: Resource,
    playlist_id: str
) -> List[YouTubeVideo]:
    """
    Fetches detailed video information from a YouTube playlist.

    Args:
        youtube (Resource): Authenticated YouTube API service
        playlist_id (str): The YouTube playlist ID

    Returns:
        List[YouTubeVideo]: List of YouTube videos with full metadata
    """

    cache_dir = Path("cache") / f"youtube_raw_{playlist_id}"
    os.makedirs(cache_dir, exist_ok=True)

    videos = []
    next_page_token = None
    page = 1

    while True:
        request = youtube.playlistItems().list(
            part="snippet",
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token,
        )
        response = request.execute()

        # Save API response for current page in cache dir
        cache_filename = cache_dir / f"page_{page}.json"
        with open(cache_filename, "w", encoding="utf-8") as file:
            json.dump(response, file, indent=4)

        for item in response["items"]:
            snippet = item["snippet"]
            
            # Extract video ID from resourceId
            video_id = snippet["resourceId"]["videoId"]
            
            # Get the best available thumbnail
            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = None
            
            # Prefer higher quality thumbnails
            for quality in ["maxres", "standard", "high", "medium", "default"]:
                if quality in thumbnails:
                    thumbnail_url = thumbnails[quality]["url"]
                    break

            # Create YouTubeVideo object
            video = YouTubeVideo(
                video_id=video_id,
                title=snippet["title"],
                youtube_url=f"https://www.youtube.com/watch?v={video_id}",
                thumbnail_url=thumbnail_url,
                channel_title=snippet.get("channelTitle"),
                video_owner_channel=snippet.get("videoOwnerChannelTitle")
            )
            
            videos.append(video)

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

        page += 1

    return videos


def get_video_titles_from_playlist(
    youtube: Resource,
    playlist_id: str
) -> list[str]:
    """
    Legacy function for backward compatibility.
    Fetches only video titles from a YouTube playlist.
    
    Note: Consider using get_video_details_from_playlist() for richer data.
    """
    videos = get_video_details_from_playlist(youtube, playlist_id)
    return [video.title for video in videos]


def extract_playlist_id(playlist_url: str) -> str:
    """
    Extracts the playlist ID from a full YouTube playlist URL.

    Args:
        playlist_url (str): The full YouTube playlist URL.

    Returns:
        str: The extracted playlist ID.

    Raises:
        ValueError: If the URL does not contain a valid playlist ID.
    """
    parsed = urlparse(playlist_url)
    query = parse_qs(parsed.query)
    playlist_id = query.get("list", [None])[0]
    if not playlist_id:
        raise ValueError("Invalid YouTube playlist URL.")
    
    return playlist_id