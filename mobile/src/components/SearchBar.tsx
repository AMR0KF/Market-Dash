import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Search } from 'lucide-react-native';
import { useThemeStore } from '../theme/themeStore';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search products...',
  onPress,
  editable = true,
}) => {
  const { colors } = useThemeStore();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Search size={20} color={colors.textMuted} />
      </View>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  iconWrapper: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
});
