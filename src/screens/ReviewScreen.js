import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { api } from '../api';
import { colors } from '../theme';

// Отзыв о продавце: оценка звёздами и текст
export default function ReviewScreen({ navigation, route }) {
  const { userId, name, current } = route.params; // current - прежний отзыв, если он уже есть
  const [rating, setRating] = useState(current?.rating ?? 0);
  const [text, setText] = useState(current?.text ?? '');
  const [busy, setBusy] = useState(false);

  async function send() {
    if (rating === 0) {
      Alert.alert('Поставьте оценку', 'Нажмите на одну из звёзд.');
      return;
    }
    setBusy(true);
    try {
      await api.review(userId, rating, text);
      Alert.alert('Спасибо!', 'Отзыв сохранён.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>Отмена</Text>
          </Pressable>
          <Text style={styles.title}>Отзыв</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.about}>Продавец: {name}</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={40} color={n <= rating ? '#f5a623' : colors.muted} />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Как прошёл обмен? (необязательно)"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />

          <Button title={current ? 'Обновить отзыв' : 'Отправить отзыв'} onPress={send} disabled={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  cancel: { fontSize: 15, width: 50 },
  title: { fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 16, gap: 18 },
  about: { fontSize: 15, color: colors.muted },
  stars: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingVertical: 6 },
  input: {
    minHeight: 110,
    textAlignVertical: 'top',
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
});
