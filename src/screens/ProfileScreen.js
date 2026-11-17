import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Photo from '../components/Photo';
import { api, setToken, photoUrl } from '../api';
import { STATUS_NAMES, ratingText } from '../utils';
import { colors } from '../theme';

export default function ProfileScreen({ navigation }) {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null); // публичный профиль: рейтинг и отзывы

  const load = useCallback(async () => {
    try {
      const [user, listings] = await Promise.all([api.me(), api.myListings()]);
      setMe(user);
      setItems(listings);
      try {
        setProfile(await api.user(user.id));
      } catch (e) {
        // рейтинг не критичен, остальной профиль показываем
      }
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleHidden(id) {
    try {
      await api.toggleHidden(id);
      await load();
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  }

  // выбираем фото в галерее и ставим его на аватарку
  async function pickAvatar() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // можно обрезать под квадрат
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (res.canceled || !res.assets[0]?.base64) return;
      setMe(await api.setAvatar(res.assets[0].base64));
    } catch (e) {
      Alert.alert('Не удалось сменить фото', e.message);
    }
  }

  function logout() {
    setToken(null);
    navigation.getParent().replace('Login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Профиль</Text>

        <View style={styles.userRow}>
          <Pressable onPress={pickAvatar}>
            <Avatar letter={me ? me.name[0] : '…'} size={76} uri={me ? photoUrl(me.avatar) : null} />
          </Pressable>
          <View>
            <Text style={styles.name}>{me ? me.name : ''}</Text>
            <Text style={styles.meta}>{me ? me.email : ''}</Text>
            {profile && (
              <Pressable onPress={() => navigation.navigate('User', { id: me.id })}>
                <Text style={styles.meta}>{ratingText(profile.rating, profile.reviews_count)} · мои отзывы</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Button
          title="Сменить фото профиля"
          variant="outline"
          small
          style={{ marginTop: 16, paddingVertical: 11 }}
          onPress={pickAvatar}
        />

        <Text style={styles.section}>Мои объявления ({items.length})</Text>

        {items.length === 0 && <Text style={styles.meta}>Пока нет объявлений</Text>}

        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Photo style={styles.photo} size={20} uri={photoUrl(item.cover)} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>{STATUS_NAMES[item.status]}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <Button
                title="Изменить"
                variant="outline"
                small
                onPress={() => navigation.navigate('CreateListing', { listing: item })}
              />
              {(item.status === 'active' || item.status === 'hidden') && (
                <Button
                  title={item.status === 'hidden' ? 'Показать' : 'Скрыть'}
                  variant="outline"
                  small
                  onPress={() => toggleHidden(item.id)}
                />
              )}
            </View>
          </View>
        ))}

        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  name: { fontSize: 20, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 26, marginBottom: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  photo: { width: 56, height: 56, borderRadius: 8 },
  itemTitle: { fontWeight: '700', fontSize: 14 },
  logout: { alignItems: 'center', marginTop: 30, paddingVertical: 12 },
  logoutText: { color: colors.muted },
});
