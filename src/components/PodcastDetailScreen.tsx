import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Heart, Radio } from 'lucide-react-native';
import { Podcast, Episode } from '../types/podcast';
import { EpisodeItem } from './EpisodeItem';
import { Theme } from '../theme/theme';

interface PodcastDetailScreenProps {
  podcast: Podcast;
  episodes: Episode[];
  loadingEpisodes: boolean;
  isFavorite: boolean;
  currentEpisodeId?: string;
  isPlaying: boolean;
  onBack: () => void;
  onToggleFavorite: (podcast: Podcast) => void;
  onPlayEpisode: (episode: Episode) => void;
  isEpisodeDownloaded?: (episodeId: string) => boolean;
  isEpisodeDownloading?: (episodeId: string) => boolean;
  getDownloadProgress?: (episodeId: string) => number;
  onToggleDownloadEpisode?: (episode: Episode) => void;
  bottomPadding: number;
  theme?: Theme;
}

export const PodcastDetailScreen: React.FC<PodcastDetailScreenProps> = ({
  podcast,
  episodes,
  loadingEpisodes,
  isFavorite,
  currentEpisodeId,
  isPlaying,
  onBack,
  onToggleFavorite,
  onPlayEpisode,
  isEpisodeDownloaded,
  isEpisodeDownloading,
  getDownloadProgress,
  onToggleDownloadEpisode,
  bottomPadding,
  theme,
}) => {
  const isDark = theme ? theme.isDark : true;
  const bgColor = theme ? theme.background : '#0B0D13';
  const navBg = theme ? theme.surface : '#0F121C';
  const navBorder = theme ? theme.border : '#181C28';
  const textColor = theme ? theme.text : '#FFFFFF';
  const textMuted = theme ? theme.textMuted : '#94A3B8';
  const iconBtnBg = isDark ? '#1E2333' : '#F1F5F9';
  const iconBtnBorder = isDark ? '#29324B' : '#E2E8F0';
  const backIconColor = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Proper Top Navigation Bar */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: navBg, borderBottomColor: navBorder },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: iconBtnBg, borderColor: iconBtnBorder },
          ]}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={backIconColor} />
        </TouchableOpacity>

        <Text
          style={[styles.navTitle, { color: textColor }]}
          numberOfLines={1}
        >
          {podcast.title}
        </Text>

        <TouchableOpacity
          style={[
            styles.favIconButton,
            { backgroundColor: iconBtnBg, borderColor: iconBtnBorder },
            isFavorite && styles.favIconButtonActive,
          ]}
          onPress={() => onToggleFavorite(podcast)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Heart
            size={20}
            color={isFavorite ? '#EC4899' : isDark ? '#94A3B8' : '#64748B'}
            fill={isFavorite ? '#EC4899' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Episode List with Rich Header */}
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <Image
              source={{ uri: podcast.artworkUrl }}
              style={[
                styles.heroArtwork,
                { backgroundColor: isDark ? '#1A1E2C' : '#E2E8F0' },
              ]}
              resizeMode="cover"
            />

            <View style={styles.heroDetails}>
              <Text style={[styles.heroTitle, { color: textColor }]}>
                {podcast.title}
              </Text>
              <Text style={[styles.heroArtist, { color: textMuted }]}>
                {podcast.artist}
              </Text>

              <View style={styles.tagsRow}>
                {podcast.primaryGenreName && (
                  <View
                    style={[
                      styles.genreBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(99, 102, 241, 0.15)'
                          : '#EEF2FF',
                        borderColor: isDark
                          ? 'rgba(99, 102, 241, 0.3)'
                          : '#C7D2FE',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.genreText,
                        { color: isDark ? '#818CF8' : '#4F46E5' },
                      ]}
                    >
                      {podcast.primaryGenreName}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isDark ? '#161924' : '#F1F5F9',
                      borderColor: iconBtnBorder,
                    },
                  ]}
                >
                  <Radio size={12} color={textMuted} style={{ marginRight: 4 }} />
                  <Text style={[styles.countText, { color: textMuted }]}>
                    {episodes.length > 0
                      ? `${episodes.length} episodes`
                      : 'Loading episodes...'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.followButton,
                  {
                    backgroundColor: isFavorite
                      ? '#EC4899'
                      : isDark
                      ? 'rgba(236, 72, 153, 0.12)'
                      : '#FDF2F8',
                    borderColor: isFavorite
                      ? '#EC4899'
                      : isDark
                      ? 'rgba(236, 72, 153, 0.35)'
                      : '#FBCFE8',
                  },
                ]}
                onPress={() => onToggleFavorite(podcast)}
                activeOpacity={0.8}
              >
                <Heart
                  size={15}
                  color={isFavorite ? '#FFFFFF' : '#EC4899'}
                  fill={isFavorite ? '#FFFFFF' : 'transparent'}
                  strokeWidth={2}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.followButtonText,
                    isFavorite && styles.followButtonTextActive,
                  ]}
                >
                  {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.sectionDivider,
                { borderTopColor: navBorder },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                All Episodes
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <EpisodeItem
            episode={item}
            isPlaying={isPlaying}
            isCurrentTrack={currentEpisodeId === item.id}
            onPlay={onPlayEpisode}
            isDownloaded={isEpisodeDownloaded ? isEpisodeDownloaded(item.id) : false}
            isDownloading={isEpisodeDownloading ? isEpisodeDownloading(item.id) : false}
            downloadProgress={getDownloadProgress ? getDownloadProgress(item.id) : -1}
            onToggleDownload={onToggleDownloadEpisode}
            theme={theme}
          />
        )}
        ListEmptyComponent={
          loadingEpisodes ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={[styles.loadingText, { color: textMuted }]}>
                Fetching podcast RSS feed...
              </Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>
                No episodes available in feed.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  favIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  favIconButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroArtwork: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#1A1E2C',
    marginBottom: 16,
  },
  heroDetails: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  heroArtist: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  genreBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  genreText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.35)',
  },
  followButtonActive: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  followButtonText: {
    color: '#EC4899',
    fontSize: 13,
    fontWeight: '700',
  },
  followButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionDivider: {
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
