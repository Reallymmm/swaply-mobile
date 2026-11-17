import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// Если передан uri - показываем настоящую фотографию, иначе серый квадрат-заглушку
export default function Photo({ style, size = 28, uri }) {
  if (uri) {
    return <Image source={{ uri }} style={[{ backgroundColor: colors.gray }, style]} resizeMode="cover" />;
  }
  return (
    <View
      style={[
        {
          backgroundColor: colors.gray,
          borderWidth: 1,
          borderColor: colors.grayDark,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Ionicons name="image-outline" size={size} color={colors.muted} />
    </View>
  );
}
