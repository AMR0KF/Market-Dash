import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Preparing' | 'Out for Delivery' | 'Delivered';
}

interface OrderState {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (items, total) => {
        const newOrder: Order = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          items: [...items],
          total,
          status: 'Preparing',
        };
        set({ orders: [newOrder, ...get().orders] });
      },
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'marketdash-orders',
    }
  )
);
