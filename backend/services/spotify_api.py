import os
import re
import spotipy
from rich import print
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any, Tuple
from backend.models.transfer import SpotifyTrack, YouTubeVideo, SongResult
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

load_dotenv()


def get_spotify_client_with_token(access_token: str) -> spotipy.Spotify:
    """
    Creates a Spotipy client instance using the user's access token.

    Args:
        access_token (str): The user's Spotify access token from frontend

    Returns:
        spotipy.Spotify: Authenticated Spotify client using user's token.
    """
    try:
        logger.info(f"[SpotifyAPI] - Creating client with user access token")
        
        # Create Spotify client with user's access token
        sp = spotipy.Spotify(auth=access_token)
        
        # Test the token by getting current user info
        try:
            user_info = sp.current_user()
            logger.info(f"[SpotifyAPI] - Successfully authenticated user: {user_info['display_name']} ({user_info['id']})")
            return sp
        except Exception as e:
            logger.info(f"[SpotifyAPI] - Token validation failed: {str(e)}")
            return None
            
    except Exception as e:
        logger.info(f"[SpotifyAPI] - Failed to create Spotify client: {str(e)}")


def get_spotify_client(scope: str = None) -> spotipy.Spotify:
    """
    Authenticates and returns a Spotipy client instance.

    Args:
        scope (str): The Spotify OAuth scopes as a space-separated string.

    Returns:
        spotipy.Spotify: Authenticated Spotify client.
    """

    if scope is None:
        scope = os.getenv("SPOTIFY_SCOPE")

    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope=scope
    ))

    return sp


def api_get_existing_playlist_id(sp: spotipy.Spotify, user_id: str, name: str) -> str | None:
    """
    Checks if a playlist with the given name already exists.

    Args:
        sp (spotipy.Spotify): Authenticated Spotify client.
        user_id (str): id of the user
        name (str): The name of the playlist to look for.

    Returns:
        str | None: The ID of the playlist if found, otherwise None.
    """

    user_id = sp.me()["id"]
    limit = 10
    offset = 0

    while True:
        playlists = sp.current_user_playlists(limit=limit, offset=offset)
        for playlist in playlists["items"]:
            if playlist["name"].lower() == name.lower() and playlist["owner"]["id"] == user_id:
                return playlist["id"]

        if playlists["next"]:
            offset += limit
        else:
            break

    return None


def api_create_playlist(sp: spotipy.Spotify, name: str, isPublic: bool = True, description: str = "") -> Dict[str, Any]:
    """
    Creates a new playlist or reuses existing one with same name.

    Args:
        sp (spotipy.Spotify): The authenticated Spotify client.
        name (str): The name of the playlist.
        isPublic (bool): access level of the playlist
        description (str): (Optional) Description for the playlist.

    Returns:
        Dict[str, Any]: Complete playlist object with id, url, etc.
    """

    user_id = sp.me()["id"] 
    existing_id = api_get_existing_playlist_id(sp, user_id, name)
    
    if existing_id:
        print(f"[bold yellow]Playlist '{name}' already exists. Using existing playlist.[/bold yellow]\n")
        # Get the full playlist object
        playlist = sp.playlist(existing_id)
        return playlist

    # Create the playlist
    new_playlist = sp.user_playlist_create(user=user_id, name=name, public=isPublic, description=description)
    return new_playlist


def generate_smart_search_queries(youtube_title: str) -> List[str]:
    """
    Generate intelligent search queries from YouTube title by cleaning and splitting.
    
    This function takes a messy YouTube title like:
    "Tasha Cobbs - You Still Love Me [Official Video] (Bass Boosted)"
    
    And generates multiple search strategies:
    1. "Tasha Cobbs - You still Love Me [Official Video] (Bass Boosted)"  # Original
    2. "Tasha Cobbs - You still Love Me"  # Cleaned version
    3. "Tasha Cobbs You still Love Me"    # Artist + song format
    4. "You still Love Me"                # Just song name
    
    Args:
        youtube_title (str): The original YouTube video title
        
    Returns:
        List[str]: List of search queries ordered by likelihood of success
    """
    
    queries = []
    title = youtube_title.strip()
    
    # 1. Always try the original title first
    queries.append(title)
    
    # 2. Remove common YouTube noise patterns
    noise_patterns = [
        r'\[.*?\]',              # [Official Video], [HD], [Lyrics]
        r'\(.*?\)',              # (Official Video), (Lyrics), (Bass Boosted)
        r'【.*?】',               # Japanese/Chinese brackets
        r'\s*-\s*official.*',    # - Official Video, - Official Audio
        r'\s*-\s*lyrics?.*',     # - Lyrics, - Lyric Video
        r'\s*(bass\s*boosted|nightcore|remix|cover|acoustic|live).*',  # Modifications
        r'\s*\|\s*.*',           # Everything after pipe |
        r'\s*ft\.?\s*.*',        # Remove featuring artists for cleaner search
        r'\s*feat\.?\s*.*',      # Remove featuring artists
        r'\s*featuring\s*.*',    # Remove featuring artists
    ]
    
    clean_title = title
    for pattern in noise_patterns:
        clean_title = re.sub(pattern, '', clean_title, flags=re.IGNORECASE)
    
    clean_title = clean_title.strip()
    if clean_title and clean_title != title:
        queries.append(clean_title)
    
    # 3. Try different splitting strategies
    separators = [' - ', ' – ', ' — ', ' | ', ' • ', ': ']
    
    for sep in separators:
        if sep in title:
            parts = title.split(sep, 1)  # Only split on first occurrence
            if len(parts) >= 2:
                artist_part = parts[0].strip()
                song_part = parts[1].strip()
                
                # Clean the song part of noise
                for pattern in noise_patterns:
                    song_part = re.sub(pattern, '', song_part, flags=re.IGNORECASE)
                song_part = song_part.strip()
                
                if artist_part and song_part:
                    # Try "artist song" format (no separator)
                    artist_song = f"{artist_part} {song_part}"
                    queries.append(artist_song)
                    
                    # Try just the song name
                    queries.append(song_part)
                    
                    # Try just the artist name
                    queries.append(artist_part)
            break
    
    # 4. Remove duplicates while preserving order
    seen = set()
    unique_queries = []
    for query in queries:
        if query.lower() not in seen and len(query.strip()) > 2:  # Minimum length check
            seen.add(query.lower())
            unique_queries.append(query)
    
    return unique_queries


def calculate_match_confidence(youtube_title: str, spotify_track: Dict[str, Any]) -> float:
    """
    Calculate confidence score (0.0 to 1.0) for how well a Spotify track matches a YouTube title.
    
    This function analyzes multiple factors:
    - Does the song name appear in the YouTube title?
    - Does any artist name appear in the YouTube title?
    - Are there negative indicators (remix, cover, etc.)?
    
    Example:
    YouTube: "Tasha Cobbs - You Still Love Me [Official Video]"
    Spotify: {"name": "You Still Love Me", "artists": [{"name": "Tasha Cobbs"}]}
    Result: ~0.9 confidence (high match)
    
    YouTube: "You Still Love Me (Piano Cover)"
    Spotify: {"name": "You Still Love Me", "artists": [{"name": "Tasha Cobbs"}]}
    Result: ~0.3 confidence (low match - it's a cover)
    
    Args:
        youtube_title (str): Original YouTube video title
        spotify_track (Dict[str, Any]): Spotify track object from API
        
    Returns:
        float: Confidence score between 0.0 and 1.0
    """
    
    confidence = 0.0
    youtube_lower = youtube_title.lower()
    
    # Get Spotify track data
    spotify_name = spotify_track["name"].lower()
    spotify_artists = [artist["name"].lower() for artist in spotify_track["artists"]]
    spotify_album = spotify_track["album"]["name"].lower()
    
    # 1. Song name matching (40% weight)
    if spotify_name in youtube_lower:
        # Exact match gets full points
        confidence += 0.4
    else:
        # Partial matching - check if significant words match
        spotify_words = set(spotify_name.split())
        youtube_words = set(youtube_lower.split())
        common_words = spotify_words.intersection(youtube_words)
        
        if common_words and len(common_words) >= len(spotify_words) * 0.6:
            # If 60%+ of song title words match
            confidence += 0.3
    
    # 2. Artist matching (35% weight)
    artist_match_score = 0.0
    for artist in spotify_artists:
        if artist in youtube_lower:
            artist_match_score = 0.35
            break
        else:
            # Check partial artist name matching
            artist_words = set(artist.split())
            youtube_words = set(youtube_lower.split())
            if artist_words.intersection(youtube_words):
                artist_match_score = max(artist_match_score, 0.15)
    
    confidence += artist_match_score
    
    # 3. Album name bonus (10% weight)
    if spotify_album in youtube_lower:
        confidence += 0.1
    
    # 4. Negative indicators - penalize covers, remixes, etc.
    negative_indicators = [
        ('cover', -0.2),          # Strong penalty for covers
        ('remix', -0.2),          # Medium penalty for remixes
        ('acoustic', -0.15),      # Medium penalty for acoustic versions
        ('live', -0.15),          # Medium penalty for live versions
        ('instrumental', -0.25),  # Strong penalty for instrumentals
        ('karaoke', -0.3),        # Strong penalty for karaoke
        ('bass boosted', -0.2),   # Medium penalty for bass boosted
        ('nightcore', -0.25),     # Strong penalty for nightcore
        ('slowed', -0.2),         # Medium penalty for slowed versions
        ('8d audio', -0.2),       # Medium penalty for 8D audio
        ('piano', -0.1),          # Small penalty if "piano" appears
    ]
    
    for indicator, penalty in negative_indicators:
        if indicator in youtube_lower:
            confidence += penalty  # penalty is negative, so this reduces confidence
    
    # 5. Positive indicators - bonus for official content
    positive_indicators = [
        ('official', 0.1),        # Bonus for official content
        ('audio', 0.05),          # Small bonus for audio versions
        ('music video', 0.05),    # Small bonus for music videos
    ]
    
    for indicator, bonus in positive_indicators:
        if indicator in youtube_lower:
            confidence += bonus
    
    # 6. Length similarity bonus (5% weight)
    # If the YouTube title is roughly the same length as "Artist - Song", it's probably cleaner
    expected_length = len(spotify_artists[0]) + len(spotify_name) + 3  # +3 for " - "
    actual_length = len(youtube_title)
    
    if 0.7 <= actual_length / expected_length <= 1.5:  # Within reasonable range
        confidence += 0.05
    
    # Ensure confidence is between 0.0 and 1.0
    return max(0.0, min(1.0, confidence))


def create_artist_string(artists: List[Dict[str, Any]]) -> str:
    """
    Create a proper artist string from Spotify artists array.
    
    Examples:
    - Single artist: "Tasha Cobbs"
    - Two artists: "Cece Winans X feat. Tasha Cobbs"
    - Multiple artists: "Tasha Cobbs feat. Cece Winans & Nathaniel Bassey"
    
    Args:
        artists (List[Dict[str, Any]]): Spotify artists array
        
    Returns:
        str: Formatted artist string
    """
    
    if not artists:
        return "Unknown Artist"
    
    if len(artists) == 1:
        return artists[0]["name"]
    
    primary_artist = artists[0]["name"]
    featured_artists = [artist["name"] for artist in artists[1:]]
    
    if len(featured_artists) == 1:
        return f"{primary_artist} feat. {featured_artists[0]}"
    else:
        featured_string = " & ".join(featured_artists)
        return f"{primary_artist} feat. {featured_string}"


def api_search_track_detailed(sp: spotipy.Spotify, youtube_video: YouTubeVideo) -> Optional[SpotifyTrack]:
    """
    Enhanced search for a song on Spotify using YouTube video data with confidence scoring.
    
    This function:
    1. Generates multiple smart search queries from the YouTube title
    2. Searches Spotify with each query (gets multiple results, not just 1)
    3. Calculates confidence scores for each match
    4. Returns the best match above a minimum confidence threshold
    
    Args:
        sp (spotipy.Spotify): The authenticated Spotify client.
        youtube_video (YouTubeVideo): YouTube video metadata for searching.

    Returns:
        Optional[SpotifyTrack]: Best matching Spotify track if found with sufficient confidence, else None.
    """
    
    # Generate smart search queries
    search_queries = generate_smart_search_queries(youtube_video.title)
    
    best_match = None
    best_confidence = 0.0
    minimum_confidence = 0.6  # Only accept matches with 60%+ confidence
    
    print(f"[cyan]Searching for: {youtube_video.title}[/cyan]")
    print(f"[dim]Search strategies: {search_queries[:3]}...[/dim]")  # Show first 3
    
    for query_index, query in enumerate(search_queries):
        try:
            # Search Spotify - get multiple results for better matching
            results = sp.search(q=query, limit=10, type="track")  # Get top 10 instead of 1
            tracks = results.get('tracks', {}).get('items', [])
            
            if not tracks:
                continue
            
            # Evaluate each track from this search
            for track in tracks:
                confidence = calculate_match_confidence(youtube_video.title, track)
                
                # Debug logging for first few tracks
                if query_index == 0:  # Only log for first query to avoid spam
                    track_name = track["name"]
                    artist_name = track["artists"][0]["name"]
                    print(f"[dim]  → {artist_name} - {track_name} (confidence: {confidence:.2f})[/dim]")
                
                # Keep track of the best match
                if confidence > best_confidence and confidence >= minimum_confidence:
                    best_confidence = confidence
                    best_match = track
                    
                    # If we found a very high confidence match, stop searching
                    if confidence >= 0.9:
                        print(f"[green] High confidence match found: {confidence:.2f}[/green]")
                        break
            
            # If we found a very high confidence match, stop all searches
            if best_confidence >= 0.9:
                break
                
        except Exception as e:
            print(f"[red]Search failed for query '{query}': {e}[/red]")
            continue
    
    if best_match:
        # Extract thumbnail (album art) - prefer larger images
        thumbnail_url = None
        if best_match["album"]["images"]:
            # Images are sorted by size (largest first)
            thumbnail_url = best_match["album"]["images"][0]["url"]
        
        # Create SpotifyTrack object with all the rich data
        spotify_track = SpotifyTrack(
            track_id=best_match["id"],
            name=best_match["name"],
            artist=create_artist_string(best_match["artists"]),  # Handles multiple artists
            album=best_match["album"]["name"],
            spotify_url=best_match["external_urls"]["spotify"],
            thumbnail_url=thumbnail_url,
            preview_url=best_match.get("preview_url")  # 30-second preview URL
        )
        
        artist_name = best_match["artists"][0]["name"]
        print(f"[green]✅ Found: {artist_name} - {best_match['name']} (confidence: {best_confidence:.2f})[/green]")
        
        return spotify_track
    else:
        print(f"[red]❌ No match found above {minimum_confidence} confidence threshold[/red]")
        return None


def api_process_videos_to_songs(
    sp: spotipy.Spotify,
    youtube_videos: List[YouTubeVideo],
    playlist_id: str
) -> List[SongResult]:
    """
    Process all YouTube videos, search for them on Spotify, and create detailed song results.
    
    This is the main orchestrator function that:
    1. Takes a list of YouTube videos from a playlist
    2. For each video, tries to find a matching song on Spotify
    3. Creates a SongResult object with all the metadata
    4. Batches successful Spotify track IDs and adds them to the playlist
    5. Returns a complete list of results for the frontend
    
    Args:
        sp (spotipy.Spotify): The authenticated Spotify client.
        youtube_videos (List[YouTubeVideo]): List of YouTube videos to process.
        playlist_id (str): Spotify playlist ID where successful matches will be added.

    Returns:
        List[SongResult]: Complete list of song results with success/failure status and metadata.
    """
    
    song_results = []
    successful_track_ids = []
    
    total_videos = len(youtube_videos)
    print(f"[bold blue] Processing {total_videos} videos...[/bold blue]")
    
    for index, youtube_video in enumerate(youtube_videos):
        print(f"\n[bold] [{index + 1}/{total_videos}][/bold]")
        
        # Search for the track on Spotify using our enhanced search
        spotify_track = api_search_track_detailed(sp, youtube_video)
        
        if spotify_track:
            # ✅ SUCCESS - Found matching song on Spotify
            successful_track_ids.append(spotify_track.track_id)
            
            song_result = SongResult(
                id=f"song_{index}",
                title=spotify_track.name,                    # Clean Spotify title
                artist=spotify_track.artist,                 # Formatted artist string
                album=spotify_track.album,                   # Album name
                thumbnail=spotify_track.thumbnail_url,       # Album artwork
                status="success",
                spotify_url=spotify_track.spotify_url,       # Individual track URL
                youtube_url=youtube_video.youtube_url,       # Original YouTube URL
                original_youtube_title=youtube_video.title,  # Original messy title
                spotify_match_confidence=0.8  # Could store actual confidence from search
            )
            
        else:
            # ❌ FAILED - Not found on Spotify
            song_result = SongResult(
                id=f"song_{index}",
                title=youtube_video.title,                   # Keep original YouTube title
                artist="Unknown Artist",                     # No Spotify data available
                thumbnail=youtube_video.thumbnail_url,       # Use YouTube thumbnail
                status="failed",
                youtube_url=youtube_video.youtube_url,       # Original YouTube URL
                error="Song not found on Spotify or confidence too low",
                original_youtube_title=youtube_video.title
            )
        
        song_results.append(song_result)
    
    # Batch add all successful tracks to the Spotify playlist
    if successful_track_ids:
        print(f"\n[bold green]Adding {len(successful_track_ids)} tracks to playlist...[/bold green]")
        api_add_tracks_to_playlist(sp, playlist_id, successful_track_ids)
        print(f"[green]Successfully added tracks to playlist![/green]")
    else:
        print(f"[yellow]⚠️ No tracks to add to playlist[/yellow]")
    
    # Summary
    successful_count = len(successful_track_ids)
    failed_count = total_videos - successful_count
    success_rate = (successful_count / total_videos * 100) if total_videos > 0 else 0
    
    print(f"\n[bold]PROCESSING COMPLETE[/bold]")
    print(f"[green]Successful matches: {successful_count}[/green]")
    print(f"[red]Failed matches: {failed_count}[/red]")
    print(f"[blue]Success rate: {success_rate:.1f}%[/blue]")
    
    return song_results


# Legacy functions for backward compatibility
def api_search_track(sp: spotipy.Spotify, title: str) -> str | None:
    """
    Legacy function for backward compatibility.
    Searches for a song on Spotify using a given title.

    Args:
        sp (spotipy.Spotify): The authenticated Spotify client.
        title (str): The YouTube video title to search for.

    Returns:
        str | None: The Spotify track ID if found, else None.
    """

    results = sp.search(q=title, limit=1, type="track")
    tracks = results.get('tracks', {}).get('items', [])
    if tracks:
        return tracks[0]['id']

    return None


def api_add_tracks_to_playlist(sp: spotipy.Spotify, playlist_id: str, track_ids: list[str]) -> None:
    """
    Adds a list of track IDs to a specified Spotify playlist in batches.

    Args:
        sp (spotipy.Spotify): The authenticated Spotify client.
        playlist_id (str): The ID of the target playlist.
        track_ids (list[str]): A list of Spotify track IDs to add.
    """

    # Remove duplicates and None values
    track_ids = list(filter(None, set(track_ids)))

    # Add in batches of 100 (Spotify API limit)
    for i in range(0, len(track_ids), 100):
        batch = track_ids[i:i + 100]
        sp.playlist_add_items(playlist_id, batch)

    return


def api_add_tracks_from_titles(
    sp: spotipy.Spotify,
    playlist_id: str,
    titles: list[str]
) -> dict:
    """
    Legacy function for backward compatibility.
    Searches for each title and adds matching tracks to the playlist.

    Args:
        sp (spotipy.Spotify): The authenticated Spotify client.
        playlist_id (str): The Spotify playlist ID.
        titles (list[str]): List of song titles to search for and add.

    Returns:
        dict: Summary with added track IDs and unmatched titles.
    """
    track_ids = []
    unmatched_titles = []

    for title in titles:
        track_id = api_search_track(sp, title)
        if track_id:
            track_ids.append(track_id)
        else:
            unmatched_titles.append(title)

    if track_ids:
        api_add_tracks_to_playlist(sp, playlist_id, track_ids)

    return {
        "matched": track_ids,
        "unmatched": unmatched_titles
    }