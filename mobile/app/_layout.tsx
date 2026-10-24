import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { useCartStore } from '../src/store/cartStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ presentation: 'modal', title: 'Sign In' }} />
        <Stack.Screen name="(auth)/register" options={{ presentation: 'modal', title: 'Create Account' }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Product Details' }} />
        <Stack.Screen name="cart" options={{ headerShown: true, title: 'My Cart' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      </Stack>
    </QueryClientProvider>
  );
}
