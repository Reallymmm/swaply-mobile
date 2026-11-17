import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { api, setToken } from '../api';
import { colors, radius } from '../theme';

export default function LoginScreen({ navigation }) {
  // false = вкладка "Вход", true = "Регистрация" (только внешний вид)
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // отправляем данные на сервер, при успехе запоминаем токен и идём в ленту
  async function submit() {
    setBusy(true);
    try {
      const res = isRegister
        ? await api.register(name, email, password)
        : await api.login(email, password);
      setToken(res.token);
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('Не получилось', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Avatar letter="S" size={90} dark />
          <Text style={styles.logo}>Swaply</Text>
          <Text style={styles.subtitle}>Обмен вещами без денег</Text>

          <View style={styles.switch}>
            <Pressable
              style={[styles.tab, !isRegister && styles.tabActive]}
              onPress={() => setIsRegister(false)}
            >
              <Text style={[styles.tabText, !isRegister && styles.tabTextActive]}>Вход</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, isRegister && styles.tabActive]}
              onPress={() => setIsRegister(true)}
            >
              <Text style={[styles.tabText, isRegister && styles.tabTextActive]}>Регистрация</Text>
            </Pressable>
          </View>

          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Имя"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title={isRegister ? 'Зарегистрироваться' : 'Войти'}
            onPress={submit}
            disabled={busy}
            style={{ alignSelf: 'stretch', marginTop: 8 }}
          />

          <Text style={styles.forgot}>Забыли пароль?</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 30, fontWeight: '800', marginTop: 14 },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: 28 },
  switch: { flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginBottom: 14 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius,
    borderWidth: 1.5,
    borderColor: colors.black,
  },
  tabActive: { backgroundColor: colors.black },
  tabText: { fontWeight: '700', color: colors.black },
  tabTextActive: { color: colors.white },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: radius,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 12,
  },
  forgot: { marginTop: 18, color: colors.muted },
});
