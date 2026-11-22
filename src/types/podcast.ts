export interface Podcast {
  id: number | string;
  title: string;
  artist: string;
  feedUrl: string;
  artworkUrl: string;
  primaryGenreName?: string;
  episodeCount?: number;
  releaseDate?: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  duration?: string;
  artworkUrl?: string;
  podcastTitle?: string;
}

export interface PlaybackHistoryItem {
  id: string; // episode id
  episode: Episode;
  position: number; // stopped at position in seconds
  duration: number; // duration in seconds
  progressPercent: number; // 0 - 100
  lastPlayedAt: number; // timestamp in ms
}
