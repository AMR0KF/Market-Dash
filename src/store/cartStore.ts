import { create } from 'zustand';
import api from '../api';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  unit: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  estimatedDeliveryFee: number;
  estimatedTotal: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  estimatedDeliveryFee: 0,
  estimatedTotal: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const [cartRes, summaryRes] = await Promise.all([
        api.get('/cart'),
        api.get('/cart/summary')
      ]);
      
      set({ 
        items: cartRes.data.data?.items || [],
        itemCount: summaryRes.data.data.itemCount,
        subtotal: summaryRes.data.data.subtotal,
        estimatedDeliveryFee: summaryRes.data.data.estimatedDeliveryFee,
        estimatedTotal: summaryRes.data.data.estimatedTotal,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch cart', error);
      set({ isLoading: false });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    try {
      await api.post('/cart/add', { productId, quantity });
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to add item to cart', error);
      throw error;
    }
  },

  updateItem: async (cartItemId: string, quantity: number) => {
    try {
      await api.put(`/cart/items/${cartItemId}`, { quantity });
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update cart item', error);
      throw error;
    }
  },

  removeItem: async (cartItemId: string) => {
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove item from cart', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to clear cart', error);
      throw error;
    }
  }
}));
