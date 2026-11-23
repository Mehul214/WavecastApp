import { XMLParser } from 'fast-xml-parser';
import { Podcast, Episode } from '../types/podcast';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

/**
 * Searches podcasts using Apple iTunes Search API (Free, no key required)
 */
export async function searchPodcasts(term: string, limit: number = 25): Promise<Podcast[]> {
  try {
    const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(
      term
    )}&media=podcast&entity=podcast&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.statusText}`);
    }
    const data = await response.json();
    return (data.results || [])
      .filter((item: any) => item.feedUrl)
      .map((item: any) => ({
        id: item.collectionId,
        title: item.collectionName || 'Untitled Podcast',
        artist: item.artistName || 'Unknown Host',
        feedUrl: item.feedUrl,
        artworkUrl: item.artworkUrl600 || item.artworkUrl100 || '',
        primaryGenreName: item.primaryGenreName,
        episodeCount: item.trackCount,
        releaseDate: item.releaseDate,
      }));
  } catch (error) {
    console.error('Error searching podcasts:', error);
    return [];
  }
}

/**
 * Strips HTML tags and unescapes common entities from descriptions
 */
function cleanDescription(rawHtml: string = ''): string {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (_match, url, text) => {
      const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
      return cleanText ? `${cleanText}: ${url}` : url;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Formats duration from raw string or seconds to HH:MM:SS or MM:SS
 */
function formatDuration(rawDuration: any): string {
  if (!rawDuration) return '';
  if (typeof rawDuration === 'string' && rawDuration.includes(':')) {
    return rawDuration;
  }
  const totalSeconds = parseInt(rawDuration, 10);
  if (isNaN(totalSeconds)) return '';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Fetches and parses an RSS feed to extract podcast episodes
 */
export async function fetchEpisodes(
  feedUrl: string,
  fallbackArtwork?: string,
  podcastTitle?: string
): Promise<Episode[]> {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
      parseTagValue: false,
    });

    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel || parsed?.feed || {};

    const rawItems = channel.item || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems].filter(Boolean);

    const channelArtwork =
      channel['itunes:image']?.['@_href'] ||
      channel.image?.url ||
      fallbackArtwork ||
      '';

    return items
      .map((item: any, index: number): Episode | null => {
        // Find audio enclosure
        let audioUrl = item.enclosure?.['@_url'];
        if (!audioUrl && item['media:content']) {
          const media = item['media:content'];
          audioUrl = Array.isArray(media) ? media[0]?.['@_url'] : media?.['@_url'];
        }

        if (!audioUrl) return null;

        const epArtwork =
          item['itunes:image']?.['@_href'] || channelArtwork;

        const rawDuration = item['itunes:duration'];

        return {
          id: item.guid ? (typeof item.guid === 'object' ? item.guid['#text'] || String(index) : String(item.guid)) : `${feedUrl}-${index}`,
          title: item.title || 'Untitled Episode',
          description: cleanDescription(item.description || item['itunes:summary'] || ''),
          pubDate: (() => {
            if (!item.pubDate) return '';
            try {
              const d = new Date(item.pubDate);
              if (!isNaN(d.getTime())) {
                return d.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              }
            } catch {}
            return '';
          })(),
          audioUrl,
          duration: formatDuration(rawDuration),
          artworkUrl: epArtwork,
          podcastTitle: podcastTitle || channel.title || '',
        };
      })
      .filter((ep: Episode | null): ep is Episode => ep !== null);
  } catch (error) {
    console.error('Error fetching podcast episodes:', error);
    return [];
  }
}
