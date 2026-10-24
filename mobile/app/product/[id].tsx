import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Product } from '../../src/types';
import { api } from '../../src/services/api';
import { useCartStore } from '../../src/store/cartStore';
import { useThemeStore } from '../../src/theme/themeStore';
import { Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react-native';
import { getImageUrl } from '../../src/utils/image';
import { formatQuantityDisplay } from '../../src/utils/format';

const formatPrice = (val: any): string => {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, mode } = useThemeStore();
  const { addItem, getItemQuantity, getCartItemByProductId, updateQuantity } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data.success && response.data.data) {
          setProduct(response.data.data);
        }
      } catch (e) {
        console.warn('Failed to load product', e);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (isLoading || !product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const quantity = getItemQuantity(product.id);
  const cartItem = getCartItemByProductId(product.id);

  const imageUrl = getImageUrl(product.images);

  const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price) || '0');
  const numericComparePrice = product.compareAtPrice !== undefined && product.compareAtPrice !== null
    ? (typeof product.compareAtPrice === 'number' ? product.compareAtPrice : parseFloat(String(product.compareAtPrice)))
    : null;

  const isOnSale = !!(numericComparePrice && numericComparePrice > numericPrice);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar with Back Button */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {product.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Image */}
        <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceSecondary }]}>
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={200} />
          {isOnSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>SALE</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.unit, { color: colors.textMuted }]}>{product.unit}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>${formatPrice(product.price)}</Text>
            {isOnSale && (
              <Text style={[styles.compareAtPrice, { color: colors.textMuted }]}>
                ${formatPrice(product.compareAtPrice)}
              </Text>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionHeading, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{product.description || 'No description provided.'}</Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {quantity === 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => addItem(product, product.minQuantity || 1)}
          >
            <ShoppingBag size={20} color={mode === 'dark' ? '#121212' : '#FFFFFF'} />
            <Text style={[styles.addBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
              Add to Cart — ${formatPrice(product.price * (product.minQuantity || 1))}
            </Text>
          </Pressable>
        ) : (
          <View style={[styles.stepperBar, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Pressable
              style={[styles.stepperActionBtn, { backgroundColor: colors.surface }]}
              onPress={() => {
                if (cartItem) {
                  const step = product.stepQuantity || 1;
                  const min = product.minQuantity || 1;
                  const nextQty = Number((cartItem.quantity - step).toFixed(2));
                  if (nextQty < min - 0.001) {
                    updateQuantity(cartItem.id, 0);
                  } else {
                    updateQuantity(cartItem.id, nextQty);
                  }
                }
              }}
            >
              <Minus size={18} color={colors.primary} strokeWidth={3} />
            </Pressable>

            <Text style={[styles.stepperText, { color: colors.primary }]}>
              {formatQuantityDisplay(quantity, product.unit)} in Cart
            </Text>

            <Pressable
              style={[styles.stepperActionBtn, { backgroundColor: colors.surface }]}
              onPress={() => {
                if (cartItem) {
                  const step = product.stepQuantity || 1;
                  const nextQty = Number((cartItem.quantity + step).toFixed(2));
                  updateQuantity(cartItem.id, nextQty);
                }
              }}
            >
              <Plus size={18} color={colors.primary} strokeWidth={3} />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 20,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1.2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#E53935',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  saleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  detailsContainer: {
    padding: 20,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  compareAtPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  addBtn: {
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepperBar: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stepperActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
