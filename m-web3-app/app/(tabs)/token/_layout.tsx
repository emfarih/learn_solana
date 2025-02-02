import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TokenProvider } from "@/components/token/token_provider";

export default function TokenLayout() {
  return (
    <TokenProvider>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar, // Custom tab bar style
          tabBarShowLabel: false, // Hide labels, only show icons
          tabBarActiveTintColor: "#fff", // Active icon color
          tabBarInactiveTintColor: "#d1d1d1", // Inactive icon color
          headerShown: false, // Hide the header
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
    backgroundColor: "#007bff", // Blue background for the tab bar
    height: 36, // Reduce the height of the tab bar
    borderTopWidth: 0, // Remove the border line
    borderTopStartRadius: 16, // Round the top left corner
    borderTopEndRadius: 16, // Round the top right corner
  },
});
