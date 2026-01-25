# FloTunes

A production-ready full-stack application for seamlessly transferring YouTube playlists to Spotify with intelligent song matching and comprehensive transfer analytics.

![App Preview](./frontend/public/flotunes.png)

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        Auth[Authentication Handler]
        API[API Client]
        State[State Management]
    end
    
    subgraph "Backend (FastAPI)"
        Router[API Router]
        YouTube[YouTube Service]
        Spotify[Spotify Service]
        Transfer[Transfer Engine]
        Match[Song Matching Algorithm]
    end
    
    subgraph "External APIs"
        YT_API[YouTube Data API v3]
        SP_API[Spotify Web API]
    end
    
    subgraph "Data Flow"
        Cache[Response Cache]
        Logs[Transfer Logs]
    end
    
    UI --> Auth
    UI --> API
    API --> Router
    
    Router --> YouTube
    Router --> Spotify
    Router --> Transfer
    
    Transfer --> Match
    YouTube --> YT_API
    Spotify --> SP_API
    
    YouTube --> Cache
    Transfer --> Logs
    
    Match --> |Search Results| Spotify
    Transfer --> |Final Results| API
    API --> |Display Results| UI
```

**Flow Process:**
+ **User interaction** starts at the frontend UI, which handles authentication and communicates with the backend
+ **Backend API Router** receives requests and coordinates between YouTube, Spotify, and Transfer services
+ **External APIs** (YouTube Data API v3 and Spotify Web API) provide the core data and functionality
+ **Transfer Engine** orchestrates the entire process, using the Song Matching Algorithm for intelligent pairing
+ **Data persistence** happens through response caching and comprehensive transfer logging
+ **Results flow back** through the API client to display rich analytics and transfer status to users

## Transfer Sequence Diagram.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant YouTube API
    participant Spotify API
    
    User->>Frontend: Submit playlist URL & details
    Frontend->>Backend: POST /transfer
    
    Backend->>YouTube API: Extract playlist ID
    YouTube API-->>Backend: Playlist metadata
    
    Backend->>YouTube API: Fetch video list
    YouTube API-->>Backend: Video titles & metadata
    
    loop For each video
        Backend->>Backend: Clean & parse title
        Backend->>Spotify API: Search for song
        Spotify API-->>Backend: Search results
        Backend->>Backend: Calculate match confidence
        alt High confidence match
            Backend->>Backend: Add to matched list
        else Low confidence or not found
            Backend->>Backend: Add to failed list
        end
    end
    
    Backend->>Spotify API: Create playlist
    Spotify API-->>Backend: Playlist created
    
    Backend->>Spotify API: Add matched songs
    Spotify API-->>Backend: Songs added
    
    Backend-->>Frontend: Transfer results
    Frontend-->>User: Display results with statistics
```

**Flow:**
+ **User initiates transfer** by submitting YouTube playlist URL and desired Spotify playlist settings
+ **Backend extracts playlist data** from YouTube API, including video metadata, titles, and thumbnails
+ **Intelligent song matching** processes each video through multiple search strategies and confidence scoring
+ **Dual-path processing** separates successfully matched songs from failed matches with detailed error tracking
+ **Spotify playlist creation** and bulk song addition happens efficiently using batch operations
+ **Comprehensive results delivery** includes transfer statistics, individual song status, and performance metrics

------


## Project Structure

```
FloTunes/
FloTunes/
├── backend/
│   ├── api/
│   │   └── transfer.py              # API route handlers
│   ├── services/
│   │   ├── youtube_api.py           # YouTube API integration
│   │   ├── spotify_api.py           # Spotify API integration
│   │   └── transfer_api.py          # Transfer orchestration
│   ├── models/
│   │   └── transfer.py              # Pydantic models
│   ├── credentials/                 # API credentials (gitignored)
│   ├── cache/                       # API response cache
│   └── main.py                      # FastAPI application
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── layout.tsx               # Root layout
│   │   └── get-started/
│   │       └── page.tsx             # Transfer flow page
│   ├── components/
│   │   ├── get-started/             # Transfer flow components
│   │   └── ui/                      # Reusable UI components
│   ├── utils/
│   │   └── api_routes/
│   │       └── api.ts               # API client configuration
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── .gitignore
├── README.md
└── requirements.txt
```

## Core Features

### Intelligent Song Matching
- Multiple search strategies for improved accuracy
- Confidence scoring algorithm
- Support for multi-artist tracks
- Handling of remixes, covers, and alternate versions

### Transfer Analytics
- Real-time progress tracking
- Detailed success/failure reporting
- Performance metrics and timing
- Comprehensive error logging

### User Experience
- Responsive design with dark theme
- GSAP-powered animations
- Form validation and error handling
- Progress visualization


## Contributing
see the [Contributing guide](CONTRIBUTING.md)

## License

This project is proprietary software. All rights reserved. See the [LICENSE](LICENSE) file for details.

For licensing inquiries, please contact: contact@FloTunes.com

## Acknowledgments

- YouTube Data API v3 for playlist data access
- Spotify Web API for playlist creation and management
- Next.js and FastAPI communities for excellent documentation
