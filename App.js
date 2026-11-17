import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Tabs from './src/navigation/Tabs';
import LoginScreen from './src/screens/LoginScreen';
import ListingScreen from './src/screens/ListingScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import ChatScreen from './src/screens/ChatScreen';
import UserScreen from './src/screens/UserScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import PhotosScreen from './src/screens/PhotosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={Tabs} />
          <Stack.Screen name="Listing" component={ListingScreen} />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="User" component={UserScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="Photos"
            component={PhotosScreen}
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
