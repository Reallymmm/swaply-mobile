import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Photo from '../components/Photo';
import { api } from '../api';
import { colors } from '../theme';

export default function FavoritesScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      api.favorites().then(setItems).catch((e) => Alert.alert('Ошибка', e.message));
    }, [])
  );

  async function remove(id) {
    try {
      await api.toggleFavorite(id);
      setItems((list) => list.filter((x) => x.id !== id));
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Избранное</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>В избранном пока пусто</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Listing', { id: item.id })}>
            <Photo style={styles.photo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.meta}>Хочу: {item.want || 'не указано'}</Text>
              <Text style={styles.meta}>{item.city || item.author}</Text>
            </View>
            <Pressable onPress={() => remove(item.id)} hitSlop={10}>
              <Ionicons name="heart" size={24} color={colors.black} />
            </Pressable>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  title: { fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingVertical: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  photo: { width: 70, height: 70, borderRadius: 8 },
  name: { fontWeight: '700', fontSize: 15, marginBottom: 3 },
  meta: { color: colors.muted, fontSize: 12 },
});
