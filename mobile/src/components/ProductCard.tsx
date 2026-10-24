import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { Plus, Minus } from 'lucide-react-native';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../theme/themeStore';
import { getImageUrl } from '../utils/image';
import { formatQuantityDisplay } from '../utils/format';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { getItemQuantity, getCartItemByProductId, addItem, updateQuantity } = useCartStore();

  const quantity = getItemQuantity(product.id);
  const cartItem = getCartItemByProductId(product.id);

  const imageUrl = getImageUrl(product.images);

  const anim = useRef(new Animated.Value(quantity > 0 ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: quantity > 0 ? 1 : 0,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [quantity]);

  const containerWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 94],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5C158', '#121212'],
  });

  const minusScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const textOpacity = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  const handlePressCard = () => {
    router.push(`/product/${product.id}`);
  };

  const minQty = product.minQuantity || 1;
  const stepQty = product.stepQuantity || 1;

  const handleAdd = (e: any) => {
    e?.stopPropagation?.();
    addItem(product, minQty);
  };

  const handleIncrement = (e: any) => {
    e?.stopPropagation?.();
    if (cartItem) {
      const nextQty = Number((cartItem.quantity + stepQty).toFixed(2));
      updateQuantity(cartItem.id, nextQty);
    }
  };

  const handleDecrement = (e: any) => {
    e?.stopPropagation?.();
    if (cartItem) {
      const nextQty = Number((cartItem.quantity - stepQty).toFixed(2));
      if (nextQty < minQty - 0.001) {
        updateQuantity(cartItem.id, 0);
      } else {
        updateQuantity(cartItem.id, nextQty);
      }
    }
  };

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Pressable onPress={handlePressCard} style={styles.clickableArea}>
        {/* Image Container */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          {/* Sale Badge */}
          {isOnSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}
        </View>

        {/* Content Top Area */}
        <View style={styles.contentTop}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.unit, { color: colors.textMuted }]}>{product.unit}</Text>
        </View>
      </Pressable>

      {/* Price & Action Row */}
      <View style={styles.priceRow}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.text }]}>${product.price.toFixed(2)}</Text>
          {isOnSale && (
            <Text style={[styles.compareAtPrice, { color: colors.textMuted }]}>
              ${product.compareAtPrice?.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Animated 140ms Ease Unfold Stepper Controller */}
        <Animated.View
          style={[
            styles.stepperContainer,
            {
              width: containerWidth,
              backgroundColor,
              justifyContent: quantity > 0 ? 'space-between' : 'center',
            },
          ]}
        >
          {quantity > 0 && (
            <Animated.View
              style={{
                opacity: anim,
                transform: [{ scale: minusScale }],
              }}
            >
              <Pressable
                onPress={handleDecrement}
                style={styles.iconBtn}
                hitSlop={6}
              >
                <Minus size={15} color={colors.primary} strokeWidth={3} />
              </Pressable>
            </Animated.View>
          )}

          {quantity > 0 && (
            <Animated.Text
              style={[
                styles.stepperCount,
                { color: colors.primary, fontWeight: '700', opacity: textOpacity },
              ]}
              numberOfLines={1}
            >
              {formatQuantityDisplay(quantity, product.unit)}
            </Animated.Text>
          )}

          <Pressable
            onPress={quantity === 0 ? handleAdd : handleIncrement}
            style={quantity === 0 ? [styles.initialAddBtn, { backgroundColor: colors.primary }] : styles.iconBtn}
            hitSlop={6}
          >
            <Plus size={quantity === 0 ? 16 : 15} color={quantity === 0 ? "#121212" : colors.primary} strokeWidth={3} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 165,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E53935',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clickableArea: {
    width: '100%',
  },
  contentTop: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 38,
    lineHeight: 18,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  priceRow: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  compareAtPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  solidAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 4,
    height: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  initialAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 2,
  },
});
