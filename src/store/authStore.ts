import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

interface User {
  id: string;
  name: string;
  email: string;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
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
        localStorage.removeItem('marketdash_token');
        localStorage.removeItem('marketdash_refresh_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'marketdash-auth',
    }
  )
);
