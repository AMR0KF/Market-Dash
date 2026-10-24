import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/theme/themeStore';
import { Order } from '../../src/types';
import { api } from '../../src/services/api';
import { ShoppingBag, RefreshCw } from 'lucide-react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const { colors, mode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await api.get('/orders/my-orders', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.data?.success && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.warn('Failed to load orders', e);
      if (e.name === 'CanceledError' || e.name === 'AbortError') {
        setErrorMsg('Order request timed out. Please try again.');
      } else {
        setErrorMsg('Unable to load orders at this moment.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ShoppingBag size={48} color={colors.textMuted} />
          <Text style={[styles.promptTitle, { color: colors.text }]}>Sign in to view orders</Text>
          <Text style={[styles.promptSub, { color: colors.textMuted }]}>Track your grocery deliveries in real time.</Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[styles.primaryBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
        >
          <ShoppingBag size={48} color={colors.textMuted} />
          <Text style={[styles.promptTitle, { color: colors.text, marginTop: 12 }]}>
            {errorMsg ? 'Notice' : 'No past orders yet'}
          </Text>
          <Text style={[styles.promptSub, { color: colors.textMuted }]}>
            {errorMsg || 'Your completed grocery orders will appear here.'}
          </Text>
          <Pressable
            style={[styles.retryBtn, { borderColor: colors.primary }]}
            onPress={fetchOrders}
          >
            <RefreshCw size={16} color={colors.primary} />
            <Text style={[styles.retryBtnText, { color: colors.primary }]}>Refresh Orders</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
        >
          {orders.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id.substring(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.statusText, { color: colors.primary }]}>{order.status}</Text>
                </View>
              </View>
              <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.orderFooter}>
                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total</Text>
                <Text style={[styles.totalPrice, { color: colors.primary }]}>${order.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  promptSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: '#1A9E5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusBadge: {
    backgroundColor: '#E8F7EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A9E5C',
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
