import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import { api, photoUrl } from '../api';
import { colors, radius } from '../theme';

export default function CreateListingScreen({ navigation, route }) {
  const editing = route.params?.listing;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [want, setWant] = useState(editing?.want ?? '');
  const [categoryId, setCategoryId] = useState(editing?.category_id ?? null);
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);

  const [existing, setExisting] = useState(editing?.photos ?? []);
  const [picked, setPicked] = useState([]);
  const [removed, setRemoved] = useState([]);
  const MAX_PHOTOS = 5;
  const total = existing.length + picked.length;

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  async function pickPhotos() {
    const left = MAX_PHOTOS - total;
    if (left <= 0) {
      Alert.alert('Максимум ' + MAX_PHOTOS + ' фото');
      return;
    }
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: left,
        quality: 0.5,
        base64: true,
      });
      if (res.canceled) return;
      const added = res.assets.filter((a) => a.base64).map((a) => ({ uri: a.uri, base64: a.base64 }));
      setPicked((list) => [...list, ...added].slice(0, MAX_PHOTOS - existing.length));
    } catch (e) {
      Alert.alert('Не получилось выбрать фото', e.message);
    }
  }

  function removeExisting(photo) {
    setExisting((list) => list.filter((p) => p.id !== photo.id));
    setRemoved((list) => [...list, photo.id]);
  }

  function removePicked(index) {
    setPicked((list) => list.filter((_, i) => i !== index));
  }

  async function save() {
    setBusy(true);
    try {
      const data = { title, description, want, category_id: categoryId };
      let listingId;
      if (editing) {
        await api.updateListing(editing.id, data);
        listingId = editing.id;
      } else {
        const created = await api.createListing(data);
        listingId = created.id;
      }

      let failed = 0;
      for (const id of removed) {
        try {
          await api.deletePhoto(id);
        } catch (e) {
          failed += 1;
        }
      }
      for (const p of picked) {
        try {
          await api.addPhoto(listingId, p.base64);
        } catch (e) {
          failed += 1;
        }
      }
      const photoNote = failed > 0 ? `\n\nНе все фото удалось загрузить (${failed}). Добавьте их через «Изменить».` : '';

      if (editing) {
        Alert.alert('Сохранено', 'Изменения сохранены' + photoNote, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert(
          'Объявление отправлено',
          'Оно появится в ленте после проверки администратором.' + photoNote,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      Alert.alert('Не получилось', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>{editing ? 'Редактирование' : 'Новое объявление'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Фотографии ({total} из {MAX_PHOTOS})</Text>
          <View style={styles.photos}>
            {total < MAX_PHOTOS && (
              <Pressable style={styles.addPhoto} onPress={pickPhotos}>
                <Ionicons name="add" size={32} color={colors.black} />
              </Pressable>
            )}
            {existing.map((p) => (
              <View key={'e' + p.id}>
                <Image source={{ uri: photoUrl(p.url) }} style={styles.photo} />
                <Pressable style={styles.remove} onPress={() => removeExisting(p)} hitSlop={8}>
                  <Ionicons name="close" size={14} color={colors.white} />
                </Pressable>
              </View>
            ))}
            {picked.map((p, i) => (
              <View key={'p' + i}>
                <Image source={{ uri: p.uri }} style={styles.photo} />
                <Pressable style={styles.remove} onPress={() => removePicked(i)} hitSlop={8}>
                  <Ionicons name="close" size={14} color={colors.white} />
                </Pressable>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            placeholder="Например, худи Nike"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Категория</Text>
          <View style={styles.chips}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipActive]}
                onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
              >
                <Text style={[styles.chipText, categoryId === c.id && { color: colors.white }]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
            placeholder="Состояние, размер, детали…"
            placeholderTextColor={colors.muted}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Хочу взамен</Text>
          <TextInput
            style={styles.input}
            placeholder="Что хотите получить"
            placeholderTextColor={colors.muted}
            value={want}
            onChangeText={setWant}
          />

          <Button
            title={editing ? 'Сохранить' : 'Опубликовать'}
            onPress={save}
            disabled={busy}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  label: { color: colors.muted, fontSize: 12, marginTop: 14, marginBottom: 6 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addPhoto: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.black,
    backgroundColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: 80, height: 80, borderRadius: 10, backgroundColor: colors.gray },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.black,
  },
  chipActive: { backgroundColor: colors.black },
  chipText: { fontWeight: '600', fontSize: 13 },
});
