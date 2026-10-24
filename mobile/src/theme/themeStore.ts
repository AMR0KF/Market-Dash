import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  border: string;
  card: string;
  statusSuccess: string;
  saleBadge: string;
}

export const lightColors: ThemeColors = {
  mode: 'light',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  text: '#121212',
  textMuted: '#6B7280',
  primary: '#D4AF37', // Gold
  primaryHover: '#C5A028',
  primaryLight: '#FFF9E6',
  border: '#E5E7EB',
  card: '#FFFFFF',
  statusSuccess: '#10B981',
  saleBadge: '#EF4444',
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  background: '#121212',
  surface: '#1E1E22',
  surfaceSecondary: '#27272A',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  primary: '#E5C158', // Bright Gold for dark mode contrast
  primaryHover: '#D4AF37',
  primaryLight: '#2D2716',
  border: '#27272A',
  card: '#1E1E22',
  statusSuccess: '#34D399',
  saleBadge: '#F87171',
};

const THEME_STORAGE_KEY = 'marketdash_theme_mode';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: lightColors,

  toggleTheme: async () => {
    const nextMode = get().mode === 'light' ? 'dark' : 'light';
    get().setMode(nextMode);
  },

  setMode: async (mode: ThemeMode) => {
    const colors = mode === 'dark' ? darkColors : lightColors;
    set({ mode, colors });

    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(THEME_STORAGE_KEY, mode);
        }
      } else {
        await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
      }
    } catch (e) {
      console.warn('Failed to persist theme mode', e);
    }
  },

  loadTheme: async () => {
    try {
      let savedMode: string | null = null;
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          savedMode = localStorage.getItem(THEME_STORAGE_KEY);
        }
      } else {
        savedMode = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      }

      if (savedMode === 'dark' || savedMode === 'light') {
        set({
          mode: savedMode as ThemeMode,
          colors: savedMode === 'dark' ? darkColors : lightColors,
        });
      }
    } catch (e) {
      console.warn('Failed to load persisted theme', e);
    }
  },
}));
