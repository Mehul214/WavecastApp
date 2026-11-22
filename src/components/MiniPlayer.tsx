import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Play, Pause, RotateCw } from 'lucide-react-native';
import { Episode } from '../types/podcast';
import { Theme } from '../theme/theme';

interface MiniPlayerProps {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  progressPercent: number;
  onTogglePlayPause: () => void;
  onPress: () => void;
  onSkipForward: () => void;
  theme?: Theme;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentEpisode,
  isPlaying,
  progressPercent,
  onTogglePlayPause,
  onPress,
  onSkipForward,
  theme,
}) => {
  if (!currentEpisode) return null;

  const isDark = theme ? theme.isDark : true;
  const wrapperBg = theme ? theme.card : '#161924';
  const borderColor = theme ? theme.cardBorder : '#283046';
  const titleColor = theme ? theme.text : '#F8FAFC';
  const subColor = theme ? theme.textSecondary : '#94A3B8';
  const jumpBtnBg = isDark ? '#202638' : '#F1F5F9';

  const jumpColor = isDark ? '#818CF8' : '#4F46E5';

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: wrapperBg,
          borderTopColor: borderColor,
        },
      ]}
    >
      {/* Mini Progress Bar on Top */}
      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: isDark ? '#23293D' : '#E2E8F0' },
        ]}
      >
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: currentEpisode.artworkUrl }}
          style={styles.artwork}
        />

        <View style={styles.info}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {currentEpisode.title}
          </Text>
          <Text style={[styles.podcastTitle, { color: subColor }]} numberOfLines={1}>
            {currentEpisode.podcastTitle || 'Playing'}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.jumpButton,
              {
                backgroundColor: jumpBtnBg,
                borderColor: isDark ? '#283046' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
            onPress={onSkipForward}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RotateCw size={15} color={jumpColor} />
            <Text style={[styles.jumpText, { color: jumpColor }]}>15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={onTogglePlayPause}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPlaying ? (
              <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  progressBarBackground: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#283046',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  podcastTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  jumpText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '700',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
