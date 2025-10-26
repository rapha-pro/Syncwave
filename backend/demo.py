import os
from dotenv import load_dotenv
from services.youtube_api import (
    get_authenticated_service,
    get_video_titles_from_playlist, 
    extract_playlist_id
)
from services.spotify_api import (
    get_spotify_client,
    api_create_playlist,
    api_search_track,
    api_add_tracks_to_playlist,
)
from rich.progress import Progress
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from pathlib import Path
from datetime import datetime
import argparse



load_dotenv()
console = Console()

def parse_args():
    parser = argparse.ArgumentParser(description="Transfer YouTube playlist to Spotify")
    parser.add_argument(
        "--playlist",
        type=str,
        default="YT Playlist Transfer",
        help="Name of the Spotify playlist to create or update."
    )
    parser.add_argument("--public", action="store_true", help="Make the Spotify playlist public")
    parser.add_argument("--dry-run", action="store_true", help="Simulate the playlist transfer without modifying Spotify, just show stats")

    return parser.parse_args()


def main():
    # Setup
    args = parse_args()
    playlist_name = args.playlist
    is_public = args.public
    dry_run = args.dry_run

    yt_url = os.getenv("YOUTUBE_PLAYLIST_URL")
    playlist_id = extract_playlist_id(yt_url)

    console.rule("[bold cyan]YT → Spotify Playlist Transfer")
    log_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Step 1: Get YouTube Titles
    console.print("[bold yellow] Fetching video titles from YouTube...")
    youtube = get_authenticated_service()
    if not youtube:
        console.print("[bold red]❌ Failed to authenticate with YouTube. Check your credentials.[/bold red]")
        return
    titles = get_video_titles_from_playlist(youtube, playlist_id)
    console.print(f"[green]> {len(titles)} titles fetched!\n")

    # Step 2: Spotify Auth
    sp = get_spotify_client()
    if not sp:
        console.print("[bold red]❌ Failed to authenticate with Spotify. Check your credentials.[/bold red]")
        return
    playlist_description = f"{playlist_name} created on {log_timestamp}"
    spotify_playlist_json = api_create_playlist(sp, name=playlist_name, isPublic=is_public, description=playlist_description)
    spotify_playlist_id = spotify_playlist_json.get("id", None)

    console.print(f"[bold yellow]🎵 Using Spotify playlist: [bold underline]{playlist_name}\n")


    # Step 3: Search & Match tracks
    track_ids = []
    unmatched_titles = []

    # Create the Log directory if it does not exist
    backend_dir = Path(__file__).parent.resolve()
    log_dir = backend_dir / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    unmatched_file = log_dir / f"unmatched_songs_for_{playlist_name.replace(' ', '_')}.txt"

    console.print("[cyan] Searching for tracks on Spotify...\n")

    with Progress() as progress:
        task = progress.add_task("Matching tracks...", total=len(titles))
        for title in titles:
            track_id = api_search_track(sp, title)
            if track_id:
                track_ids.append(track_id)
            else:
                unmatched_titles.append(title)
            progress.update(task, advance=1)

    # Step 4: Report Unmatched tracks
    if unmatched_titles:
        with open(unmatched_file, "w", encoding="utf-8") as f:
            for title in unmatched_titles:
                f.write(f"{title}\n")
        console.print(
            Panel.fit(
                f"[red]⚠️ {len(unmatched_titles)} song(s) could not be matched.\nSaved to: {unmatched_file}",
                title="Unmatched Songs",
                style="bold red",
            )
        )
    else:
        console.print("[green]All songs matched successfully!")


    # Step 5: Add Tracks
    if dry_run:
        console.print("\n[bold yellow]➕ Dry run: Adding tracks to Spotify playlist...")
    else:
        if not spotify_playlist_id:
            console.print("[bold red]❌ Playlist ID not found. Cannot add tracks.[/bold red]")
            return
        if not track_ids:
            console.print("[bold red]❌ No tracks to add. Playlist is empty.[/bold red]")
        else:
            console.print("\n[bold yellow]➕ Adding tracks to Spotify playlist...")
            api_add_tracks_to_playlist(sp, spotify_playlist_id, track_ids)
    console.print("[bold green]🎉 Playlist transfer complete!")


    # Step 6: Summary (on Terminal)
    external_link_to_user_playlist = spotify_playlist_json['external_urls']['spotify'] or "Not available"

    console.print("\n[bold blue]Transfer Summary:\n")

    summary_table = Table(title="Playlist Transfer Stats", style="bold white")
    summary_table.add_column("Metric", style="cyan", no_wrap=True)
    summary_table.add_column("Value", style="bold yellow")

    summary_table.add_row("• Playlist Name", playlist_name)
    summary_table.add_row("• Spotify Playlist ID", spotify_playlist_id or "Not created")
    summary_table.add_row("• Link to Spotify playlist", external_link_to_user_playlist)
    summary_table.add_row("• Total YouTube Videos", str(len(titles)))
    summary_table.add_row("• Matched on Spotify", str(len(track_ids)))
    summary_table.add_row("• Unmatched", str(len(unmatched_titles)))

    console.print(summary_table)
    console.rule("[bold green]✅ All Done!")

    # 6b: Save stats to log file
    log_file = log_dir / f"{playlist_name.replace(' ', '_')}_log.txt"

    with log_file.open("a", encoding="utf-8") as f:
        f.write("=== Playlist Transfer Summary ===\n")
        f.write(f"Playlist Name, {playlist_name}\n")
        f.write(f"Playlist ID: {spotify_playlist_id or 'Not created'}\n")
        f.write(f"Link to Spotify playlist: {external_link_to_user_playlist}\n")
        f.write(f"Total YouTube Videos: {len(titles)}\n")
        f.write(f"Matched on Spotify: {len(track_ids)}\n")
        f.write(f"Unmatched: {len(unmatched_titles)}\n")
        f.write(f"Log Time: {log_timestamp}\n")
        f.write("=" * 33 + "\n\n")



if __name__ == "__main__":
    main()
