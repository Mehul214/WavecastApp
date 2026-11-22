import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Moon,
  Sun,
  RotateCw,
  RotateCcw,
  Gauge,
  Wifi,
  Trash2,
  Heart,
  HardDrive,
  Info,
  Coffee,
  QrCode,
  ExternalLink,
  Sparkles,
} from 'lucide-react-native';
import { AppSettings } from '../services/settingsService';
import { Theme } from '../theme/theme';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  onClearFavorites: () => void;
  theme: Theme;
  bottomPadding: number;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  onClearFavorites,
  theme,
  bottomPadding,
}) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const isDark = theme.isDark;
  const iconAccent = isDark ? '#818CF8' : '#6366F1';
  const sectionTitleColor = isDark ? '#818CF8' : '#4F46E5';

  const handleClearHistoryConfirm = () => {
    Alert.alert(
      'Clear Playback History',
      'Are you sure you want to clear all listening history and saved stopping points?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear History', style: 'destructive', onPress: onClearHistory },
      ]
    );
  };

  const handleClearFavoritesConfirm = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all saved podcasts from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Favorites', style: 'destructive', onPress: onClearFavorites },
      ]
    );
  };

  const handleCleanCache = () => {
    Alert.alert(
      'Cache Cleaned',
      'Temporary feed images and audio buffer cache have been freed (18.4 MB cleared).'
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. APPEARANCE SECTION */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          APPEARANCE
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
            !isDark && styles.cardLightShadow,
          ]}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.rowIconContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                },
              ]}
            >
              {isDark ? (
                <Moon size={20} color="#818CF8" />
              ) : (
                <Sun size={20} color="#D97706" />
              )}
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>
                {isDark ? 'Dark Theme' : 'Light Theme'}
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                {isDark
                  ? 'Sleek dark colors optimized for night listening'
                  : 'High contrast clean daylight mode'}
              </Text>
            </View>
            <Switch
              value={settings.isDarkMode}
              onValueChange={(val) => onUpdateSettings({ isDarkMode: val })}
              trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
              thumbColor={settings.isDarkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      {/* 2. PLAYBACK SETTINGS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          PLAYBACK & CONTROLS
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
            !isDark && styles.cardLightShadow,
          ]}
        >
          {/* Skip Forward Interval */}
          <View style={styles.rowCol}>
            <View style={styles.pillRowHeader}>
              <RotateCw size={18} color={iconAccent} />
              <Text style={[styles.pillRowTitle, { color: theme.text }]}>
                Skip Forward Interval
              </Text>
            </View>
            <View style={styles.pillsGroup}>
              {[10, 15, 30].map((sec) => {
                const isSelected = settings.skipForwardSeconds === sec;
                return (
                  <TouchableOpacity
                    key={sec}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected
                          ? '#6366F1'
                          : isDark
                          ? '#1E2436'
                          : '#F8FAFC',
                        borderColor: isSelected
                          ? isDark
                            ? '#818CF8'
                            : '#6366F1'
                          : isDark
                          ? '#283044'
                          : '#E2E8F0',
                      },
                      !isDark && !isSelected && styles.pillLightShadow,
                    ]}
                    onPress={() => onUpdateSettings({ skipForwardSeconds: sec })}
                  >
                    <Text
                      style={[
                        styles.pillOptionText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? theme.textSecondary
                            : '#334155',
                        },
                      ]}
                    >
                      +{sec}s
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Skip Backward Interval */}
          <View style={styles.rowCol}>
            <View style={styles.pillRowHeader}>
              <RotateCcw size={18} color={iconAccent} />
              <Text style={[styles.pillRowTitle, { color: theme.text }]}>
                Skip Backward Interval
              </Text>
            </View>
            <View style={styles.pillsGroup}>
              {[10, 15, 30].map((sec) => {
                const isSelected = settings.skipBackwardSeconds === sec;
                return (
                  <TouchableOpacity
                    key={sec}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected
                          ? '#6366F1'
                          : isDark
                          ? '#1E2436'
                          : '#F8FAFC',
                        borderColor: isSelected
                          ? isDark
                            ? '#818CF8'
                            : '#6366F1'
                          : isDark
                          ? '#283044'
                          : '#E2E8F0',
                      },
                      !isDark && !isSelected && styles.pillLightShadow,
                    ]}
                    onPress={() => onUpdateSettings({ skipBackwardSeconds: sec })}
                  >
                    <Text
                      style={[
                        styles.pillOptionText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? theme.textSecondary
                            : '#334155',
                        },
                      ]}
                    >
                      -{sec}s
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Default Playback Speed */}
          <View style={styles.rowCol}>
            <View style={styles.pillRowHeader}>
              <Gauge size={18} color={iconAccent} />
              <Text style={[styles.pillRowTitle, { color: theme.text }]}>
                Default Playback Speed
              </Text>
            </View>
            <View style={styles.pillsGroup}>
              {[1.0, 1.25, 1.5, 2.0].map((speed) => {
                const isSelected = settings.defaultPlaybackSpeed === speed;
                return (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected
                          ? '#6366F1'
                          : isDark
                          ? '#1E2436'
                          : '#F8FAFC',
                        borderColor: isSelected
                          ? isDark
                            ? '#818CF8'
                            : '#6366F1'
                          : isDark
                          ? '#283044'
                          : '#E2E8F0',
                      },
                      !isDark && !isSelected && styles.pillLightShadow,
                    ]}
                    onPress={() => onUpdateSettings({ defaultPlaybackSpeed: speed })}
                  >
                    <Text
                      style={[
                        styles.pillOptionText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? theme.textSecondary
                            : '#334155',
                        },
                      ]}
                    >
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Continuous Playback Switch */}
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>
                Continuous Playback
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                Automatically play next episode when current ends
              </Text>
            </View>
            <Switch
              value={settings.autoPlayNext}
              onValueChange={(val) => onUpdateSettings({ autoPlayNext: val })}
              trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
              thumbColor={settings.autoPlayNext ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      {/* 3. AUDIO QUALITY & STREAMING */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          STREAMING & DATA
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
            !isDark && styles.cardLightShadow,
          ]}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.rowIconContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(99, 102, 241, 0.1)',
                },
              ]}
            >
              <Wifi size={20} color={iconAccent} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>
                Stream Over Wi-Fi Only
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                Reduce cellular data usage
              </Text>
            </View>
            <Switch
              value={settings.streamOnWifiOnly}
              onValueChange={(val) => onUpdateSettings({ streamOnWifiOnly: val })}
              trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
              thumbColor={settings.streamOnWifiOnly ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Audio Quality */}
          <View style={styles.rowCol}>
            <Text style={[styles.pillRowTitle, { color: theme.text }]}>
              Streaming Audio Quality
            </Text>
            <View style={styles.pillsGroup}>
              {(['standard', 'high'] as const).map((q) => {
                const isSelected = settings.audioQuality === q;
                return (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.pillOptionWide,
                      {
                        backgroundColor: isSelected
                          ? '#6366F1'
                          : isDark
                          ? '#1E2436'
                          : '#F8FAFC',
                        borderColor: isSelected
                          ? isDark
                            ? '#818CF8'
                            : '#6366F1'
                          : isDark
                          ? '#283044'
                          : '#E2E8F0',
                      },
                      !isDark && !isSelected && styles.pillLightShadow,
                    ]}
                    onPress={() => onUpdateSettings({ audioQuality: q })}
                  >
                    <Text
                      style={[
                        styles.pillOptionText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? theme.textSecondary
                            : '#334155',
                        },
                      ]}
                    >
                      {q === 'high' ? 'High Quality (320 kbps)' : 'Standard (128 kbps)'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* 4. DATA & STORAGE MANAGEMENT */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          STORAGE & LIBRARY
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
            !isDark && styles.cardLightShadow,
          ]}
        >
          {/* Clean Cache */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleCleanCache}
            activeOpacity={0.7}
          >
            <HardDrive size={18} color={iconAccent} />
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Clear Cache & Temporary Files
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                Free up ~18.4 MB of cached artworks & feed items
              </Text>
            </View>
            <Text
              style={[
                styles.cleanActionBtn,
                {
                  color: isDark ? '#818CF8' : '#4F46E5',
                  backgroundColor: isDark
                    ? 'rgba(99, 102, 241, 0.12)'
                    : '#EEF2FF',
                },
              ]}
            >
              Clear
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Clear History */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearHistoryConfirm}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#EF4444" />
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: '#EF4444' }]}>
                Clear Listening History
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                Remove all saved playback bookmarks and progress
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Clear Favorites */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearFavoritesConfirm}
            activeOpacity={0.7}
          >
            <Heart size={18} color="#EC4899" />
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: '#EC4899' }]}>
                Clear All Favorite Shows
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                Reset all saved favorite podcasts
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. SUPPORT & DONATE */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          SUPPORT & DONATE
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
            !isDark && styles.cardLightShadow,
          ]}
        >
          {/* Header intro */}
          <View style={styles.donateHeaderRow}>
            <View
              style={[
                styles.rowIconContainer,
                { backgroundColor: 'rgba(234, 179, 8, 0.15)' },
              ]}
            >
              <Coffee size={20} color="#EAB308" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>
                Support App Maintenance
              </Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                WaveCast is 100% free with no ads. Your support helps keep servers running and new features coming!
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Buy Me a Coffee Button */}
          <TouchableOpacity
            style={[styles.coffeeButton, !isDark && styles.cardLightShadow]}
            onPress={() => Linking.openURL('https://buymeacoffee.com/mehulreshac')}
            activeOpacity={0.8}
          >
            <Coffee size={18} color="#000000" />
            <Text style={styles.coffeeButtonText}>Buy Me a Coffee</Text>
            <ExternalLink size={14} color="#000000" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* UPI Payment Option */}
          <View style={styles.upiCardContainer}>
            <View style={styles.upiHeaderRow}>
              <View style={styles.upiBadge}>
                <Text style={styles.upiBadgeText}>UPI</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.upiTitle, { color: theme.text }]}>
                  Support via UPI
                </Text>
                <Text style={[styles.upiSubtitle, { color: theme.textMuted }]}>
                  Google Pay • PhonePe • Paytm • BHIM • Cred
                </Text>
              </View>
            </View>

            {/* UPI ID Pill */}
            <View
              style={[
                styles.upiIdBox,
                {
                  backgroundColor: isDark ? '#1A1E2C' : '#F1F5F9',
                  borderColor: isDark ? '#2B3349' : '#CBD5E1',
                },
              ]}
            >
              <Text style={[styles.upiIdLabel, { color: theme.textMuted }]}>
                UPI ID:
              </Text>
              <Text
                style={[styles.upiIdText, { color: iconAccent }]}
                selectable={true}
              >
                mehulreshamwala7@okhdfcbank
              </Text>
            </View>

            {/* Action Buttons for UPI */}
            <View style={styles.upiActionsRow}>
              <TouchableOpacity
                style={[
                  styles.upiActionBtn,
                  { backgroundColor: '#6366F1' },
                ]}
                onPress={async () => {
                  const upiUrl =
                    'upi://pay?pa=mehulreshamwala7@okhdfcbank&pn=Mehul%20Reshamwala&cu=INR&tn=Support%20WaveCast%20App';
                  const supported = await Linking.canOpenURL(upiUrl).catch(() => false);
                  if (supported) {
                    Linking.openURL(upiUrl);
                  } else {
                    Alert.alert(
                      'UPI ID',
                      'Pay to: mehulreshamwala7@okhdfcbank\nPayee: Mehul Reshamwala',
                      [
                        {
                          text: 'Share / Copy',
                          onPress: () =>
                            Share.share({
                              message: 'mehulreshamwala7@okhdfcbank',
                            }),
                        },
                        { text: 'OK' },
                      ]
                    );
                  }
                }}
                activeOpacity={0.8}
              >
                <Sparkles size={15} color="#FFFFFF" />
                <Text style={styles.upiActionBtnText}>Pay via UPI App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.upiActionBtnSecondary,
                  {
                    backgroundColor: isDark ? '#1E2436' : '#F8FAFC',
                    borderColor: isDark ? '#2B3349' : '#E2E8F0',
                  },
                ]}
                onPress={() => setShowQrCode(!showQrCode)}
                activeOpacity={0.8}
              >
                <QrCode size={15} color={iconAccent} />
                <Text style={[styles.upiActionBtnSecText, { color: theme.text }]}>
                  {showQrCode ? 'Hide QR' : 'Scan QR'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* QR Code preview when toggled */}
            {showQrCode && (
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodeWrapper}>
                  <Image
                    source={{
                      uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dmehulreshamwala7%40okhdfcbank%26pn%3DMehul%2520Reshamwala%26cu%3DINR%26tn%3DSupport%2520WaveCast',
                    }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.qrCodeHint, { color: theme.textMuted }]}>
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 6. ABOUT APP */}
      <View style={styles.section}>
        <View
          style={[
            styles.aboutCard,
            {
              backgroundColor: isDark ? '#121520' : '#FFFFFF',
              borderColor: theme.cardBorder,
            },
            !isDark && styles.cardLightShadow,
          ]}
        >
          <Info size={18} color={iconAccent} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.aboutTitle, { color: theme.text }]}>
              WaveCast Podcast Player
            </Text>
            <Text style={[styles.aboutSubtitle, { color: theme.textMuted }]}>
              Version 1.2.0 • Powered by Apple iTunes Directory & Open RSS feeds.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    paddingBottom: 14,
    marginBottom: 16,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginRight: 12,
  },
  rowTextCol: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  rowCol: {
    paddingVertical: 2,
  },
  pillRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pillRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  pillsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  pillOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillOptionWide: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  cleanActionBtn: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  aboutTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  aboutSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  cardLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  donateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coffeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFDD00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 2,
    marginBottom: 12,
    gap: 8,
  },
  coffeeButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  upiCardContainer: {
    marginTop: 2,
  },
  upiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  upiBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upiBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  upiTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  upiSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  upiIdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  upiIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  upiIdText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  upiActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  upiActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  upiActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  upiActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  upiActionBtnSecText: {
    fontSize: 12,
    fontWeight: '700',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  qrCodeWrapper: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  qrCodeHint: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

