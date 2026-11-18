import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Modal, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Photo from '../components/Photo';
import { api, setToken, photoUrl } from '../api';
import { STATUS_NAMES, ratingText } from '../utils';
import { useNotifications } from '../notifications';
import { colors } from '../theme';

export default function ProfileScreen({ navigation }) {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null); // публичный профиль: рейтинг и отзывы
  const { unreadOther } = useNotifications(); // непрочитанные уведомления для колокольчика

  // окно смены местоположения
  const [cityOpen, setCityOpen] = useState(false);
  const [cityDraft, setCityDraft] = useState('');
  const [savingCity, setSavingCity] = useState(false);

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

  function openCity() {
    setCityDraft(me?.city || '');
    setCityOpen(true);
  }

  async function saveCity() {
    setSavingCity(true);
    try {
      setMe(await api.setCity(cityDraft.trim()));
      setCityOpen(false);
    } catch (e) {
      Alert.alert('Не удалось сохранить', e.message);
    } finally {
      setSavingCity(false);
    }
  }

  function logout() {
    setToken(null);
    navigation.getParent().replace('Login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Профиль</Text>
          {/* колокольчик: история уведомлений, на нём число непрочитанных */}
          <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={10}>
            <Ionicons name="notifications-outline" size={26} color={colors.black} />
            {unreadOther > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadOther > 9 ? '9+' : unreadOther}</Text>
              </View>
            )}
          </Pressable>
        </View>

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

        <Pressable style={styles.cityRow} onPress={openCity}>
          <Ionicons name="location-outline" size={22} color={colors.black} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cityLabel}>Местоположение</Text>
            <Text style={styles.cityValue}>{me ? me.city || 'Не указано' : ''}</Text>
          </View>
          <Text style={styles.cityEdit}>Изменить</Text>
        </Pressable>

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

      <Modal visible={cityOpen} transparent animationType="fade" onRequestClose={() => setCityOpen(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Ваше местоположение</Text>
            <Text style={styles.meta}>Город увидят другие пользователи в вашем профиле и в ваших объявлениях</Text>
            <TextInput
              style={styles.input}
              placeholder="Например, Москва"
              placeholderTextColor={colors.muted}
              value={cityDraft}
              onChangeText={setCityDraft}
              maxLength={100}
              autoFocus
              onSubmitEditing={saveCity}
            />
            <View style={styles.dialogButtons}>
              <Button title="Отмена" variant="outline" onPress={() => setCityOpen(false)} style={{ flex: 1 }} />
              <Button title="Сохранить" onPress={saveCity} disabled={savingCity} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: 12,
  },
  cityLabel: { color: colors.muted, fontSize: 12 },
  cityValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  cityEdit: { fontWeight: '700', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '800' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginTop: 14,
  },
  dialogButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
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
