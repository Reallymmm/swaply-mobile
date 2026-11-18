import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, getToken } from './api';
import { navigationRef } from './navigation/ref';
import { colors, radius } from './theme';

const POLL_MS = 6000;
const SHOW_MS = 4500;

const Ctx = createContext({ unreadMessages: 0, unreadOther: 0 });
export const useNotifications = () => useContext(Ctx);

export function NotificationsProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [unread, setUnread] = useState({ messages: 0, other: 0 });
  const [banner, setBanner] = useState(null);
  const slide = useRef(new Animated.Value(-120)).current;
  const lastId = useRef(null);
  const lastToken = useRef(null);
  const hideTimer = useRef(null);

  const hideBanner = useCallback(() => {
    Animated.timing(slide, { toValue: -120, duration: 200, useNativeDriver: true }).start(() => setBanner(null));
  }, [slide]);

  const showBanner = useCallback(
    (item) => {
      clearTimeout(hideTimer.current);
      setBanner(item);
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(hideBanner, SHOW_MS);
    },
    [slide, hideBanner]
  );

  const poll = useCallback(async () => {
    const token = getToken();
    if (token !== lastToken.current) {
      lastToken.current = token;
      lastId.current = null;
      setUnread({ messages: 0, other: 0 });
    }
    if (!token) return;

    try {
      const res = await api.notifications(lastId.current ?? undefined);
      lastId.current = res.last_id;

      const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
      const inChat = route?.name === 'Chat' || route?.name === 'Chats';
      const inHistory = route?.name === 'Notifications';

      const fresh = res.items.filter(
        (n) => !(n.kind === 'message' && route?.name === 'Chat' && route.params?.chatId === n.chat_id)
      );
      if (fresh.length) showBanner(fresh[fresh.length - 1]);

      let { unread_messages: m, unread_other: o } = res;
      if (inChat && m > 0) {
        api.readNotifications(['message']).catch(() => {});
        m = 0;
      }
      if (inHistory && o > 0) {
        api.readNotifications(['other']).catch(() => {});
        o = 0;
      }
      setUnread({ messages: m, other: o });
    } catch (e) {
    }
  }, [showBanner]);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') poll();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [poll]);

  function open() {
    const n = banner;
    hideBanner();
    if (!n || !navigationRef.isReady()) return;
    if (n.kind === 'message' && n.chat_id) navigationRef.navigate('Chat', { chatId: n.chat_id });
    else if (n.listing_id) navigationRef.navigate('Listing', { id: n.listing_id });
  }

  return (
    <Ctx.Provider value={{ unreadMessages: unread.messages, unreadOther: unread.other }}>
      {children}
      {banner && (
        <Animated.View style={[styles.wrap, { top: insets.top + 6, transform: [{ translateY: slide }] }]}>
          <Pressable style={styles.banner} onPress={open}>
            <Ionicons
              name={banner.kind === 'message' ? 'chatbubble' : banner.kind === 'listing_approved' ? 'checkmark-circle' : 'alert-circle'}
              size={26}
              color={colors.white}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
              {!!banner.body && <Text style={styles.body} numberOfLines={2}>{banner.body}</Text>}
            </View>
          </Pressable>
        </Animated.View>
      )}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, zIndex: 100, elevation: 10 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.black,
    borderRadius: radius,
    padding: 14,
  },
  title: { color: colors.white, fontWeight: '700', fontSize: 15 },
  body: { color: '#d0d0d0', fontSize: 13, marginTop: 2 },
});
