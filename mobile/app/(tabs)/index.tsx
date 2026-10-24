import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  RefreshControl,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryPills } from '../../src/components/CategoryPills';
import { HorizontalProductRow } from '../../src/components/HorizontalProductRow';
import { BannerCarousel } from '../../src/components/BannerCarousel';
import { HeaderOptionsMenu } from '../../src/components/HeaderOptionsMenu';
import { AddressModal, Address } from '../../src/components/AddressModal';
import { Category, Product } from '../../src/types';
import { api } from '../../src/services/api';
import { useCartStore } from '../../src/store/cartStore';
import { useThemeStore } from '../../src/theme/themeStore';
import {
  ShoppingBag,
  MapPin,
  ChevronDown,
  Sparkles,
  Bell,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, mode } = useThemeStore();
  const { getCartCount } = useCartStore();
  const cartCount = getCartCount();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Address Modal & Selection State
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    id: '1',
    label: 'Home',
    street: '123 Main St, Apt 4B',
    city: 'New York, NY',
  });
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Smooth Animated Scroll Interpolation
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerRowHeight = scrollY.interpolate({
    inputRange: [0, 45],
    outputRange: [42, 0],
    extrapolate: 'clamp',
  });

  const headerRowOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
      ]);

      if (catRes.data.success && Array.isArray(catRes.data.data)) {
        setCategories(catRes.data.data);
      }
      if (prodRes.data.success) {
        const rawData = prodRes.data.data;
        const productList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
          ? rawData.data
          : [];
        setProducts(productList);
      }
    } catch (e) {
      console.warn('Error fetching home data', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Group products by category
  const getProductsForCategory = (catId: string) => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => p.categoryId === catId);
  };

  const filteredCategories = selectedCategory
    ? categories.filter((c) => c.slug === selectedCategory)
    : categories;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header Container */}
      <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {/* Row 1: Utility Bar (Address, Points, Notifications) - Smooth Interpolated Animation */}
        <Animated.View
          style={[
            styles.utilityRowAnimated,
            {
              height: headerRowHeight,
              opacity: headerRowOpacity,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.utilityRowInner}>
            {/* Address Selector Pill */}
            <Pressable
              onPress={() => setAddressModalVisible(true)}
              style={[styles.addressPill, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={6}
            >
              <MapPin size={15} color={colors.primary} />
              <View style={styles.addressTextWrapper}>
                <Text style={[styles.deliverLabel, { color: colors.textMuted }]}>Deliver to</Text>
                <Text style={[styles.addressLabel, { color: colors.text }]} numberOfLines={1}>
                  {selectedAddress.label} - {selectedAddress.street.split(',')[0]}
                </Text>
              </View>
              <ChevronDown size={14} color={colors.textMuted} />
            </Pressable>

            {/* Right Utility Controls: Reward Points & Notifications */}
            <View style={styles.utilityRightGroup}>
              {/* Rewards Badge */}
              <View style={[styles.pointsBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '44' }]}>
                <Sparkles size={13} color={colors.primary} />
                <Text style={[styles.pointsText, { color: colors.primary }]}>250 pts</Text>
              </View>

              {/* Notification Bell */}
              <Pressable style={styles.bellBtn} hitSlop={6}>
                <Bell size={19} color={colors.text} />
                <View style={[styles.bellDot, { backgroundColor: colors.primary }]} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Row 2: Sticky Main Search & Basket Row */}
        <View style={styles.mainSearchRow}>
          <View style={styles.searchWrapper}>
            <SearchBar
              editable={false}
              onPress={() => router.push('/(tabs)/search')}
            />
          </View>

          {/* Supermarket Basket Cart Button */}
          <Pressable
            onPress={() => router.push('/cart')}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <ShoppingBag size={22} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* 3-Dot Options Menu */}
          <HeaderOptionsMenu />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Index 0: Ads Carousel */}
        <BannerCarousel />

        {/* Index 1: Sticky Category Pills Row */}
        <View style={[styles.stickyCategoryWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <CategoryPills
            categories={categories}
            selectedSlug={selectedCategory}
            onSelectCategory={(slug) => setSelectedCategory(slug)}
          />
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          /* Index 2+: Category Sections */
          filteredCategories.map((category) => {
            const categoryProducts = getProductsForCategory(category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <HorizontalProductRow
                key={category.id}
                title={category.name}
                products={categoryProducts}
                onViewAll={() => router.push(`/category/${category.slug}`)}
              />
            );
          })
        )}
      </ScrollView>

      {/* Address Selection Modal */}
      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        selectedAddress={selectedAddress}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
  },
  utilityRowAnimated: {
    overflow: 'hidden',
  },
  utilityRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
    height: 42,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    maxWidth: '65%',
  },
  addressTextWrapper: {
    flexDirection: 'column',
  },
  deliverLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  utilityRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bellBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  mainSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stickyCategoryWrapper: {
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});

