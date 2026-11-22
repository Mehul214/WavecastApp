import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  X,
  Heart,
} from 'lucide-react-native';
import TrackPlayer from '@rntp/player';
import { Episode } from '../types/podcast';
import { Theme } from '../theme/theme';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(width - 56, 320);

interface FullPlayerModalProps {
  visible: boolean;
  episode: Episode | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  onClose: () => void;
  onTogglePlayPause: () => void;
  onJumpForward: () => void;
  onJumpBackward: () => void;
  onSeek: (position: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  theme?: Theme;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  visible,
  episode,
  isPlaying,
  position,
  duration,
  onClose,
  onTogglePlayPause,
  onJumpForward,
  onJumpBackward,
  onSeek,
  isFavorite = false,
  onToggleFavorite,
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  if (!episode) return null;

  // On iOS pageSheet, the system modal already starts below the status bar.
  // Using insets.top here caused a duplicate 59pt gap above the drag handle.
  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight || 28) + 12
      : 8;

  const bottomPadding = Math.max(insets.bottom, 24);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const totalSecs = Math.floor(secs);
    const mins = Math.floor(totalSecs / 60);
    const remainingSecs = totalSecs % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins.toString().padStart(2, '0')}:${remainingSecs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainingSecs
      .toString()
      .padStart(2, '0')}`;
  };

  const cleanDate = (dateStr?: string) => {
    if (!dateStr || dateStr.toLowerCase().includes('invalid')) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr.includes('NaN') ? null : dateStr;
      }
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formattedDate = cleanDate(episode.pubDate);

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (position / duration) * 100))
      : 0;

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    TrackPlayer.setPlaybackSpeed(newSpeed);
  };

  const handleProgressBarPress = (event: any) => {
    const touchX = event.nativeEvent.locationX;
    const barWidth = width - 48;
    const ratio = Math.max(0, Math.min(1, touchX / barWidth));
    if (duration > 0) {
      onSeek(ratio * duration);
    }
  };

  const isDark = theme ? theme.isDark : true;
  const bgColor = isDark ? '#0A0C13' : '#F8FAFC';
  const cardBg = isDark ? '#141722' : '#FFFFFF';
  const cardBorder = isDark ? '#22283A' : '#E2E8F0';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const primaryAccent = isDark ? '#818CF8' : '#6366F1';
  const speedBtnBg = isDark ? '#181C28' : '#FFFFFF';
  const speedBtnBorder = isDark ? '#262E44' : '#E2E8F0';
  const closeBtnBg = isDark ? '#181C28' : '#FFFFFF';
  const closeBtnBorder = isDark ? '#262E44' : '#E2E8F0';
  const closeIconColor = isDark ? '#CBD5E1' : '#475569';
  const skipBtnBg = isDark ? '#161A26' : '#FFFFFF';
  const skipBtnBorder = isDark ? '#262E44' : '#E2E8F0';
  const skipBtnText = isDark ? '#CBD5E1' : '#334155';
  const skipIconColor = isDark ? '#CBD5E1' : '#475569';
  const scrubberTrackBg = isDark ? '#1C2133' : '#E2E8F0';
  const dragHandleBg = isDark ? '#262D42' : '#CBD5E1';
  const headerBorder = isDark ? '#171B28' : '#E2E8F0';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          },
        ]}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Top Grab Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: dragHandleBg }]} />
        </View>

        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: headerBorder }]}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: closeBtnBg, borderColor: closeBtnBorder },
              !isDark && styles.lightShadowSmall,
            ]}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={18} color={closeIconColor} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerLabel, { color: primaryAccent }]}>
              NOW PLAYING
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: textColor }]}
              numberOfLines={1}
            >
              {episode.podcastTitle || 'Podcast'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.speedBadge,
              { backgroundColor: speedBtnBg, borderColor: speedBtnBorder },
              !isDark && styles.lightShadowSmall,
            ]}
            onPress={cycleSpeed}
            activeOpacity={0.7}
          >
            <Text style={[styles.speedText, { color: primaryAccent }]}>
              {playbackSpeed}x
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cover Art Hero */}
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: episode.artworkUrl }}
              style={[
                styles.artwork,
                {
                  borderColor: isDark ? '#242C42' : '#E2E8F0',
                  backgroundColor: isDark ? '#181C28' : '#F1F5F9',
                },
              ]}
              resizeMode="cover"
            />
          </View>

          {/* Title & Metadata with Favorite Button */}
          <View style={styles.metaContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleTextContainer}>
                <Text
                  style={[styles.episodeTitle, { color: textColor }]}
                  numberOfLines={3}
                >
                  {episode.title}
                </Text>
                <Text
                  style={[styles.podcastHost, { color: primaryAccent }]}
                  numberOfLines={1}
                >
                  {episode.podcastTitle || 'WaveCast Episode'}
                </Text>
                {formattedDate && (
                  <Text style={[styles.pubDate, { color: textMuted }]}>
                    {formattedDate}
                  </Text>
                )}
              </View>

              {onToggleFavorite && (
                <TouchableOpacity
                  style={[
                    styles.playerFavBtn,
                    {
                      backgroundColor: isFavorite
                        ? isDark
                          ? 'rgba(236, 72, 153, 0.15)'
                          : '#FDF2F8'
                        : isDark
                        ? '#181C28'
                        : '#FFFFFF',
                      borderColor: isFavorite
                        ? isDark
                          ? 'rgba(236, 72, 153, 0.4)'
                          : '#FBCFE8'
                        : isDark
                        ? '#262E44'
                        : '#E2E8F0',
                    },
                    !isDark && !isFavorite && styles.lightShadowSmall,
                  ]}
                  onPress={onToggleFavorite}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={22}
                    color={
                      isFavorite ? '#EC4899' : isDark ? '#94A3B8' : '#64748B'
                    }
                    fill={isFavorite ? '#EC4899' : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Scrubber / Progress Bar */}
          <View style={styles.scrubberSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.progressBarTrack,
                { backgroundColor: scrubberTrackBg },
              ]}
              onPress={handleProgressBarPress}
            >
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
              <View
                style={[
                  styles.scrubberThumb,
                  {
                    left: `${Math.max(
                      0,
                      Math.min(97, progressPercent - 2)
                    )}%`,
                  },
                ]}
              />
            </TouchableOpacity>

            <View style={styles.timeLabels}>
              <Text style={[styles.timeText, { color: textMuted }]}>
                {formatTime(position)}
              </Text>
              <Text style={[styles.timeText, { color: textMuted }]}>
                {duration > 0 ? formatTime(duration) : '--:--'}
              </Text>
            </View>
          </View>

          {/* Main Controls Row */}
          <View style={styles.controlsRow}>
            {/* Jump Backward 15s */}
            <TouchableOpacity
              style={[
                styles.skipPillButton,
                { backgroundColor: skipBtnBg, borderColor: skipBtnBorder },
                !isDark && styles.lightShadowSmall,
              ]}
              onPress={onJumpBackward}
              activeOpacity={0.7}
            >
              <RotateCcw size={18} color={skipIconColor} />
              <Text style={[styles.skipPillText, { color: skipBtnText }]}>
                15s
              </Text>
            </TouchableOpacity>

            {/* Play / Pause Main Button */}
            <TouchableOpacity
              style={styles.mainPlayButton}
              onPress={onTogglePlayPause}
              activeOpacity={0.85}
            >
              {isPlaying ? (
                <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play
                  size={28}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  style={{ marginLeft: 3 }}
                />
              )}
            </TouchableOpacity>

            {/* Jump Forward 15s */}
            <TouchableOpacity
              style={[
                styles.skipPillButton,
                { backgroundColor: skipBtnBg, borderColor: skipBtnBorder },
                !isDark && styles.lightShadowSmall,
              ]}
              onPress={onJumpForward}
              activeOpacity={0.7}
            >
              <RotateCw size={18} color={skipIconColor} />
              <Text style={[styles.skipPillText, { color: skipBtnText }]}>
                15s
              </Text>
            </TouchableOpacity>
          </View>

          {/* Episode Notes / Description */}
          {episode.description ? (
            <View
              style={[
                styles.descriptionBox,
                { backgroundColor: cardBg, borderColor: cardBorder },
                !isDark && styles.lightShadowCard,
              ]}
            >
              <Text
                style={[styles.descriptionTitle, { color: textColor }]}
              >
                Episode Notes
              </Text>
              <Text
                style={[
                  styles.descriptionBody,
                  { color: isDark ? '#94A3B8' : '#475569' },
                ]}
              >
                {episode.description}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C13',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262D42',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#171B28',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#181C28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262E44',
  },
  headerCenter: {
    alignItems: 'center',
    maxWidth: width - 140,
  },
  headerLabel: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  speedBadge: {
    backgroundColor: '#181C28',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262E44',
  },
  speedText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 20,
    backgroundColor: '#181C28',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#242C42',
  },
  metaContainer: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleTextContainer: {
    flex: 1,
    marginRight: 14,
  },
  episodeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: 6,
  },
  podcastHost: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pubDate: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  playerFavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181C28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262E44',
    marginTop: 2,
  },
  playerFavBtnActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  scrubberSection: {
    marginBottom: 24,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1C2133',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    top: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 28,
  },
  skipPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#161A26',
    borderWidth: 1,
    borderColor: '#262E44',
    gap: 6,
  },
  skipPillText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  mainPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  descriptionBox: {
    backgroundColor: '#141722',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#22283A',
  },
  descriptionTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionBody: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
  },
  lightShadowSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  lightShadowCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});

