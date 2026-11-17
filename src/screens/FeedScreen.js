import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ListingCard from '../components/ListingCard';
import { api } from '../api';
import { colors } from '../theme';

export default function FeedScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState(''); // что набрано в поиске
  const [query, setQuery] = useState(''); // что реально ищем (после нажатия "поиск")
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api.feed(query));
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }, [query]);

  // загружаем ленту каждый раз, когда экран открывается
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function toggleFavorite(id) {
    try {
      const res = await api.toggleFavorite(id);
      setItems((list) => list.map((x) => (x.id === id ? { ...x, is_favorite: res.is_favorite } : x)));
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Swaply</Text>
        <Pressable onPress={refresh} hitSlop={10} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={colors.black} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск объявлений"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => setQuery(text)}
            returnKeyType="search"
          />
        </View>
        <Pressable style={styles.filter}>
          <Text style={styles.filterText}>Фильтры</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={<Text style={styles.empty}>Ничего не найдено</Text>}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() => navigation.navigate('Listing', { id: item.id })}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateListing')}>
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  refreshBtn: { padding: 4 },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  filter: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: 10,
  },
  filterText: { fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 90, gap: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
