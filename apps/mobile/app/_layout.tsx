import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import { queryClient } from "@/lib/query-client";

function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, session } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = pathname?.startsWith("/signin") || pathname?.startsWith("/signup");

    if (!session && !inAuthGroup) {
      router.replace("/signin");
    }

    if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [loading, pathname, router, session]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <AppNavigation />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
