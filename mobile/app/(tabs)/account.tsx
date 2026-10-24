import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/theme/themeStore';
import { User as UserIcon, LogOut, MapPin, ChevronRight, Sun, Moon } from 'lucide-react-native';

export default function AccountScreen() {
  const router = useRouter();
  const { colors, mode, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <UserIcon size={48} color={colors.textMuted} />
          <Text style={[styles.promptTitle, { color: colors.text }]}>Welcome to MarketDash</Text>
          <Text style={[styles.promptSub, { color: colors.textMuted }]}>
            Sign in to manage your saved addresses and preferences.
          </Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[styles.primaryBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
              Sign In / Register
            </Text>
          </Pressable>

          {/* Theme Toggle Button */}
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeToggleCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {mode === 'dark' ? (
              <Sun size={20} color={colors.primary} />
            ) : (
              <Moon size={20} color={colors.text} />
            )}
            <Text style={[styles.themeToggleText, { color: colors.text }]}>
              Appearance: {mode === 'dark' ? 'Dark Gold Theme' : 'Light Gold Theme'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
            {user.phone && <Text style={[styles.userPhone, { color: colors.textMuted }]}>{user.phone}</Text>}
          </View>
        </View>

        {/* Account Menu Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={toggleTheme}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            {mode === 'dark' ? (
              <Sun size={20} color={colors.primary} />
            ) : (
              <Moon size={20} color={colors.text} />
            )}
            <Text style={[styles.menuText, { color: colors.text }]}>
              Theme: {mode === 'dark' ? 'Dark Gold Mode' : 'Light Gold Mode'}
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <MapPin size={20} color={colors.primary} />
            <Text style={[styles.menuText, { color: colors.text }]}>Saved Delivery Addresses</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={logout}>
            <LogOut size={20} color="#E53935" />
            <Text style={[styles.menuText, { color: '#E53935' }]}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    marginTop: 12,
  },
  promptSub: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeToggleCard: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  profileHeader: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
