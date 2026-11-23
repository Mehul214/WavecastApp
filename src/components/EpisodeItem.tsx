import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Play, Pause, ArrowDownCircle, CheckCircle } from 'lucide-react-native';
import { Episode } from '../types/podcast';
import { Theme } from '../theme/theme';
import { CircularProgress } from './CircularProgress';

interface EpisodeItemProps {
  episode: Episode;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (episode: Episode) => void;
  isDownloaded?: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onToggleDownload?: (episode: Episode) => void;
  theme?: Theme;
}

export const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
  isPlaying,
  isCurrentTrack,
  onPlay,
  isDownloaded = false,
  isDownloading = false,
  downloadProgress = -1,
  onToggleDownload,
  theme,
}) => {
  const isDark = theme ? theme.isDark : true;
  const containerBg = isCurrentTrack
    ? isDark
      ? '#191E2E'
      : '#EEF2FF'
    : isDark
    ? '#161922'
    : '#FFFFFF';

  const containerBorder = isCurrentTrack
    ? '#6366F1'
    : isDark
    ? '#22283A'
    : '#E2E8F0';

  const titleColor = isCurrentTrack
    ? isDark
      ? '#A5B4FC'
      : '#4F46E5'
    : isDark
    ? '#F1F5F9'
    : '#0F172A';

  const dateColor = isDark ? '#818CF8' : '#6366F1';
  const mutedColor = theme ? theme.textMuted : '#64748B';
  const descColor = theme ? theme.textSecondary : isDark ? '#94A3B8' : '#475569';

  // Sanitize display date to avoid "Invalid Date"
  const displayDate =
    episode.pubDate && !episode.pubDate.toLowerCase().includes('invalid')
      ? episode.pubDate
      : '';

  const playBtnBg = isCurrentTrack
    ? '#6366F1'
    : isDark
    ? '#202638'
    : '#F1F5F9';

  const playBtnBorder = isCurrentTrack
    ? isDark
      ? '#818CF8'
      : '#6366F1'
    : isDark
    ? '#2F3854'
    : '#E2E8F0';

  const playIconColor = isCurrentTrack
    ? '#FFFFFF'
    : isDark
    ? '#FFFFFF'
    : '#6366F1';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: containerBg,
          borderColor: containerBorder,
        },
        !isDark && !isCurrentTrack && styles.containerLightShadow,
      ]}
      onPress={() => onPlay(episode)}
      activeOpacity={0.75}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {displayDate ? (
            <Text style={[styles.dateText, { color: dateColor }]}>
              {displayDate}
            </Text>
          ) : null}
          {episode.duration ? (
            <Text style={[styles.durationText, { color: mutedColor }]}>
              {displayDate ? '• ' : ''}
              {episode.duration}
            </Text>
          ) : null}
        </View>

        <Text
          style={[styles.title, { color: titleColor }]}
          numberOfLines={2}
        >
          {episode.title}
        </Text>

        {episode.description ? (
          <Text
            style={[styles.description, { color: descColor }]}
            numberOfLines={2}
          >
            {episode.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        {onToggleDownload && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => onToggleDownload(episode)}
            disabled={isDownloading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isDownloading ? (
              <CircularProgress
                size={22}
                strokeWidth={2.2}
                progress={downloadProgress}
                color="#10B981"
              />
            ) : isDownloaded ? (
              <CheckCircle size={18} color="#10B981" />
            ) : (
              <ArrowDownCircle size={18} color={isDark ? '#64748B' : '#94A3B8'} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.playButton,
            {
              backgroundColor: playBtnBg,
              borderColor: playBtnBorder,
            },
          ]}
          onPress={() => onPlay(episode)}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause size={14} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play
              size={14}
              color={playIconColor}
              fill={playIconColor}
              style={{ marginLeft: 2 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  containerLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

