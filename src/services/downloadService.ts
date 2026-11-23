import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Episode } from '../types/podcast';

const DOWNLOADS_KEY = '@wavecast_downloads';

export interface DownloadedEpisode extends Episode {
  localPath: string;
  fileSize: number;
  downloadedAt: number;
}

const getDownloader = () => NativeModules.PodcastDownloader;
let cachedEmitter: NativeEventEmitter | null = null;
const getEmitter = () => {
  const downloader = getDownloader();
  if (!downloader) return null;
  if (!cachedEmitter) {
    cachedEmitter = new NativeEventEmitter(downloader);
  }
  return cachedEmitter;
};

// In-memory cache for ultra-fast checks
let memoryDownloads: DownloadedEpisode[] = [];

/**
 * Fetch all downloaded episodes from persistent storage
 */
export async function getDownloadedEpisodes(): Promise<DownloadedEpisode[]> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADS_KEY);
    if (raw) {
      memoryDownloads = JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Error reading downloads from AsyncStorage:', error);
  }
  return memoryDownloads;
}

/**
 * Check if a specific episode is downloaded offline
 */
export function isDownloaded(downloads: DownloadedEpisode[], episodeId: string): boolean {
  return downloads.some((item) => String(item.id) === String(episodeId));
}

/**
 * Get the local playable audio URL for an episode, or null if not downloaded
 */
export async function getLocalAudioUrl(episodeId: string): Promise<string | null> {
  const current = await getDownloadedEpisodes();
  const match = current.find((item) => String(item.id) === String(episodeId));
  if (match && match.localPath) {
    return match.localPath.startsWith('file://') ? match.localPath : `file://${match.localPath}`;
  }
  return null;
}

/**
 * Download a podcast episode to device storage for offline playback
 */
export async function downloadEpisode(
  episode: Episode,
  onProgress?: (progress: number) => void
): Promise<DownloadedEpisode> {
  const downloader = getDownloader();
  if (!downloader) {
    throw new Error(
      'New native module detected! Please restart and rebuild your app once using "npx react-native run-android" so Android can compile the offline downloader.'
    );
  }

  const emitter = getEmitter();
  let progressSub: any = null;
  if (onProgress && emitter) {
    progressSub = emitter.addListener('onDownloadProgress', (event: any) => {
      if (event && String(event.episodeId) === String(episode.id)) {
        onProgress(event.progress);
      }
    });
  }

  try {
    const result = await downloader.downloadEpisode(String(episode.id), episode.audioUrl);
    const localPath = result.localPath;
    const fileSize = result.fileSize || 0;

    const downloadedItem: DownloadedEpisode = {
      ...episode,
      localPath,
      fileSize,
      downloadedAt: Date.now(),
    };

    const current = await getDownloadedEpisodes();
    const updated = [downloadedItem, ...current.filter((item) => String(item.id) !== String(episode.id))];
    memoryDownloads = updated;
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));

    return downloadedItem;
  } finally {
    if (progressSub) {
      progressSub.remove();
    }
  }
}

/**
 * Delete a downloaded episode file from device storage and remove from list
 */
export async function deleteDownloadedEpisode(episodeId: string): Promise<DownloadedEpisode[]> {
  const downloader = getDownloader();
  try {
    if (downloader) {
      await downloader.deleteEpisode(String(episodeId));
    }
  } catch (err) {
    console.warn('Error deleting local file:', err);
  }

  const current = await getDownloadedEpisodes();
  const updated = current.filter((item) => String(item.id) !== String(episodeId));
  memoryDownloads = updated;
  await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Delete all downloaded episodes and clear offline cache
 */
export async function clearAllDownloads(): Promise<void> {
  const downloader = getDownloader();
  const current = await getDownloadedEpisodes();
  for (const item of current) {
    try {
      if (downloader) {
        await downloader.deleteEpisode(String(item.id));
      }
    } catch (_) {}
  }
  memoryDownloads = [];
  await AsyncStorage.removeItem(DOWNLOADS_KEY);
}

/**
 * Subscribe to download progress events across the app
 */
export function subscribeToDownloadProgress(
  listener: (episodeId: string, progress: number) => void
): () => void {
  const emitter = getEmitter();
  if (!emitter) return () => {};

  const sub = emitter.addListener('onDownloadProgress', (event: any) => {
    if (event && event.episodeId !== undefined) {
      listener(String(event.episodeId), event.progress);
    }
  });

  return () => {
    sub.remove();
  };
}

/**
 * Format bytes into human-readable size (e.g. 34.2 MB)
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Calculate total storage used by downloads
 */
export function getTotalDownloadsSize(downloads: DownloadedEpisode[]): string {
  const total = downloads.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  return formatBytes(total);
}
