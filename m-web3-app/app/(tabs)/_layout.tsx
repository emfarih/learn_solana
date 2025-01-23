import WalletContextProvider from '@/components/WalletContextProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <WalletContextProvider>
      <Tabs>
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
            tabBarIcon: ({ color }) => <FontAwesome size={24} name="send" color={color} />,
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
