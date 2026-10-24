import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useThemeStore } from '../theme/themeStore';

interface HorizontalProductRowProps {
  title: string;
  products: Product[];
  onViewAll?: () => void;
}

export const HorizontalProductRow: React.FC<HorizontalProductRowProps> = ({
  title,
  products,
  onViewAll,
}) => {
  const { colors } = useThemeStore();
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onViewAll && (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </Pressable>
        )}
      </View>

      {/* Horizontal Product Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
});
