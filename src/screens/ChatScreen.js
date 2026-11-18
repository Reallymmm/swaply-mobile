import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import Photo from '../components/Photo';
import { api, photoUrl } from '../api';
import { colors } from '../theme';

export default function ChatScreen({ navigation, route }) {
  const { chatId } = route.params;
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setChat(await api.chat(chatId));
    } catch (e) {
      // молча пропускаем: следующая попытка будет через пару секунд
    }
  }, [chatId]);

  // новые сообщения подтягиваем каждые 3 секунды
  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  async function send() {
    const value = text.trim();
    if (!value) return;
    setText('');
    try {
      await api.sendMessage(chatId, value);
      await load();
    } catch (e) {
      setText(value);
      Alert.alert('Не отправилось', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={colors.black} />
        </Pressable>
        <Avatar letter={chat ? chat.other_name[0] : '…'} size={38} />
        <Text style={styles.name}>{chat ? chat.other_name : ''}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {chat && (
          // нажатие на карточку открывает объявление, о котором этот чат
          <Pressable
            style={({ pressed }) => [styles.listing, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('Listing', { id: chat.listing_id })}
          >
            <Photo style={styles.listingPhoto} size={18} uri={photoUrl(chat.listing_cover)} />
            <View style={{ flex: 1 }}>
              <Text style={styles.listingTitle} numberOfLines={1}>{chat.listing_title}</Text>
              <Text style={styles.listingWant} numberOfLines={1}>Хочу: {chat.listing_want || 'не указано'}</Text>
              <Text style={styles.listingOpen}>Открыть объявление</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        )}

        <FlatList
          ref={listRef}
          data={chat ? chat.messages : []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.mine ? styles.mine : styles.their]}>
              <Text style={{ color: item.mine ? colors.white : colors.black, fontSize: 15 }}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Сообщение"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
          />
          <Pressable style={styles.send} onPress={send}>
            <Ionicons name="chevron-forward" size={22} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  name: { fontWeight: '700', fontSize: 15 },
  listing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 12,
    padding: 8,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  listingPhoto: { width: 40, height: 40, borderRadius: 6 },
  listingTitle: { fontWeight: '700', fontSize: 13 },
  listingWant: { color: colors.muted, fontSize: 12, marginTop: 2 },
  listingOpen: { color: colors.black, fontSize: 12, fontWeight: '700', marginTop: 3 },
  messages: { paddingHorizontal: 12, paddingBottom: 10, gap: 10 },
  bubble: { maxWidth: '75%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 },
  their: { alignSelf: 'flex-start', backgroundColor: colors.gray, borderWidth: 1, borderColor: colors.border },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.black },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
