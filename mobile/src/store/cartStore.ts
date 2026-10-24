import { create } from 'zustand';
import { CartItem, Product } from '../types';
import { api } from '../services/api';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  getCartItemByProductId: (productId: string) => CartItem | undefined;
  getCartCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/cart');
      if (response.data.success && response.data.data?.items) {
        set({ items: response.data.data.items, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const existing = get().getCartItemByProductId(product.id);
    if (existing) {
      await get().updateQuantity(existing.id, Number((existing.quantity + quantity).toFixed(2)));
      return;
    }

    const tempCartItem: CartItem = {
      id: `temp-${Date.now()}`,
      cartId: 'temp',
      productId: product.id,
      quantity,
      product,
    };

    set((state) => ({ items: [...state.items, tempCartItem] }));

    try {
      const response = await api.post('/cart/add', { productId: product.id, quantity });
      if (response.data.success && response.data.data?.items) {
        set({ items: response.data.data.items });
      }
    } catch (e) {
      console.warn('Backend cart sync bypassed (Guest Mode)', e);
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(cartItemId);
      return;
    }

    set((state) => ({
      items: state.items.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)),
    }));

    try {
      const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
      if (response.data.success && response.data.data?.items) {
        set({ items: response.data.data.items });
      }
    } catch (e) {
      console.warn('Backend cart sync bypassed (Guest Mode)', e);
    }
  },

  removeItem: async (cartItemId) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== cartItemId) }));

    try {
      const response = await api.delete(`/cart/items/${cartItemId}`);
      if (response.data.success && response.data.data?.items) {
        set({ items: response.data.data.items });
      }
    } catch (e) {
      console.warn('Backend cart sync bypassed (Guest Mode)', e);
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await api.delete('/cart');
    } catch (e) {
      console.warn('Backend cart clear error', e);
    }
  },

  getItemQuantity: (productId: string) => {
    const item = get().items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  },

  getCartItemByProductId: (productId: string) => {
    return get().items.find((i) => i.productId === productId);
  },

  getCartCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  },
}));
