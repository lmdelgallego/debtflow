import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMobileClient } from "@debtflow/supabase";
import "react-native-url-polyfill/auto";

export const supabase = createMobileClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  AsyncStorage
);
