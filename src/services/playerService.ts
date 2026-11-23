import TrackPlayer, {
  PlayerCommand,
} from '@rntp/player';
import { Episode } from '../types/podcast';
import { getLocalAudioUrl } from './downloadService';

let isPlayerInitialized = false;

/**
 * Initializes TrackPlayer with full notification controls and background playback capability.
 */
export async function setupAudioPlayer(): Promise<boolean> {
  if (isPlayerInitialized) {
    return true;
  }

  try {
    TrackPlayer.setupPlayer({
      contentType: 'speech',
      handleAudioBecomingNoisy: true,
    });

    TrackPlayer.setCommands({
      capabilities: [
        PlayerCommand.PlayPause,
        PlayerCommand.SkipForward,
        PlayerCommand.SkipBackward,
        PlayerCommand.Seek,
      ],
      forwardInterval: 15,
      backwardInterval: 15,
    });

    isPlayerInitialized = true;
    return true;
  } catch (error: any) {
    console.error('TrackPlayer setup error:', error);
    return false;
  }
}

/**
 * Plays a podcast episode, optionally seeking to a starting position (for resuming history)
 */
export async function playEpisode(episode: Episode, startPosition: number = 0): Promise<void> {
  await setupAudioPlayer();

  // If downloaded, seamlessly play offline local file with 0 buffering
  const localUrl = await getLocalAudioUrl(episode.id);
  const effectiveUrl = localUrl || episode.audioUrl;

  TrackPlayer.setMediaItem({
    mediaId: episode.id,
    url: effectiveUrl,
    title: episode.title,
    artist: episode.podcastTitle || 'Podcast',
    artworkUrl: episode.artworkUrl,
  });

  if (startPosition > 0) {
    TrackPlayer.seekTo(startPosition);
  }

  TrackPlayer.play();
}

/**
 * Toggle between play and pause
 */
export function togglePlayPause(isPlaying: boolean): void {
  if (isPlaying) {
    TrackPlayer.pause();
  } else {
    TrackPlayer.play();
  }
}

/**
 * Jump forward by specified seconds
 */
export function jumpForward(seconds: number = 15): void {
  TrackPlayer.seekBy(seconds);
}

/**
 * Jump backward by specified seconds
 */
export function jumpBackward(seconds: number = 15): void {
  TrackPlayer.seekBy(-seconds);
}

/**
 * Set playback speed
 */
export function setPlaybackSpeed(speed: number): void {
  TrackPlayer.setPlaybackSpeed(speed);
}
