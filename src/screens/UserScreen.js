import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import ListingCard from '../components/ListingCard';
import { api, photoUrl } from '../api';
import { formatDate, ratingText } from '../utils';
import { colors } from '../theme';

// Профиль пользователя: данные, рейтинг, отзывы и его объявления
export default function UserScreen({ navigation, route }) {
  const { id } = route.params;
  const [user, setUser] = useState(null);

  // загружаем каждый раз, когда экран открывается (в том числе после написания отзыва)
  useFocusEffect(
    useCallback(() => {
      api
        .user(id)
        .then(setUser)
        .catch((e) => {
          Alert.alert('Ошибка', e.message);
          navigation.goBack();
        });
    }, [id])
  );

  async function toggleFavorite(listingId) {
    try {
      const res = await api.toggleFavorite(listingId);
      setUser((u) => ({
        ...u,
        listings: u.listings.map((x) => (x.id === listingId ? { ...x, is_favorite: res.is_favorite } : x)),
      }));
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }

  const header = user && (
    <View>
      <View style={styles.head}>
        <Avatar letter={user.name[0]} size={84} uri={photoUrl(user.avatar)} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.meta}>
          {[user.city, 'на Swaply с ' + formatDate(user.created_at)].filter(Boolean).join(' · ')}
        </Text>
        <Text style={styles.rating}>{ratingText(user.rating, user.reviews_count)}</Text>
        {user.can_review && (
          <Button
            title={user.my_review ? 'Изменить мой отзыв' : 'Оставить отзыв'}
            variant="outline"
            small
            style={{ marginTop: 12, paddingVertical: 10, paddingHorizontal: 20 }}
            onPress={() =>
              navigation.navigate('Review', { userId: user.id, name: user.name, current: user.my_review })
            }
          />
        )}
      </View>

      <Text style={styles.section}>Отзывы ({user.reviews_count})</Text>
      {user.reviews.length === 0 && <Text style={styles.empty}>Пока нет отзывов</Text>}
      {user.reviews.map((r) => (
        <View key={r.id} style={styles.review}>
          <Avatar letter={r.author[0]} size={34} uri={photoUrl(r.author_avatar)} />
          <View style={{ flex: 1 }}>
            <View style={styles.reviewTop}>
              <Text style={styles.reviewAuthor}>{r.author}{r.mine ? ' (вы)' : ''}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons key={n} name={n <= r.rating ? 'star' : 'star-outline'} size={13} color="#f5a623" />
                ))}
              </View>
            </View>
            {!!r.text && <Text style={styles.reviewText}>{r.text}</Text>}
            <Text style={styles.reviewDate}>{formatDate(r.created_at)}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Объявления ({user.listings_count})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={colors.black} />
          <Text style={styles.backText}>Назад</Text>
        </Pressable>
      </View>

      {!user ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.black} />
      ) : (
        <FlatList
          data={user.listings}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          ListEmptyComponent={<Text style={styles.empty}>Пока нет активных объявлений</Text>}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.push('Listing', { id: item.id })}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  top: { paddingHorizontal: 12, paddingVertical: 8 },
  back: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },
  head: { alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  rating: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  empty: { textAlign: 'center', color: colors.muted, marginVertical: 10 },
  review: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.gray },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { fontWeight: '700', fontSize: 13 },
  starsRow: { flexDirection: 'row' },
  reviewText: { fontSize: 13, marginTop: 4 },
  reviewDate: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
