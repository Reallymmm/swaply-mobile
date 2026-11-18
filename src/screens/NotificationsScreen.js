import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { formatDateTime } from '../utils';
import { colors } from '../theme';

// Иконка по типу уведомления (такие же, как на всплывающей плашке)
function iconFor(kind) {
  if (kind === 'message') return 'chatbubble';
  if (kind === 'listing_approved') return 'checkmark-circle';
  return 'alert-circle';
}

// История уведомлений: сообщения и решения модерации, новые сверху
export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.notificationsHistory();
      setItems(res.items);
      setHasMore(res.has_more);
      // открыли историю - значит, уведомления (кроме сообщений) прочитаны; сообщения читаются в чатах
      api.readNotifications(['other']).catch(() => {});
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // догружаем старые уведомления, когда долистали до конца
  async function loadMore() {
    if (!hasMore || loadingMore || items.length === 0) return;
    setLoadingMore(true);
    try {
      const res = await api.notificationsHistory(items[items.length - 1].id);
      setItems((prev) => [...prev, ...res.items]);
      setHasMore(res.has_more);
    } catch (e) {
      // попробуем при следующей прокрутке
    } finally {
      setLoadingMore(false);
    }
  }

  function open(n) {
    if (n.kind === 'message' && n.chat_id) navigation.navigate('Chat', { chatId: n.chat_id });
    else if (n.listing_id) navigation.navigate('Listing', { id: n.listing_id });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={colors.black} />
        </Pressable>
        <Text style={styles.title}>Уведомления</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.black} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>Пока нет уведомлений</Text>}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={colors.black} /> : null}
          renderItem={({ item }) => {
            const tappable = (item.kind === 'message' && item.chat_id) || item.listing_id;
            return (
              <Pressable
                style={[styles.row, !item.is_read && styles.rowUnread]}
                onPress={() => open(item)}
                disabled={!tappable}
              >
                <View style={styles.iconWrap}>
                  <Ionicons name={iconFor(item.kind)} size={22} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                  {!!item.body && <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>}
                  <Text style={styles.rowTime}>{formatDateTime(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={styles.dot} />}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  title: { fontSize: 20, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  rowUnread: { backgroundColor: colors.gray },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontWeight: '700', fontSize: 15 },
  rowBody: { color: '#555555', fontSize: 13, marginTop: 2 },
  rowTime: { color: colors.muted, fontSize: 11, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e53935' },
});
