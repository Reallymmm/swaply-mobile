import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Avatar from '../components/Avatar';
import { api } from '../api';
import { formatTime } from '../utils';
import { colors } from '../theme';

export default function ChatsScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      api.chats().then(setItems).catch((e) => Alert.alert('Ошибка', e.message));
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Чаты</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>Пока нет диалогов</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Chat', { chatId: item.id })}>
            <Avatar letter={item.other_name[0]} size={50} />
            <View style={styles.middle}>
              <Text style={styles.name}>{item.other_name}</Text>
              <Text style={styles.last} numberOfLines={1}>{item.last_text}</Text>
            </View>
            <Text style={styles.time}>{formatTime(item.last_at)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  title: { fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingVertical: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  middle: { flex: 1 },
  name: { fontWeight: '700', fontSize: 15 },
  last: { color: colors.muted, fontSize: 13, marginTop: 3 },
  time: { color: colors.muted, fontSize: 12 },
});
