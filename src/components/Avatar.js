import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../theme';

// Круг с фотографией (если передан uri) или с буквой
export default function Avatar({ letter, size = 44, dark = false, uri }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.grayDark }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: dark ? colors.black : colors.grayDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: dark ? colors.white : colors.black,
          fontWeight: '700',
          fontSize: size * 0.4,
        }}
      >
        {letter}
      </Text>
    </View>
  );
}
