import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Keyboard,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import TrackPlayer, {
  useIsPlaying,
  useProgress,
} from '@rntp/player';
import { Search, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Podcast, Episode, PlaybackHistoryItem } from './src/types/podcast';
import { searchPodcasts, fetchEpisodes } from './src/services/podcastApi';
import {
  setupAudioPlayer,
  playEpisode,
  togglePlayPause,
  jumpForward,
  jumpBackward,
} from './src/services/playerService';
import {
  getFavorites,
  saveFavorites,
  toggleFavorite,
  isFavorite,
  getHistory,
  saveHistory,
  removeHistoryItem,
  clearHistory,
} from './src/services/storageService';
import {
  getSettings,
  saveSettings,
  AppSettings,
  defaultSettings,
} from './src/services/settingsService';
import { darkTheme, lightTheme, Theme } from './src/theme/theme';
import { CategoryPills } from './src/components/CategoryPills';
import { PodcastCard } from './src/components/PodcastCard';
import { MiniPlayer } from './src/components/MiniPlayer';
import { FullPlayerModal } from './src/components/FullPlayerModal';
import { BottomNav, TabType } from './src/components/BottomNav';
import { FavoritesTab } from './src/components/FavoritesTab';
import { HistoryTab } from './src/components/HistoryTab';
import { SettingsTab } from './src/components/SettingsTab';
import { PodcastDetailScreen } from './src/components/PodcastDetailScreen';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CATEGORIES = [
  'Featured',
  'Technology',
  'News',
  'Business',
  'True Crime',
  'Comedy',
  'Science',
];

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MainScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function MainScreen() {
  const insets = useSafeAreaInsets();
  const isPlaying = useIsPlaying();
  const progress = useProgress();

  // Settings & Theme State
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const currentTheme: Theme = settings.isDarkMode ? darkTheme : lightTheme;

  // Navigation & Tab States
  const [activeTab, setActiveTab] = useState<TabType>('discover');

  // Search & Podcast States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  // Favorites & History States
  const [favorites, setFavorites] = useState<Podcast[]>([]);
  const [history, setHistory] = useState<PlaybackHistoryItem[]>([]);

  // Loading States
  const [loadingPodcasts, setLoadingPodcasts] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Playback States
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [fullPlayerVisible, setFullPlayerVisible] = useState(false);

  // Ref to track last saved position to avoid duplicate storage writes
  const lastSavedRef = useRef<{ epId: string; pos: number }>({ epId: '', pos: 0 });

  // Initialize Audio Player & Load Persisted Data
  useEffect(() => {
    setupAudioPlayer();
    loadCategoryPodcasts('Featured');

    getSettings().then(setSettings);
    getFavorites().then(setFavorites);
    getHistory().then(setHistory);
  }, []);

  // Hardware Back Button Handling on Android
  useEffect(() => {
    const onBackPress = () => {
      if (selectedPodcast) {
        setSelectedPodcast(null);
        return true;
      }
      if (activeTab !== 'discover') {
        setActiveTab('discover');
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backSubscription.remove();
  }, [selectedPodcast, activeTab]);

  // Automatically record playback position & history
  useEffect(() => {
    if (!currentEpisode || progress.position <= 1) return;

    const diff = Math.abs(progress.position - lastSavedRef.current.pos);
    if (
      lastSavedRef.current.epId !== currentEpisode.id ||
      diff >= 3 ||
      !isPlaying
    ) {
      lastSavedRef.current = {
        epId: currentEpisode.id,
        pos: progress.position,
      };
      saveHistory(currentEpisode, progress.position, progress.duration).then(
        (updated) => {
          setHistory(updated);
        }
      );
    }
  }, [currentEpisode, progress.position, progress.duration, isPlaying]);

  const loadCategoryPodcasts = async (category: string) => {
    setLoadingPodcasts(true);
    const query = category === 'Featured' ? 'top podcast' : category;
    const results = await searchPodcasts(query, 25);
    setPodcasts(results);
    setLoadingPodcasts(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setSelectedPodcast(null);
    loadCategoryPodcasts(category);
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setLoadingPodcasts(true);
    setSelectedPodcast(null);
    const results = await searchPodcasts(searchQuery, 30);
    setPodcasts(results);
    setLoadingPodcasts(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadCategoryPodcasts(selectedCategory);
  };

  const handleSelectPodcast = async (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setLoadingEpisodes(true);
    const epList = await fetchEpisodes(
      podcast.feedUrl,
      podcast.artworkUrl,
      podcast.title
    );
    setEpisodes(epList);
    setLoadingEpisodes(false);
  };

  const handleToggleFavoritePodcast = async (podcast: Podcast) => {
    const res = await toggleFavorite(podcast);
    setFavorites(res.favorites);
  };

  const handleReorderFavorites = async (reordered: Podcast[]) => {
    setFavorites(reordered);
    await saveFavorites(reordered);
  };

  const handlePlayEpisode = async (episode: Episode) => {
    setCurrentEpisode(episode);
    await playEpisode(episode);
  };

  const handleResumeHistory = async (item: PlaybackHistoryItem) => {
    if (currentEpisode?.id === item.id) {
      togglePlayPause(isPlaying);
    } else {
      setCurrentEpisode(item.episode);
      await playEpisode(item.episode, item.position);
    }
  };

  const handleRemoveHistoryItem = async (episodeId: string) => {
    const updated = await removeHistoryItem(episodeId);
    setHistory(updated);
  };

  const handleClearAllHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  const handleClearAllFavorites = async () => {
    try {
      await AsyncStorage.removeItem('@wavecast_favorites');
      setFavorites([]);
    } catch (e) {
      console.warn('Error clearing favorites', e);
    }
  };

  const handleUpdateSettings = async (partial: Partial<AppSettings>) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
  };

  const handleTogglePlayPause = () => {
    togglePlayPause(isPlaying);
  };

  const handleSeek = (position: number) => {
    TrackPlayer.seekTo(position);
  };

  const handleTabChange = (tab: TabType) => {
    setSelectedPodcast(null);
    setActiveTab(tab);
  };

  const progressPercent =
    progress.duration > 0
      ? (progress.position / progress.duration) * 100
      : 0;

  // Calculate bottom padding
  const listBottomPadding = (currentEpisode ? 76 : 0) + 68 + Math.max(insets.bottom, 12);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: currentTheme.background,
        },
      ]}
    >
      <StatusBar barStyle={currentTheme.statusBarStyle} />

      {/* Main Content Area */}
      {selectedPodcast ? (
        <PodcastDetailScreen
          podcast={selectedPodcast}
          episodes={episodes}
          loadingEpisodes={loadingEpisodes}
          isFavorite={isFavorite(favorites, selectedPodcast.id)}
          currentEpisodeId={currentEpisode?.id}
          isPlaying={isPlaying}
          onBack={() => setSelectedPodcast(null)}
          onToggleFavorite={handleToggleFavoritePodcast}
          onPlayEpisode={handlePlayEpisode}
          bottomPadding={listBottomPadding}
          theme={currentTheme}
        />
      ) : (
        <View style={styles.mainContent}>
          {/* App Header (Brand & Search) */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: currentTheme.surface,
                borderBottomColor: currentTheme.border,
              },
            ]}
          >
            <View style={styles.branding}>
              <Text style={[styles.appName, { color: currentTheme.text }]}>
                Wave<Text style={styles.appHighlight}>Cast</Text>
              </Text>
              <Text style={[styles.appTagline, { color: currentTheme.textMuted }]}>
                {activeTab === 'discover'
                  ? 'Powered by iTunes & Open RSS'
                  : activeTab === 'favorites'
                  ? 'Your Saved Podcasts'
                  : activeTab === 'history'
                  ? 'Continue Listening'
                  : 'App Preferences'}
              </Text>
            </View>

            {/* Search Bar (Only shown on Discover Tab) */}
            {activeTab === 'discover' && (
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: currentTheme.inputBg,
                    borderColor: currentTheme.cardBorder,
                  },
                ]}
              >
                <Search size={16} color={currentTheme.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: currentTheme.text }]}
                  placeholder="Search podcasts, topics, hosts..."
                  placeholderTextColor={currentTheme.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearSearch}
                    style={styles.clearBtn}
                  >
                    <X size={15} color={currentTheme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Tab Views */}
          {activeTab === 'discover' ? (
            <View style={styles.exploreView}>
              <CategoryPills
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                theme={currentTheme}
              />

              {loadingPodcasts ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#6366F1" />
                  <Text style={[styles.loadingText, { color: currentTheme.textMuted }]}>
                    Searching directory...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={podcasts}
                  keyExtractor={(item) => String(item.id)}
                  contentContainerStyle={[
                    styles.podcastListContent,
                    { paddingBottom: listBottomPadding },
                  ]}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      tintColor="#6366F1"
                      onRefresh={async () => {
                        setRefreshing(true);
                        await loadCategoryPodcasts(selectedCategory);
                        setRefreshing(false);
                      }}
                    />
                  }
                  renderItem={({ item }) => (
                    <PodcastCard
                      podcast={item}
                      onPress={handleSelectPodcast}
                      isFavorite={isFavorite(favorites, item.id)}
                      onToggleFavorite={handleToggleFavoritePodcast}
                      theme={currentTheme}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.centerContainer}>
                      <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                        No podcasts found.
                      </Text>
                      <Text style={[styles.emptySubtext, { color: currentTheme.textMuted }]}>
                        Try searching for another topic or keyword.
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          ) : activeTab === 'favorites' ? (
            <FavoritesTab
              favorites={favorites}
              onSelectPodcast={handleSelectPodcast}
              onToggleFavorite={handleToggleFavoritePodcast}
              onReorderFavorites={handleReorderFavorites}
              onGoDiscover={() => setActiveTab('discover')}
              bottomPadding={listBottomPadding}
              theme={currentTheme}
            />
          ) : activeTab === 'history' ? (
            <HistoryTab
              history={history}
              currentEpisodeId={currentEpisode?.id}
              isPlaying={isPlaying}
              onResume={handleResumeHistory}
              onRemoveItem={handleRemoveHistoryItem}
              onClearAll={handleClearAllHistory}
              onGoDiscover={() => setActiveTab('discover')}
              bottomPadding={listBottomPadding}
              theme={currentTheme}
            />
          ) : (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearAllHistory}
              onClearFavorites={handleClearAllFavorites}
              theme={currentTheme}
              bottomPadding={listBottomPadding}
            />
          )}
        </View>
      )}

      {/* Floating Bottom Mini Player */}
      {currentEpisode && (
        <MiniPlayer
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          progressPercent={progressPercent}
          onTogglePlayPause={handleTogglePlayPause}
          onPress={() => setFullPlayerVisible(true)}
          onSkipForward={() => jumpForward(settings.skipForwardSeconds || 15)}
          theme={currentTheme}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        favoritesCount={favorites.length}
        historyCount={history.length}
        theme={currentTheme}
      />

      {/* Full Screen Player Modal */}
      <FullPlayerModal
        visible={fullPlayerVisible}
        episode={currentEpisode}
        isPlaying={isPlaying}
        position={progress.position}
        duration={progress.duration}
        onClose={() => setFullPlayerVisible(false)}
        onTogglePlayPause={handleTogglePlayPause}
        onJumpForward={() => jumpForward(settings.skipForwardSeconds || 15)}
        onJumpBackward={() => jumpBackward(settings.skipBackwardSeconds || 15)}
        onSeek={handleSeek}
        isFavorite={
          selectedPodcast
            ? isFavorite(favorites, selectedPodcast.id)
            : favorites.some(
                (f) =>
                  f.title.toLowerCase() ===
                  (currentEpisode?.podcastTitle || '').toLowerCase()
              )
        }
        onToggleFavorite={() => {
          if (selectedPodcast) {
            handleToggleFavoritePodcast(selectedPodcast);
          } else if (currentEpisode) {
            const match =
              podcasts.find(
                (p) =>
                  p.title.toLowerCase() ===
                  (currentEpisode.podcastTitle || '').toLowerCase()
              ) ||
              favorites.find(
                (f) =>
                  f.title.toLowerCase() ===
                  (currentEpisode.podcastTitle || '').toLowerCase()
              );
            if (match) {
              handleToggleFavoritePodcast(match);
            }
          }
        }}
        theme={currentTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  branding: {
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  appHighlight: {
    color: '#6366F1',
  },
  appTagline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginTop: 2,
    marginBottom: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
  },
  clearBtn: {
    padding: 6,
  },
  exploreView: {
    flex: 1,
  },
  podcastListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
  },
});
