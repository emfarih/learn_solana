import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TokenProvider } from "@/components/token/token_provider";

export default function TokenLayout() {
  return (
    <TokenProvider>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#d1d1d1",
          headerShown: false,
        }}
        screenListeners={{
          tabPress: (e) => {
            console.log("Tab pressed:", e.target);
          },
          focus: (e) => {
            console.log("Tab focused:", e.target);
          },
        }}
      >
        <Tabs.Screen
          name="list"
          options={{
            tabBarIcon: ({ color }) => <FontAwesome name="list" size={16} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarIcon: ({ color }) => <FontAwesome name="plus-circle" size={16} color={color} />,
          }}
        />
        <Tabs.Screen
          name="send"
          options={{
            tabBarIcon: ({ color }) => <FontAwesome name="paper-plane" size={16} color={color} />,
          }}
        />
      </Tabs>
    </TokenProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#007bff",
    height: 36,
    borderTopWidth: 0,
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
});
