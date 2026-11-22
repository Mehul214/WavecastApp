import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, Heart, Clock, Settings } from 'lucide-react-native';
import { Theme } from '../theme/theme';

export type TabType = 'discover' | 'favorites' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  favoritesCount: number;
  historyCount: number;
  theme?: Theme;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  historyCount,
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  const isDark = theme ? theme.isDark : true;
  const bgColor = isDark ? '#0F121C' : '#FFFFFF';
  const borderColor = isDark ? '#1E2436' : '#E2E8F0';
  const inactiveColor = isDark ? '#64748B' : '#94A3B8';
  const activeColor = '#6366F1';
  const activeTextColor = isDark ? '#818CF8' : '#4F46E5';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {/* Discover Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('discover')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Compass
            size={22}
            color={activeTab === 'discover' ? activeColor : inactiveColor}
            strokeWidth={activeTab === 'discover' ? 2.5 : 1.8}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'discover' ? activeTextColor : inactiveColor },
            activeTab === 'discover' && styles.tabLabelActive,
          ]}
        >
          Discover
        </Text>
      </TouchableOpacity>

      {/* Favorites Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('favorites')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Heart
            size={22}
            color={activeTab === 'favorites' ? '#EC4899' : inactiveColor}
            fill={activeTab === 'favorites' ? '#EC4899' : 'transparent'}
            strokeWidth={activeTab === 'favorites' ? 2 : 1.8}
          />
          {favoritesCount > 0 && (
            <View
              style={[
                styles.badge,
                { borderColor: bgColor },
              ]}
            >
              <Text style={styles.badgeText}>
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'favorites' ? '#EC4899' : inactiveColor },
            activeTab === 'favorites' && styles.tabLabelActive,
          ]}
        >
          Favorites
        </Text>
      </TouchableOpacity>

      {/* History Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('history')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Clock
            size={22}
            color={activeTab === 'history' ? activeColor : inactiveColor}
            strokeWidth={activeTab === 'history' ? 2.5 : 1.8}
          />
          {historyCount > 0 && (
            <View
              style={[
                styles.badge,
                styles.historyBadge,
                { borderColor: bgColor },
              ]}
            >
              <Text style={styles.badgeText}>
                {historyCount > 99 ? '99+' : historyCount}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'history' ? activeTextColor : inactiveColor },
            activeTab === 'history' && styles.tabLabelActive,
          ]}
        >
          History
        </Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('settings')}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Settings
            size={22}
            color={activeTab === 'settings' ? activeColor : inactiveColor}
            strokeWidth={activeTab === 'settings' ? 2.5 : 1.8}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'settings' ? activeTextColor : inactiveColor },
            activeTab === 'settings' && styles.tabLabelActive,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EC4899',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  historyBadge: {
    backgroundColor: '#6366F1',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
