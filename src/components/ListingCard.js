import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Photo from './Photo';
import { photoUrl } from '../api';
import { colors, radius } from '../theme';

// Карточка объявления для ленты
export default function ListingCard({ item, onPress, onToggleFavorite }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Photo style={styles.photo} uri={photoUrl(item.cover)} />
      <Pressable style={styles.heart} onPress={onToggleFavorite} hitSlop={10}>
        <Ionicons name={item.is_favorite ? 'heart' : 'heart-outline'} size={22} color={colors.black} />
      </Pressable>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.small}>Хочу: {item.want}</Text>
        <Text style={styles.small}>{item.city || item.author}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  photo: { height: 110, borderWidth: 0 },
  heart: { position: 'absolute', top: 8, right: 8 },
  info: { padding: 10 },
  title: { fontWeight: '700', fontSize: 14, marginBottom: 3 },
  small: { fontSize: 12, color: colors.muted },
});
