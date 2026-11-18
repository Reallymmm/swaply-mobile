import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function Button({ title, onPress, variant = 'primary', small = false, disabled = false, style }) {
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        small ? styles.small : styles.big,
        outline ? styles.outline : styles.primary,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.text, small && styles.textSmall, outline && { color: colors.black }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius },
  big: { paddingVertical: 15 },
  small: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  primary: { backgroundColor: colors.black },
  outline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.black },
  text: { color: colors.white, fontSize: 16, fontWeight: '700' },
  textSmall: { fontSize: 13 },
});
