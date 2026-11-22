import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sortable from 'react-native-sortables';
import {
  Heart,
  Compass,
  LayoutGrid,
  LayoutList,
  GripVertical,
} from 'lucide-react-native';
import { Podcast } from '../types/podcast';
import { Theme } from '../theme/theme';

const VIEW_MODE_STORAGE_KEY = '@wavecast_favorites_view_mode';

interface FavoritesTabProps {
  favorites: Podcast[];
  onSelectPodcast: (podcast: Podcast) => void;
  onToggleFavorite: (podcast: Podcast) => void;
  onReorderFavorites?: (reordered: Podcast[]) => void;
  onGoDiscover: () => void;
  bottomPadding: number;
  theme?: Theme;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favorites,
  onSelectPodcast,
  onToggleFavorite,
  onReorderFavorites,
  onGoDiscover,
  bottomPadding,
  theme,
}) => {
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<Podcast[]>(favorites);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const isDark = theme ? theme.isDark : true;
  const cardBg = theme ? theme.card : '#161924';
  const cardBorder = theme ? theme.cardBorder : '#242A3D';
  const titleColor = theme ? theme.text : '#F8FAFC';
  const artistColor = theme ? theme.textSecondary : '#94A3B8';
  const headerBorder = theme ? theme.border : '#181C28';

  // Dimensions for 3-column Grid
  const GRID_PADDING = 16;
  const GRID_GAP = 10;
  const gridItemWidth = Math.floor((width - GRID_PADDING * 2 - GRID_GAP * 2) / 3);

  // Sync with parent favorites
  useEffect(() => {
    setItems(favorites);
  }, [favorites]);

  // Load persisted view mode
  useEffect(() => {
    AsyncStorage.getItem(VIEW_MODE_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'grid' || saved === 'list') {
          setViewMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    AsyncStorage.setItem(VIEW_MODE_STORAGE_KEY, mode).catch(() => {});
  };

  const handleDragEnd = ({ data }: { data: Podcast[] }) => {
    setItems(data);
    if (onReorderFavorites) {
      onReorderFavorites(data);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: headerBorder }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: titleColor }]}>
            Favorite Shows
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme ? theme.textMuted : '#64748B' },
            ]}
          >
            {items.length} {items.length === 1 ? 'podcast' : 'podcasts'} saved
            {items.length > 1 ? ' • Drag to arrange' : ''}
          </Text>
        </View>

        {items.length > 0 && (
          <View style={styles.headerActions}>
            {/* View Mode Toggle: List vs Grid */}
            <View
              style={[
                styles.viewModeToggle,
                {
                  backgroundColor: isDark ? '#1C2132' : '#E2E8F0',
                  borderColor: cardBorder,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === 'list' && styles.viewModeButtonActive,
                ]}
                onPress={() => handleToggleViewMode('list')}
                activeOpacity={0.7}
                accessibilityLabel="List View"
              >
                <LayoutList
                  size={15}
                  color={
                    viewMode === 'list'
                      ? '#FFFFFF'
                      : theme
                      ? theme.textMuted
                      : '#94A3B8'
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === 'grid' && styles.viewModeButtonActive,
                ]}
                onPress={() => handleToggleViewMode('grid')}
                activeOpacity={0.7}
                accessibilityLabel="Grid View"
              >
                <LayoutGrid
                  size={15}
                  color={
                    viewMode === 'grid'
                      ? '#FFFFFF'
                      : theme
                      ? theme.textMuted
                      : '#94A3B8'
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Main Content Area */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Heart size={36} color="#EC4899" strokeWidth={1.75} />
          </View>
          <Text style={[styles.emptyTitle, { color: titleColor }]}>
            No Favorite Podcasts Yet
          </Text>
          <Text
            style={[
              styles.emptyDescription,
              { color: theme ? theme.textMuted : '#64748B' },
            ]}
          >
            Tap the heart icon on any podcast while browsing to keep your
            favorite shows all in one place.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={onGoDiscover}
            activeOpacity={0.8}
          >
            <Compass size={18} color="#FFFFFF" style={styles.browseIcon} />
            <Text style={styles.browseButtonText}>Explore Podcasts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === 'grid' ? (
            /* ================= GRID VIEW ================= */
            /* In grid only display podcast art image */
            <View style={styles.gridContainer}>
              <Sortable.Grid
                data={items}
                columns={3}
                columnGap={GRID_GAP}
                rowGap={GRID_GAP}
                keyExtractor={(item) => String(item.id)}
                onDragEnd={handleDragEnd}
                renderItem={({ item }) => (
                  <Sortable.Touchable
                    onTap={() => onSelectPodcast(item)}
                    style={[
                      styles.gridCard,
                      {
                        width: gridItemWidth,
                        height: gridItemWidth,
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                      },
                      !isDark && styles.cardLightShadow,
                    ]}
                  >
                    <Image
                      source={{ uri: item.artworkUrl }}
                      style={styles.gridArtwork}
                      resizeMode="cover"
                    />
                  </Sortable.Touchable>
                )}
              />
            </View>
          ) : (
            /* ================= LIST VIEW ================= */
            <View style={styles.listContainer}>
              <Sortable.Grid
                data={items}
                columns={1}
                rowGap={12}
                keyExtractor={(item) => String(item.id)}
                onDragEnd={handleDragEnd}
                renderItem={({ item }) => (
                  <Sortable.Touchable
                    onTap={() => onSelectPodcast(item)}
                    style={[
                      styles.listCard,
                      {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                      },
                      !isDark && styles.cardLightShadow,
                    ]}
                  >
                    <Image
                      source={{ uri: item.artworkUrl }}
                      style={[
                        styles.listArtwork,
                        { backgroundColor: isDark ? '#202638' : '#E2E8F0' },
                      ]}
                      resizeMode="cover"
                    />

                    <View style={styles.listInfo}>
                      <Text
                        style={[styles.listTitle, { color: titleColor }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.listArtist, { color: artistColor }]}
                        numberOfLines={1}
                      >
                        {item.artist}
                      </Text>
                      <View style={styles.badgeRow}>
                        {item.primaryGenreName && (
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
                              {item.primaryGenreName}
                            </Text>
                          </View>
                        )}
                        {item.episodeCount && (
                          <Text style={styles.episodeText}>
                            {item.episodeCount} eps
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Grip Icon indicating reorderable */}
                    <View style={styles.listRightActions}>
                      <TouchableOpacity
                        style={styles.favButton}
                        onPress={() => onToggleFavorite(item)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Heart
                          size={18}
                          color="#EC4899"
                          fill="#EC4899"
                          strokeWidth={2}
                        />
                      </TouchableOpacity>
                      <View style={styles.gripHandle}>
                        <GripVertical
                          size={16}
                          color={isDark ? '#64748B' : '#94A3B8'}
                          strokeWidth={1.8}
                        />
                      </View>
                    </View>
                  </Sortable.Touchable>
                )}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
  },
  viewModeButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },

  /* Grid Styles */
  gridContainer: {
    paddingHorizontal: 16,
  },
  gridCard: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gridArtwork: {
    width: '100%',
    height: '100%',
    backgroundColor: '#202638',
  },

  /* List Styles */
  listContainer: {
    paddingHorizontal: 16,
  },
  listCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  listArtwork: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#202638',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 3,
  },
  listArtist: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  episodeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  listRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  gripHandle: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  /* Empty State */
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
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.25)',
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
  browseIcon: {
    marginRight: 6,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Shadows & Elevation */
  cardLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});
