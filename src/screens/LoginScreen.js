import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { api, setToken } from '../api';
import { colors, radius } from '../theme';

const RESEND_SECONDS = 60; // через сколько можно запросить код ещё раз

export default function LoginScreen({ navigation }) {
  // false = вкладка "Вход", true = "Регистрация" (только внешний вид)
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // второй шаг регистрации: ждём код из письма
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // таймер до повторной отправки кода
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // вход: при успехе запоминаем токен и идём в ленту
  async function login() {
    setBusy(true);
    try {
      const res = await api.login(email.trim(), password);
      setToken(res.token);
      navigation.replace('Main');
    } catch (e) {
      if (e.status === 403) {
        // аккаунт заблокирован: показываем причину и форму апелляции
        navigation.navigate('Blocked', { email: email.trim(), password });
      } else {
        Alert.alert('Не получилось', e.message);
      }
    } finally {
      setBusy(false);
    }
  }

  // регистрация, шаг 1: отправляем данные, на почту приходит код
  async function sendCode() {
    if (!name.trim()) return Alert.alert('Не получилось', 'Введите имя');
    if (!email.includes('@')) return Alert.alert('Не получилось', 'Введите корректный email');
    if (password.length < 6) return Alert.alert('Не получилось', 'Пароль должен быть не короче 6 символов');

    setBusy(true);
    try {
      await api.register(name.trim(), email.trim(), password);
      setCode('');
      setCooldown(RESEND_SECONDS);
      setCodeStep(true);
    } catch (e) {
      Alert.alert('Не получилось', e.message);
    } finally {
      setBusy(false);
    }
  }

  // регистрация, шаг 2: проверяем код, сервер создаёт аккаунт и сразу впускает
  async function confirmCode() {
    if (code.trim().length !== 6) return Alert.alert('Не получилось', 'Введите 6 цифр из письма');
    setBusy(true);
    try {
      const res = await api.confirmRegister(email.trim(), code.trim());
      setToken(res.token);
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('Не получилось', e.message);
      // если код больше не действует, возвращаем на форму
      if (e.status === 429 || /устарел|не найден/i.test(e.message)) setCodeStep(false);
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    try {
      await api.resendCode(email.trim());
      setCooldown(RESEND_SECONDS);
      Alert.alert('Готово', 'Отправили новый код на ' + email.trim());
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
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.logo}>Swaply</Text>
          <Text style={styles.subtitle}>Обмен вещами без денег</Text>

          {codeStep ? (
            <>
              <Text style={styles.codeTitle}>Подтвердите почту</Text>
              <Text style={styles.codeHint}>
                Мы отправили 6-значный код на {email.trim()}. Он действует 10 минут. Проверьте также папку «Спам».
              </Text>

              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor={colors.grayDark}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
                onSubmitEditing={confirmCode}
              />

              <Button
                title="Подтвердить"
                onPress={confirmCode}
                disabled={busy || code.length !== 6}
                style={{ alignSelf: 'stretch', marginTop: 8 }}
              />

              <Pressable onPress={resendCode} disabled={busy || cooldown > 0} style={styles.link}>
                <Text style={[styles.linkText, (busy || cooldown > 0) && { color: colors.muted }]}>
                  {cooldown > 0 ? `Отправить код ещё раз (${cooldown} с)` : 'Отправить код ещё раз'}
                </Text>
              </Pressable>

              <Pressable onPress={() => setCodeStep(false)} style={styles.link}>
                <Text style={styles.forgot}>Изменить данные или почту</Text>
              </Pressable>
            </>
          ) : (
            <>
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
                title={isRegister ? 'Получить код на почту' : 'Войти'}
                onPress={isRegister ? sendCode : login}
                disabled={busy}
                style={{ alignSelf: 'stretch', marginTop: 8 }}
              />

              {isRegister ? (
                <Text style={styles.hint}>Мы отправим код, чтобы подтвердить, что почта ваша</Text>
              ) : (
                <Text style={styles.forgot}>Забыли пароль?</Text>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoImage: { width: 110, height: 110 },
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
  hint: { marginTop: 14, color: colors.muted, fontSize: 12, textAlign: 'center' },
  codeTitle: { fontSize: 20, fontWeight: '800', alignSelf: 'stretch' },
  codeHint: { color: colors.muted, alignSelf: 'stretch', marginTop: 6, marginBottom: 16, lineHeight: 20 },
  codeInput: { fontSize: 26, fontWeight: '700', letterSpacing: 10, textAlign: 'center' },
  link: { marginTop: 8, paddingVertical: 8 },
  linkText: { fontWeight: '700', color: colors.black },
});
