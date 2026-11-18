import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { api } from '../api';
import { colors } from '../theme';
import { formatDate } from '../utils';

const APPEAL_NAMES = { pending: 'На рассмотрении', approved: 'Одобрена', rejected: 'Отклонена' };

export default function BlockedScreen({ navigation, route }) {
  const { email, password } = route.params;
  const [info, setInfo] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setInfo(await api.appealStatus(email, password));
    } catch (e) {
      Alert.alert('Не получилось', e.message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    if (text.trim().length < 10) {
      Alert.alert('Слишком коротко', 'Опишите ситуацию подробнее (не короче 10 символов).');
      return;
    }
    setBusy(true);
    try {
      await api.sendAppeal(email, password, text);
      setText('');
      await load();
      Alert.alert('Готово', 'Апелляция отправлена. Ответ появится на этом экране.');
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
            <Text style={styles.back}>← Назад</Text>
          </Pressable>
        </View>

        {!info ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Аккаунт заблокирован</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Причина</Text>
              <Text style={styles.reason}>{info.reason_name || 'Не указана'}</Text>
              {!!info.comment && <Text style={styles.comment}>{info.comment}</Text>}
              {!!info.banned_at && <Text style={styles.date}>С {formatDate(info.banned_at)}</Text>}
            </View>

            {info.can_appeal ? (
              <>
                <Text style={styles.section}>Не согласны? Подайте апелляцию</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Опишите, почему блокировку нужно снять"
                  placeholderTextColor={colors.muted}
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={1000}
                />
                <Button title="Отправить апелляцию" onPress={send} disabled={busy} />
              </>
            ) : (
              <Text style={styles.note}>Ваша апелляция на рассмотрении. Ответ появится здесь.</Text>
            )}

            {info.appeals.length > 0 && (
              <>
                <Text style={styles.section}>Ваши апелляции</Text>
                {info.appeals.map((a) => (
                  <View key={a.id} style={styles.card}>
                    <Text style={styles.date}>
                      {formatDate(a.created_at)} · {APPEAL_NAMES[a.status] || a.status}
                    </Text>
                    <Text style={styles.body}>{a.text}</Text>
                    {!!a.admin_comment && (
                      <Text style={styles.answer}>Ответ администратора: {a.admin_comment}</Text>
                    )}
                  </View>
                ))}
              </>
            )}

            <Button title="Проверить снова" variant="outline" onPress={load} style={{ marginTop: 8 }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  top: { padding: 16 },
  back: { fontSize: 15 },
  content: { paddingHorizontal: 16, paddingBottom: 30, gap: 14 },
  title: { fontSize: 24, fontWeight: '800' },
  card: {
    backgroundColor: colors.gray,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  label: { fontSize: 12, color: colors.muted },
  reason: { fontSize: 17, fontWeight: '700' },
  comment: { fontSize: 14, marginTop: 2 },
  date: { fontSize: 12, color: colors.muted },
  section: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  note: { fontSize: 14, color: colors.muted },
  body: { fontSize: 14 },
  answer: { fontSize: 14, fontWeight: '600', marginTop: 4 },
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
