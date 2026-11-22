import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Podcast } from '../types/podcast';
import { Theme } from '../theme/theme';

interface PodcastCardProps {
  podcast: Podcast;
  onPress: (podcast: Podcast) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (podcast: Podcast) => void;
  theme?: Theme;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  theme,
}) => {
  const isDark = theme ? theme.isDark : true;
  const cardBg = theme ? theme.card : '#161922';
  const cardBorder = theme ? theme.cardBorder : '#242A3D';
  const titleColor = theme ? theme.text : '#F8FAFC';
  const artistColor = theme ? theme.textSecondary : '#94A3B8';
  const favBtnBg = isDark ? '#1E2333' : '#F1F5F9';
  const favBtnBorder = isDark ? '#29324B' : '#E2E8F0';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
        !isDark && styles.cardLightShadow,
      ]}
      onPress={() => onPress(podcast)}
      activeOpacity={0.75}
    >
      <Image
        source={{ uri: podcast.artworkUrl }}
        style={[
          styles.artwork,
          { backgroundColor: isDark ? '#202638' : '#E2E8F0' },
        ]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
          {podcast.title}
        </Text>
        <Text style={[styles.artist, { color: artistColor }]} numberOfLines={1}>
          {podcast.artist}
        </Text>
        <View style={styles.footerRow}>
          {podcast.primaryGenreName ? (
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
          ) : null}
          {podcast.episodeCount ? (
            <Text style={styles.episodesText}>{podcast.episodeCount} eps</Text>
          ) : null}
        </View>
      </View>

      {onToggleFavorite && (
        <TouchableOpacity
          style={[
            styles.favButton,
            { backgroundColor: favBtnBg, borderColor: favBtnBorder },
            isFavorite && styles.favButtonActive,
          ]}
          onPress={() => onToggleFavorite(podcast)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={18}
            color={isFavorite ? '#EC4899' : isDark ? '#64748B' : '#94A3B8'}
            fill={isFavorite ? '#EC4899' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  artwork: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#202638',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 3,
  },
  artist: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genreBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  genreText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600',
  },
  episodesText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  favButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 8,
  },
  favButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  cardLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});

