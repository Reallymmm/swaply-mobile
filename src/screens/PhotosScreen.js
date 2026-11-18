import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PhotosScreen({ navigation, route }) {
  const { urls, index = 0 } = route.params;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ref = useRef(null);
  const [page, setPage] = useState(index);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ x: index * width, animated: false }), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {urls.map((uri, i) => (
          <Image key={i} source={{ uri }} style={{ width, height }} resizeMode="contain" />
        ))}
      </ScrollView>

      <Pressable style={[styles.close, { top: insets.top + 10 }]} onPress={() => navigation.goBack()} hitSlop={10}>
        <Ionicons name="close" size={26} color="#fff" />
      </Pressable>

      {urls.length > 1 && (
        <View style={[styles.counter, { bottom: insets.bottom + 20 }]}>
          <Text style={styles.counterText}>{page + 1} / {urls.length}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  close: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  counterText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
