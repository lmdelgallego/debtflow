import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111216",
          borderTopColor: "#27272a"
        },
        tabBarActiveTintColor: "#fafafa",
        tabBarInactiveTintColor: "#71717a"
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Resumen"
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Cuenta"
        }}
      />
    </Tabs>
  );
}
