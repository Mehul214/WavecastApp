import AsyncStorage from '@react-native-async-storage/async-storage';
import { Podcast, Episode, PlaybackHistoryItem } from '../types/podcast';

const FAVORITES_KEY = '@wavecast_favorites';
const HISTORY_KEY = '@wavecast_playback_history';

// In-memory fallback
let memoryFavorites: Podcast[] = [];
let memoryHistory: PlaybackHistoryItem[] = [];

/**
 * Fetch all favorited podcasts
 */
export async function getFavorites(): Promise<Podcast[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (raw) {
      memoryFavorites = JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Error reading favorites from AsyncStorage:', error);
  }
  return memoryFavorites;
}

/**
 * Check if a podcast is favorited
 */
export function isFavorite(favorites: Podcast[], podcastId: string | number): boolean {
  return favorites.some((item) => String(item.id) === String(podcastId));
}

/**
 * Toggle favorite status of a podcast
 * Returns the updated list of favorites
 */
export async function toggleFavorite(
  podcast: Podcast
): Promise<{ favorites: Podcast[]; isFav: boolean }> {
  try {
    const current = await getFavorites();
    const index = current.findIndex((item) => String(item.id) === String(podcast.id));
    let updated: Podcast[];
    let isFav: boolean;

    if (index >= 0) {
      // Remove from favorites
      updated = current.filter((item) => String(item.id) !== String(podcast.id));
      isFav = false;
    } else {
      // Add to favorites (newest first)
      updated = [podcast, ...current];
      isFav = true;
    }

    memoryFavorites = updated;
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return { favorites: updated, isFav };
  } catch (error) {
    console.warn('Error saving favorite to AsyncStorage:', error);
    return { favorites: memoryFavorites, isFav: false };
  }
}

/**
 * Save reordered list of favorites
 */
export async function saveFavorites(updated: Podcast[]): Promise<Podcast[]> {
  try {
    memoryFavorites = updated;
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Error saving favorites to AsyncStorage:', error);
    return memoryFavorites;
  }
}

/**
 * Fetch listening history ordered by most recently played
 */
export async function getHistory(): Promise<PlaybackHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (raw) {
      memoryHistory = JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Error reading history from AsyncStorage:', error);
  }
  return memoryHistory;
}

/**
 * Save playback position of an episode into history
 */
export async function saveHistory(
  episode: Episode,
  position: number,
  duration: number
): Promise<PlaybackHistoryItem[]> {
  // If position is tiny or invalid, don't record useless 0-second clips
  if (!episode || !episode.id || position <= 1) {
    return memoryHistory;
  }

  try {
    const current = await getHistory();
    const progressPercent = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;

    const newItem: PlaybackHistoryItem = {
      id: episode.id,
      episode,
      position: Math.round(position),
      duration: Math.round(duration),
      progressPercent,
      lastPlayedAt: Date.now(),
    };

    // Filter out existing record for this episode and insert new at the beginning
    const filtered = current.filter((item) => item.id !== episode.id);
    const updated = [newItem, ...filtered].slice(0, 50); // keep max 50 recent items

    memoryHistory = updated;
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Error saving history to AsyncStorage:', error);
    return memoryHistory;
  }
}

/**
 * Remove an item from history
 */
export async function removeHistoryItem(episodeId: string): Promise<PlaybackHistoryItem[]> {
  try {
    const current = await getHistory();
    const updated = current.filter((item) => item.id !== episodeId);
    memoryHistory = updated;
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Error removing history item:', error);
    return memoryHistory;
  }
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  try {
    memoryHistory = [];
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.warn('Error clearing history:', error);
  }
}
