import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownCircle,
  CheckCircle,
  Play,
  Pause,
  Trash2,
  HardDrive,
  Compass,
} from 'lucide-react-native';
import { DownloadedEpisode, formatBytes, getTotalDownloadsSize } from '../services/downloadService';
import { Theme } from '../theme/theme';

interface DownloadsTabProps {
  downloads: DownloadedEpisode[];
  currentEpisodeId?: string;
  isPlaying: boolean;
  onPlayEpisode: (episode: DownloadedEpisode) => void;
  onDeleteDownload: (episodeId: string) => void;
  onClearAllDownloads: () => void;
  onGoDiscover: () => void;
  bottomPadding: number;
  theme?: Theme;
}

export const DownloadsTab: React.FC<DownloadsTabProps> = ({
  downloads,
  currentEpisodeId,
  isPlaying,
  onPlayEpisode,
  onDeleteDownload,
  onClearAllDownloads,
  onGoDiscover,
  bottomPadding,
  theme,
}) => {
  const isDark = theme ? theme.isDark : true;
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#141722' : '#FFFFFF';
  const cardBorder = isDark ? '#22283A' : '#E2E8F0';
  const accentColor = isDark ? '#818CF8' : '#6366F1';

  const confirmDelete = (episode: DownloadedEpisode) => {
    Alert.alert(
      'Remove Download',
      `Delete "${episode.title}" from offline storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteDownload(episode.id),
        },
      ]
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to delete all offline podcast files from device storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: onClearAllDownloads,
        },
      ]
    );
  };

  const renderHeader = () => {
    if (downloads.length === 0) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statsIconBox}>
            <HardDrive size={18} color="#818CF8" />
          </View>
          <View style={styles.statsTextBox}>
            <Text style={[styles.statsTitle, { color: textColor }]}>
              {downloads.length} {downloads.length === 1 ? 'Episode' : 'Episodes'} Offline
            </Text>
            <Text style={[styles.statsSub, { color: textMuted }]}>
              Total Storage: {getTotalDownloadsSize(downloads)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={confirmClearAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: DownloadedEpisode }) => {
    const isCurrent = currentEpisodeId === item.id;
    const isItemPlaying = isCurrent && isPlaying;

    return (
      <View
        style={[
          styles.episodeCard,
          {
            backgroundColor: isCurrent ? (isDark ? '#191E2E' : '#EEF2FF') : cardBg,
            borderColor: isCurrent ? accentColor : cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => onPlayEpisode(item)}
          activeOpacity={0.7}
        >
          {item.artworkUrl ? (
            <Image
              source={{ uri: item.artworkUrl }}
              style={styles.artwork}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <ArrowDownCircle size={24} color="#818CF8" />
            </View>
          )}

          <View style={styles.infoCol}>
            <View style={styles.badgeRow}>
              <View style={styles.offlineBadge}>
                <CheckCircle size={10} color="#10B981" />
                <Text style={styles.offlineBadgeText}>OFFLINE</Text>
              </View>
              {item.fileSize > 0 && (
                <Text style={[styles.sizeText, { color: textMuted }]}>
                  {formatBytes(item.fileSize)}
                </Text>
              )}
            </View>

            <Text
              style={[
                styles.title,
                { color: isCurrent ? (isDark ? '#A5B4FC' : '#4F46E5') : textColor },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text style={[styles.podcastName, { color: accentColor }]} numberOfLines={1}>
              {item.podcastTitle || 'Podcast'}
            </Text>

            {item.duration ? (
              <Text style={[styles.metaText, { color: textMuted }]}>
                Duration: {item.duration}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={[
              styles.playBtn,
              { backgroundColor: isItemPlaying ? '#EC4899' : accentColor },
            ]}
            onPress={() => onPlayEpisode(item)}
            activeOpacity={0.8}
          >
            {isItemPlaying ? (
              <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={downloads}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding + 30 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <ArrowDownCircle size={44} color="#818CF8" />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No Offline Downloads
            </Text>
            <Text style={[styles.emptyDesc, { color: textMuted }]}>
              Download your favorite episodes to listen anytime, even when you have no cellular connection or Wi-Fi.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={onGoDiscover}
              activeOpacity={0.8}
            >
              <Compass size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.exploreBtnText}>Discover Podcasts</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerContainer: {
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsTextBox: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsSub: {
    fontSize: 12,
    marginTop: 2,
  },
  clearAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1E2333',
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  offlineBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sizeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 3,
  },
  podcastName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
    height: 60,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
