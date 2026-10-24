import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../theme/themeStore';
import {
  MoreVertical,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Settings,
} from 'lucide-react-native';

export const HeaderOptionsMenu: React.FC = () => {
  const router = useRouter();
  const { colors, mode, toggleTheme } = useThemeStore();
  const [visible, setVisible] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
    setVisible(false);
  };

  const handleOpenAccount = () => {
    setVisible(false);
    router.push('/(tabs)/account');
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.iconBtn}
        hitSlop={8}
      >
        <MoreVertical size={22} color={colors.text} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menuDropdown,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Theme Toggle Item */}
                <Pressable
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={handleToggleTheme}
                >
                  {mode === 'dark' ? (
                    <Sun size={18} color={colors.primary} />
                  ) : (
                    <Moon size={18} color={colors.text} />
                  )}
                  <Text style={[styles.menuText, { color: colors.text }]}>
                    {mode === 'dark' ? 'Light Theme' : 'Dark Theme'}
                  </Text>
                </Pressable>

                {/* Notifications Item */}
                <Pressable
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={() => setVisible(false)}
                >
                  <Bell size={18} color={colors.primary} />
                  <Text style={[styles.menuText, { color: colors.text }]}>
                    Notifications
                  </Text>
                </Pressable>

                {/* Help Item */}
                <Pressable
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={() => setVisible(false)}
                >
                  <HelpCircle size={18} color={colors.primary} />
                  <Text style={[styles.menuText, { color: colors.text }]}>
                    Help & Support
                  </Text>
                </Pressable>

                {/* Settings Item */}
                <Pressable style={styles.menuItem} onPress={handleOpenAccount}>
                  <Settings size={18} color={colors.primary} />
                  <Text style={[styles.menuText, { color: colors.text }]}>
                    Account & Settings
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 16,
  },
  menuDropdown: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
