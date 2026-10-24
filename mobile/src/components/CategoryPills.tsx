import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { Category } from '../types';
import { useThemeStore } from '../theme/themeStore';

interface CategoryPillsProps {
  categories: Category[];
  selectedSlug?: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedSlug,
  onSelectCategory,
}) => {
  const { colors } = useThemeStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        onPress={() => onSelectCategory(null)}
        style={[
          styles.pill,
          !selectedSlug
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            !selectedSlug
              ? { color: colors.mode === 'dark' ? '#121212' : '#FFFFFF' }
              : { color: colors.textMuted },
          ]}
        >
          All Items
        </Text>
      </Pressable>

      {categories.map((cat) => {
        const isActive = selectedSlug === cat.slug;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelectCategory(cat.slug)}
            style={[
              styles.pill,
              isActive
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                isActive
                  ? { color: colors.mode === 'dark' ? '#121212' : '#FFFFFF' }
                  : { color: colors.textMuted },
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
