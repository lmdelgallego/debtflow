import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth/auth-provider";

export default function SettingsScreen() {
  const { session, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background px-5 py-6">
      <View className="rounded-3xl border border-border bg-card p-6">
        <Text className="text-xl font-semibold text-foreground">Cuenta</Text>
        <Text className="mt-3 text-sm leading-6 text-mutedForeground">
          Sesion activa con {session?.user.email ?? "usuario autenticado"}.
        </Text>

        <Pressable
          className="mt-8 items-center rounded-2xl border border-border px-5 py-4"
          onPress={() => {
            void signOut();
          }}
        >
          <Text className="font-medium text-foreground">Cerrar sesion</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
