import { create } from 'zustand';
import { User } from '../types';
import { api, tokenStorage } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await tokenStorage.getItem('access_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await api.get('/users/profile');
      if (response.data.success) {
        set({ user: response.data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      await tokenStorage.removeItem('access_token');
      await tokenStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        await tokenStorage.setItem('access_token', accessToken);
        await tokenStorage.setItem('refresh_token', refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: response.data.message || 'Login failed', isLoading: false });
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password, phone) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/register', { name, email, password, phone });
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        await tokenStorage.setItem('access_token', accessToken);
        await tokenStorage.setItem('refresh_token', refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: response.data.message || 'Registration failed', isLoading: false });
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    } finally {
      await tokenStorage.removeItem('access_token');
      await tokenStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
