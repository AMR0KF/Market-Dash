import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import { Tag, Sparkles, Zap, ShoppingBag } from 'lucide-react-native';

export interface BannerAd {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  icon: React.ReactNode;
}

const DEFAULT_BANNERS: BannerAd[] = [
  {
    id: '1',
    title: 'Fresh Groceries Delivered',
    subtitle: 'Get 20% off your first order with code FRESH20',
    tag: 'LIMITED OFFER',
    ctaText: 'Shop Now',
    bgGradientStart: '#121212',
    bgGradientEnd: '#2D2716',
    icon: <Tag size={20} color="#E5C158" />,
  },
  {
    id: '2',
    title: 'Gold Member Specials',
    subtitle: 'Earn 2x reward points on all organic produce',
    tag: 'GOLD REWARDS',
    ctaText: 'Explore Deals',
    bgGradientStart: '#2A2208',
    bgGradientEnd: '#121212',
    icon: <Sparkles size={20} color="#E5C158" />,
  },
  {
    id: '3',
    title: 'Same-Day Express Delivery',
    subtitle: 'Order before 2 PM for doorstep delivery within 2 hrs',
    tag: 'FAST SHIPPING',
    ctaText: 'Order Express',
    bgGradientStart: '#18181B',
    bgGradientEnd: '#33290D',
    icon: <Zap size={20} color="#E5C158" />,
  },
  {
    id: '4',
    title: 'Artisan Bakery Daily',
    subtitle: 'Freshly baked sourdough, croissants & pastries',
    tag: 'NEW ARRIVALS',
    ctaText: 'View Bakery',
    bgGradientStart: '#27272A',
    bgGradientEnd: '#1F1A0A',
    icon: <ShoppingBag size={20} color="#E5C158" />,
  },
];

interface BannerCarouselProps {
  onPressBanner?: (banner: BannerAd) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onPressBanner }) => {
  const { colors } = useThemeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 32);
  const isUserInteracting = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const CARD_GAP = 12;
  const cardWidth = Math.max(containerWidth - CARD_GAP, 200);
  const slideStep = cardWidth + CARD_GAP;

  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserInteracting.current) return;
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % DEFAULT_BANNERS.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * slideStep,
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [slideStep]);

  const handleInteractionStart = () => {
    isUserInteracting.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleInteractionEnd = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 4000);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    if (slideStep > 0) {
      const index = Math.min(
        Math.max(0, Math.round(contentOffset / slideStep)),
        DEFAULT_BANNERS.length - 1
      );
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setContainerWidth(w);
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleInteractionStart}
        onScrollEndDrag={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMomentumScrollEnd={handleInteractionEnd}
        snapToInterval={slideStep}
        decelerationRate="fast"
        nestedScrollEnabled
      >
        {DEFAULT_BANNERS.map((banner, index) => (
          <Pressable
            key={banner.id}
            style={[
              styles.cardContainer,
              {
                width: cardWidth,
                marginRight: index === DEFAULT_BANNERS.length - 1 ? 0 : CARD_GAP,
                backgroundColor: banner.bgGradientStart,
                borderColor: colors.primary + '55',
              },
            ]}
            onPress={() => onPressBanner?.(banner)}
          >
            <View style={styles.contentArea}>
              <View style={styles.topRow}>
                <View style={[styles.badge, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
                  {banner.icon}
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{banner.tag}</Text>
                </View>
              </View>

              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>

              <View style={styles.bottomRow}>
                <View style={[styles.ctaButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.ctaText}>{banner.ctaText}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {DEFAULT_BANNERS.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              handleInteractionStart();
              setActiveIndex(i);
              scrollViewRef.current?.scrollTo({ x: i * slideStep, animated: true });
              handleInteractionEnd();
            }}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.primary : colors.border,
                width: i === activeIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 14,
  },
  cardContainer: {
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: 16,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    color: '#E4E4E7',
    fontSize: 12,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ctaButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ctaText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
