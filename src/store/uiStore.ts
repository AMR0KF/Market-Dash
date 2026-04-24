import { create } from 'zustand';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface UiState {
  isCartOpen: boolean;
  toggleCart: (isOpen?: boolean) => void;
  notification: Notification | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  toggleCart: (isOpen) => set((state) => ({ 
    isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen 
  })),
  
  notification: null,
  showNotification: (message, type = 'info') => {
    const id = Date.now();
    set({ notification: { message, type, id } });
    
    // Auto clear after 3 seconds
    setTimeout(() => {
      set((state) => {
        if (state.notification?.id === id) {
          return { notification: null };
        }
        return state;
      });
    }, 3000);
  },
  clearNotification: () => set({ notification: null }),
}));
