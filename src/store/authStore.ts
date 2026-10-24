import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  register: (data: { user: User; accessToken: string; refreshToken: string }) => void;
}

export const defaultCustomerUser: User = {
  id: 'user-alex-morgan',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 234-5678',
  role: 'CUSTOMER'
};

// Drop sign in mode: Ensure token exists in localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('marketdash_token')) {
    localStorage.setItem('marketdash_token', 'dev-customer-token');
    localStorage.setItem('marketdash_refresh_token', 'dev-customer-refresh-token');
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: defaultCustomerUser,
      token: typeof window !== 'undefined' ? (localStorage.getItem('marketdash_token') || 'dev-customer-token') : 'dev-customer-token',
      isAuthenticated: true,
      login: (data) => {
        localStorage.setItem('marketdash_token', data.accessToken);
        localStorage.setItem('marketdash_refresh_token', data.refreshToken);
        set({ user: data.user, token: data.accessToken, isAuthenticated: true });
      },
      register: (data) => {
        localStorage.setItem('marketdash_token', data.accessToken);
        localStorage.setItem('marketdash_refresh_token', data.refreshToken);
        set({ user: data.user, token: data.accessToken, isAuthenticated: true });
      },
      logout: () => {
        // Reset to null or allow re-entry
        localStorage.removeItem('marketdash_token');
        localStorage.removeItem('marketdash_refresh_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'marketdash-auth',
      // If previously stored as logged out, restore default customer for test mode
      merge: (persistedState: any, currentState) => {
        const hasExistingUser = persistedState?.user && persistedState?.token;
        return {
          ...currentState,
          ...persistedState,
          user: hasExistingUser ? persistedState.user : defaultCustomerUser,
          token: hasExistingUser ? persistedState.token : 'dev-customer-token',
          isAuthenticated: true, // Drop sign in for now
        };
      },
    }
  )
);
