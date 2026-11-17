import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import FeedScreen from '../screens/FeedScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';
import { useNotifications } from '../notifications';

const Tab = createBottomTabNavigator();

// Своя иконка для вкладки "Лента": чёрная - когда открыта, серая - когда нет
const feedActive = require('../../assets/feed-active.png');
const feedInactive = require('../../assets/feed-inactive.png');

// Для кнопки "Добавить" экран не нужен, поэтому пустая заглушка
const Empty = () => null;

function icon(outline, filled) {
  return ({ focused, color }) => (
    <Ionicons name={focused ? filled : outline} size={24} color={color} />
  );
}

export default function Tabs() {
  const { unreadMessages, unreadOther } = useNotifications();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Лента',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? feedActive : feedInactive}
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Избранное', tabBarIcon: icon('heart-outline', 'heart') }}
      />
      <Tab.Screen
        name="Add"
        component={Empty}
        options={{
          tabBarLabel: 'Добавить',
          tabBarIcon: () => (
            <View style={styles.plus}>
              <Ionicons name="add" size={24} color={colors.white} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // не открываем вкладку, а показываем экран создания
            e.preventDefault();
            navigation.navigate('CreateListing');
          },
        })}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Чаты',
          tabBarIcon: icon('chatbubble-outline', 'chatbubble'),
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: icon('person-outline', 'person'),
          tabBarBadge: unreadOther > 0 ? unreadOther : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  plus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
