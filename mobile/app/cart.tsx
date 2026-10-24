import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/store/cartStore';
import { useAuthStore } from '../src/store/authStore';
import { useThemeStore } from '../src/theme/themeStore';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react-native';

import { getImageUrl } from '../src/utils/image';
import { formatQuantityDisplay } from '../src/utils/format';

export default function CartScreen() {
  const router = useRouter();
  const { colors, mode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { items, fetchCart, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 0 ? 3.99 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Explore our fresh groceries and add items to your cart.
          </Text>
          <Pressable
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={[styles.exploreBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
              Start Shopping
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cart Item List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cart Items ({items.length})</Text>
            <Pressable onPress={clearCart}>
              <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
            </Pressable>
          </View>

          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const imageUrl = getImageUrl(product.images);

            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Image source={{ uri: imageUrl }} style={styles.itemImage} contentFit="cover" />

                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.itemUnit, { color: colors.textMuted }]}>{product.unit}</Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    ${(product.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                {/* Stepper Controls */}
                <View
                  style={[
                    styles.stepperContainer,
                    { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  ]}
                >
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - (product.stepQuantity || 1))}
                  >
                    {item.quantity <= (product.minQuantity || 1) ? (
                      <Trash2 size={14} color="#E53935" />
                    ) : (
                      <Minus size={14} color={colors.primary} strokeWidth={3} />
                    )}
                  </Pressable>

                  <Text style={[styles.stepperCount, { color: colors.primary }]}>
                    {formatQuantityDisplay(item.quantity, product.unit)}
                  </Text>

                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + (product.stepQuantity || 1))}
                  >
                    <Plus size={14} color={colors.primary} strokeWidth={3} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Estimated Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.grandTotalValue, { color: colors.primary }]}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Action Button */}
      <View
        style={[
          styles.checkoutBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
        >
          <Text style={[styles.checkoutBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
            Proceed to Checkout
          </Text>
          <Text style={[styles.checkoutBtnPrice, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
            ${grandTotal.toFixed(2)}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#1A9E5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  clearText: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A9E5C',
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7EF',
    borderRadius: 16,
    paddingHorizontal: 4,
    height: 32,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A9E5C',
    marginHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A9E5C',
  },
  checkoutBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  checkoutBtn: {
    height: 50,
    backgroundColor: '#1A9E5C',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutBtnPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
