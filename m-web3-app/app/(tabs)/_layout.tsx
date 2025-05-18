import React, { useEffect } from 'react';
import WalletContextProvider from '@/components/WalletContextProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  console.log('TabLayout rendered');

  return (
    <WalletContextProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        // Add a listener for tab changes to log the current tab
        screenListeners={{
          tabPress: (e) => {
            console.log('Tab pressed:', e.target);
          },
          focus: (e) => {
            console.log('Tab focused:', e.target);
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="send"
          options={{
            title: 'Send',
            tabBarIcon: ({ color }) => <FontAwesome size={20} name="send" color={color} />,
          }}
        />
        <Tabs.Screen
          name="token"
          options={{
            title: 'Token',
            tabBarIcon: ({ color }) => <FontAwesome size={24} name="bitcoin" color={color} />,
          }}
        />
      </Tabs>
    </WalletContextProvider>
  );
}
