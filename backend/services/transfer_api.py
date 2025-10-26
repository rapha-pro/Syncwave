from googleapiclient.discovery import Resource
import spotipy
import time
from datetime import datetime
from services.youtube_api import (
    get_video_details_from_playlist,  # New function!
    extract_playlist_id
)
from services.spotify_api import (
    api_create_playlist,
    api_process_videos_to_songs,  # New function!
)
from models.transfer import TransferResponse, SongResult
from typing import List
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


def transfer_playlist_api(
    youtube: Resource,
    sp: spotipy.Spotify,
    playlist_url: str,
    playlist_name: str,
    is_public: bool = True,
    description: str = "YouTube Playlist Transfer"
) -> TransferResponse:
    """
    Transfers a YouTube playlist to a new Spotify playlist with complete metadata.

    Args:
        youtube (Resource): Authenticated YouTube API service.
        sp (spotipy.Spotify): Authenticated Spotify client.
        playlist_url (str): The full YouTube playlist URL.
        playlist_name (str): Name for the new Spotify playlist.
        is_public (bool): Visibility of the Spotify playlist.
        description (str): Optional description.

    Returns:
        TransferResponse: Complete transfer results with all metadata.
    """
    
    # Start timing the transfer
    start_time = time.time()
    created_at = datetime.utcnow().isoformat() + "Z"
    
    logger.info(f"Starting playlist transfer: {playlist_name}")
    
    try:
        # Step 1: Extract playlist ID from URL
        logger.info("Extracting playlist ID from URL...")
        playlist_id = extract_playlist_id(playlist_url)
        
        # Step 2: Get detailed YouTube video data
        logger.info("Fetching YouTube video details...")
        youtube_videos = get_video_details_from_playlist(youtube, playlist_id)
        total_songs = len(youtube_videos)
        
        logger.info(f"Found {total_songs} videos in YouTube playlist")
        
        # Step 3: Create Spotify playlist
        logger.info("Creating Spotify playlist...")
        spotify_playlist = api_create_playlist(
            sp,
            name=playlist_name,
            isPublic=is_public,
            description=description
        )
        
        spotify_playlist_id = spotify_playlist["id"]
        spotify_playlist_url = spotify_playlist["external_urls"]["spotify"]
        
        logger.info(f"Created Spotify playlist: {spotify_playlist_url}")
        
        # Step 4: Process videos and search for matches on Spotify
        logger.info("Searching for songs on Spotify and adding to playlist...")
        song_results = api_process_videos_to_songs(sp, youtube_videos, spotify_playlist_id)
        
        # Step 5: Calculate statistics
        successful_songs = [song for song in song_results if song.status == "success"]
        failed_songs = [song for song in song_results if song.status == "failed"]
        
        transferred_songs = len(successful_songs)
        failed_songs_count = len(failed_songs)
        
        # Calculate transfer duration
        end_time = time.time()
        transfer_duration = end_time - start_time
        
        # Calculate additional statistics
        match_rate = (transferred_songs / total_songs * 100) if total_songs > 0 else 0
        processing_time_per_song = transfer_duration / total_songs if total_songs > 0 else 0
        
        # Create success message
        message = f"Successfully transferred {transferred_songs} out of {total_songs} songs ({match_rate:.1f}% match rate)"
        
        # Log final summary
        logger.info("=== TRANSFER COMPLETE ===")
        logger.info(f"Playlist: {playlist_name}")
        logger.info(f"Total songs: {total_songs}")
        logger.info(f"Successfully transferred: {transferred_songs}")
        logger.info(f"Failed to find: {failed_songs_count}")
        logger.info(f"Match rate: {match_rate:.1f}%")
        logger.info(f"Transfer duration: {transfer_duration:.2f}s")
        logger.info(f"Avg time per song: {processing_time_per_song:.2f}s")
        logger.info("========================")
        
        # Return complete response
        return TransferResponse(
            success=True,
            playlist_id=spotify_playlist_id,
            playlist_url=spotify_playlist_url,
            total_songs=total_songs,
            transferred_songs=transferred_songs,
            failed_songs=failed_songs_count,
            songs=song_results,
            transfer_duration=transfer_duration,
            created_at=created_at,
            message=message,
            match_rate=match_rate,
            processing_time_per_song=processing_time_per_song
        )
        
    except Exception as e:
        # Calculate duration even for failed transfers
        end_time = time.time()
        transfer_duration = end_time - start_time
        
        logger.error(f"Transfer failed: {str(e)}")
        
        # Return error response
        return TransferResponse(
            success=False,
            playlist_id="",
            playlist_url="",
            total_songs=0,
            transferred_songs=0,
            failed_songs=0,
            songs=[],
            transfer_duration=transfer_duration,
            created_at=created_at,
            message=f"Transfer failed: {str(e)}",
            match_rate=0.0,
            processing_time_per_song=0.0
        )


# Legacy function for backward compatibility
def transfer_playlist_api_legacy(
    youtube: Resource,
    sp: spotipy.Spotify,
    playlist_url: str,
    playlist_name: str,
    is_public: bool = True,
    description: str = "Youtube Playlist Transfer"
) -> dict:
    """
    Legacy transfer function that returns the old format.
    Use transfer_playlist_api() for new implementations.
    """
    
    # Call the new function
    result = transfer_playlist_api(youtube, sp, playlist_url, playlist_name, is_public, description)
    
    # Convert to legacy format
    matched_titles = [song.title for song in result.songs if song.status == "success"]
    unmatched_titles = [song.title for song in result.songs if song.status == "failed"]
    
    return {
        "matched": matched_titles,
        "unmatched": unmatched_titles,
        "playlist_id": result.playlist_id,
        "playlist_url": result.playlist_url,
        "total_songs": result.total_songs
    }