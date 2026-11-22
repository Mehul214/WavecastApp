import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '../theme/theme';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  theme?: Theme;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
}) => {
  const isDark = theme ? theme.isDark : true;
  const inactiveBg = isDark ? '#1E2230' : '#FFFFFF';
  const inactiveBorder = isDark ? '#2A3045' : '#E2E8F0';
  const inactiveTextColor = isDark ? '#94A3B8' : '#475569';
  const activeBg = '#6366F1';
  const activeBorder = isDark ? '#818CF8' : '#6366F1';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? activeBg : inactiveBg,
                  borderColor: isSelected ? activeBorder : inactiveBorder,
                },
                !isDark && !isSelected && styles.pillLightShadow,
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? '#FFFFFF' : inactiveTextColor,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillLightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillText: {
    fontSize: 13,
  },
});

