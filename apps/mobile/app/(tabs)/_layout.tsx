import { colors } from "@debtflow/design-tokens";
import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 18, color }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4
        },
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Resumen",
          tabBarIcon: ({ color }) => <TabIcon icon="⊞" color={color} />
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: "Deudas",
          tabBarIcon: ({ color }) => <TabIcon icon="◈" color={color} />
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: "Ingresos",
          tabBarIcon: ({ color }) => <TabIcon icon="↑" color={color} />
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Gastos",
          tabBarIcon: ({ color }) => <TabIcon icon="↓" color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ color }) => <TabIcon icon="◯" color={color} />
        }}
      />
    </Tabs>
  );
}
