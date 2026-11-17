import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, StyleSheet, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Photo from '../components/Photo';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { api, photoUrl } from '../api';
import { formatDate, ratingText } from '../utils';
import { colors } from '../theme';

export default function ListingScreen({ navigation, route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [page, setPage] = useState(0); // номер фото, которое сейчас на экране
  const { width } = useWindowDimensions();
  const photoWidth = width - 32; // ширина экрана минус поля по 16 слева и справа

  useEffect(() => {
    api
      .listing(id)
      .then(setItem)
      .catch((e) => {
        Alert.alert('Ошибка', e.message);
        navigation.goBack();
      });
  }, [id]);

  async function toggleFavorite() {
    try {
      const res = await api.toggleFavorite(item.id);
      setItem({ ...item, is_favorite: res.is_favorite });
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }

  // создаём чат (или открываем существующий) и переходим в него
  async function writeToAuthor() {
    try {
      const chat = await api.openChat(item.id);
      navigation.navigate('Chat', { chatId: chat.id });
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }

  // открываем фотографии на весь экран, начиная с той, на которую нажали
  function openPhotos(index) {
    navigation.navigate('Photos', { urls: item.photos.map((p) => photoUrl(p.url)), index });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={colors.black} />
          <Text style={styles.backText}>Назад</Text>
        </Pressable>
        {item && (
          <Pressable onPress={toggleFavorite} hitSlop={10}>
            <Ionicons name={item.is_favorite ? 'heart' : 'heart-outline'} size={26} color={colors.black} />
          </Pressable>
        )}
      </View>

      {!item ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.black} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {item.photos.length > 0 ? (
              <View>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / photoWidth))}
                >
                  {item.photos.map((p, i) => (
                    <Pressable key={p.id} onPress={() => openPhotos(i)}>
                      <Image
                        source={{ uri: photoUrl(p.url) }}
                        style={[styles.photo, { width: photoWidth }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
                {item.photos.length > 1 && (
                  <View style={styles.counter}>
                    <Text style={styles.counterText}>{page + 1} / {item.photos.length}</Text>
                  </View>
                )}
              </View>
            ) : (
              <Photo style={styles.photo} size={48} />
            )}

            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.label}>Хочу взамен</Text>
            <Text style={styles.want}>{item.want || 'Не указано'}</Text>
            <Text style={styles.meta}>
              {[item.category, item.city, formatDate(item.created_at)].filter(Boolean).join(' · ')}
            </Text>

            {!!item.description && <Text style={styles.desc}>{item.description}</Text>}

            <Pressable style={styles.author} onPress={() => navigation.push('User', { id: item.author_id })}>
              <Avatar letter={item.author[0]} size={42} uri={photoUrl(item.author_avatar)} />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{item.author}</Text>
                <Text style={styles.meta}>
                  {ratingText(item.author_rating, item.author_reviews_count)} · Объявлений: {item.author_listings}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </ScrollView>

          <View style={styles.bottom}>
            {item.is_mine ? (
              <Text style={styles.mine}>Это ваше объявление</Text>
            ) : (
              <Button title="Написать автору" onPress={writeToAuthor} />
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  back: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 15 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  photo: { height: 260, borderRadius: 10 },
  counter: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 16 },
  label: { color: colors.muted, marginTop: 14, fontSize: 12 },
  want: { fontSize: 17, fontWeight: '700', marginTop: 2 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 6 },
  desc: { fontSize: 15, lineHeight: 22, marginTop: 14 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  authorName: { fontWeight: '700', fontSize: 15 },
  bottom: { padding: 16, borderTopWidth: 1, borderTopColor: colors.gray },
  mine: { textAlign: 'center', color: colors.muted, paddingVertical: 15 },
});
