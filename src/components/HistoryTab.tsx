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
import { Clock, Play, Pause, X, Trash2, Compass } from 'lucide-react-native';
import { PlaybackHistoryItem } from '../types/podcast';
import { Theme } from '../theme/theme';

interface HistoryTabProps {
  history: PlaybackHistoryItem[];
  currentEpisodeId?: string;
  isPlaying: boolean;
  onResume: (item: PlaybackHistoryItem) => void;
  onRemoveItem: (episodeId: string) => void;
  onClearAll: () => void;
  onGoDiscover: () => void;
  bottomPadding: number;
  theme?: Theme;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  currentEpisodeId,
  isPlaying,
  onResume,
  onRemoveItem,
  onClearAll,
  onGoDiscover,
  bottomPadding,
  theme,
}) => {
  const isDark = theme ? theme.isDark : true;
  const cardBg = theme ? theme.card : '#161924';
  const cardBorder = theme ? theme.cardBorder : '#242A3D';
  const titleColor = theme ? theme.text : '#F8FAFC';
  const artistColor = theme ? theme.textSecondary : '#94A3B8';
  const headerBorder = theme ? theme.border : '#181C28';

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const handleClearConfirm = () => {
    Alert.alert(
      'Clear Listening History',
      'Are you sure you want to clear your listening history and saved playback positions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: headerBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: titleColor }]}>
            Listening History
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme ? theme.textMuted : '#64748B' }]}>
            {history.length} {history.length === 1 ? 'episode' : 'episodes'} tracked
          </Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity
            style={[
              styles.clearBtn,
              { backgroundColor: isDark ? '#1E2333' : '#FEE2E2' },
            ]}
            onPress={handleClearConfirm}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={13} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        renderItem={({ item }) => {
          const isCurrentlyActive = currentEpisodeId === item.id;
          const stoppedTimeStr = formatTime(item.position);
          const totalDurationStr =
            item.duration > 0 ? formatTime(item.duration) : '--:--';
          const percent = Math.min(100, Math.max(0, item.progressPercent));

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: cardBg, borderColor: cardBorder },
                isCurrentlyActive && styles.cardActive,
                !isDark && styles.cardLightShadow,
              ]}
            >
              <View style={styles.cardTopRow}>
                {/* Artwork */}
                <Image
                  source={{
                    uri:
                      item.episode.artworkUrl ||
                      'https://picsum.photos/120/120',
                  }}
                  style={[
                    styles.artwork,
                    { backgroundColor: isDark ? '#202638' : '#E2E8F0' },
                  ]}
                />

                <View style={styles.infoCol}>
                  <View style={styles.metaRow}>
                    <Text style={styles.timeAgo}>
                      {formatRelativeTime(item.lastPlayedAt)}
                    </Text>
                    {isCurrentlyActive && (
                      <View
                        style={[
                          styles.nowPlayingBadge,
                          {
                            backgroundColor: isDark
                              ? 'rgba(99, 102, 241, 0.2)'
                              : '#EEF2FF',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.nowPlayingText,
                            { color: isDark ? '#818CF8' : '#4F46E5' },
                          ]}
                        >
                          NOW PLAYING
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
                    {item.episode.title}
                  </Text>
                  <Text style={[styles.podcastHost, { color: artistColor }]} numberOfLines={1}>
                    {item.episode.podcastTitle || 'Podcast'}
                  </Text>
                </View>

                {/* Remove single item */}
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => onRemoveItem(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={15} color={isDark ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
              </View>

              {/* Progress & Stop position indicator */}
              <View
                style={[
                  styles.progressContainer,
                  { borderTopColor: isDark ? '#202538' : '#F1F5F9' },
                ]}
              >
                <View
                  style={[
                    styles.progressBarBg,
                    { backgroundColor: isDark ? '#242A3E' : '#E2E8F0' },
                  ]}
                >
                  <View
                    style={[styles.progressBarFill, { width: `${percent}%` }]}
                  />
                </View>

                <View style={styles.progressDetailRow}>
                  <Text style={[styles.stoppedAtText, { color: artistColor }]}>
                    Stopped at <Text style={styles.highlightText}>{stoppedTimeStr}</Text> / {totalDurationStr}
                  </Text>
                  <Text style={styles.percentText}>{percent}%</Text>
                </View>
              </View>

              {/* Resume / Action Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.resumeBtn,
                    isCurrentlyActive && isPlaying && styles.resumeBtnPlaying,
                  ]}
                  onPress={() => onResume(item)}
                  activeOpacity={0.8}
                >
                  {isCurrentlyActive && isPlaying ? (
                    <Pause size={12} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={12} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 1 }} />
                  )}
                  <Text style={styles.resumeText}>
                    {isCurrentlyActive && isPlaying
                      ? 'Pause'
                      : percent >= 95
                      ? 'Play Again'
                      : `Resume from ${stoppedTimeStr}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Clock size={36} color="#6366F1" strokeWidth={1.75} />
            </View>
            <Text style={[styles.emptyTitle, { color: titleColor }]}>
              No Listening History
            </Text>
            <Text style={[styles.emptyDescription, { color: theme ? theme.textMuted : '#64748B' }]}>
              Episodes you play will automatically appear here with your exact stopping time so you can resume whenever you want.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={onGoDiscover}
              activeOpacity={0.8}
            >
              <Compass size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.browseButtonText}>Start Listening</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardActive: {
    borderColor: '#6366F1',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#202638',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timeAgo: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  nowPlayingBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nowPlayingText: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 3,
  },
  podcastHost: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeBtn: {
    padding: 4,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  progressDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stoppedAtText: {
    fontSize: 11,
    fontWeight: '500',
  },
  highlightText: {
    color: '#818CF8',
    fontWeight: '700',
  },
  percentText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  resumeBtnPlaying: {
    backgroundColor: '#4F46E5',
  },
  resumeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});

