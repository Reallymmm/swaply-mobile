import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ListingCard from '../components/ListingCard';
import { api } from '../api';
import { colors } from '../theme';

export default function FeedScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      setItems(await api.feed(query, categoryId));
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }, [query, categoryId]);

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
        <Pressable
          style={[styles.filter, categoryId != null && styles.filterActive]}
          onPress={() => {
            setDraftId(categoryId);
            setFilterOpen(true);
          }}
        >
          <Text style={[styles.filterText, categoryId != null && { color: colors.white }]}>
            {categoryId != null ? 'Фильтры · 1' : 'Фильтры'}
          </Text>
        </Pressable>
      </View>

      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Категория</Text>
            <View style={styles.chips}>
              <Pressable
                style={[styles.chip, draftId == null && styles.chipActive]}
                onPress={() => setDraftId(null)}
              >
                <Text style={[styles.chipText, draftId == null && { color: colors.white }]}>Все</Text>
              </Pressable>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, draftId === c.id && styles.chipActive]}
                  onPress={() => setDraftId(draftId === c.id ? null : c.id)}
                >
                  <Text style={[styles.chipText, draftId === c.id && { color: colors.white }]}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sheetButtons}>
              <Pressable style={[styles.sheetBtn, styles.sheetBtnLight]} onPress={() => setDraftId(null)}>
                <Text style={styles.sheetBtnLightText}>Сбросить</Text>
              </Pressable>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnDark]}
                onPress={() => {
                  setCategoryId(draftId);
                  setFilterOpen(false);
                }}
              >
                <Text style={styles.sheetBtnDarkText}>Применить</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  filterActive: { backgroundColor: colors.black },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.black },
  chipActive: { backgroundColor: colors.black },
  chipText: { fontWeight: '600', fontSize: 13 },
  sheetButtons: { flexDirection: 'row', gap: 10, marginTop: 24 },
  sheetBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  sheetBtnLight: { borderWidth: 1.5, borderColor: colors.black },
  sheetBtnLightText: { fontWeight: '700' },
  sheetBtnDark: { backgroundColor: colors.black },
  sheetBtnDarkText: { fontWeight: '700', color: colors.white },
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
