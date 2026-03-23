import { SafeAreaView } from "react-native-safe-area-context";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignInScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5 py-8">
      <AuthForm mode="signin" />
    </SafeAreaView>
  );
}
