import { colors } from "@debtflow/design-tokens";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);

    const response =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    if (mode === "signup" && !response.data.session) {
      setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso.");
      return;
    }

    router.replace("/");
  }

  return (
    <View className="rounded-[28px] border border-border bg-card p-6">
      <Text className="text-3xl font-semibold text-foreground">
        {mode === "signin" ? "Entrar" : "Crear cuenta"}
      </Text>
      <Text className="mt-2 text-sm leading-6 text-mutedForeground">
        {mode === "signin"
          ? "Accede a tu resumen financiero y continua donde lo dejaste."
          : "Configura tu cuenta y luego conecta tus ingresos, gastos y deudas."}
      </Text>

      <View className="mt-8 gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Correo</Text>
          <TextInput
            autoCapitalize="none"
            className="rounded-2xl border border-border bg-background px-4 py-4 text-foreground"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Contrasena</Text>
          <TextInput
            className="rounded-2xl border border-border bg-background px-4 py-4 text-foreground"
            onChangeText={setPassword}
            placeholder="Minimo 6 caracteres"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            value={password}
          />
        </View>
      </View>

      {message ? (
        <Text className="mt-4 text-sm leading-6 text-mutedForeground">{message}</Text>
      ) : null}

      <Pressable
        className="mt-6 items-center rounded-2xl bg-foreground px-5 py-4"
        disabled={loading}
        onPress={() => {
          void handleSubmit();
        }}
      >
        <Text className="font-semibold text-background">
          {loading
            ? "Procesando..."
            : mode === "signin"
              ? "Iniciar sesion"
              : "Crear cuenta"}
        </Text>
      </Pressable>

      <Pressable
        className="mt-4 items-center"
        onPress={() => router.replace(mode === "signin" ? "/signup" : "/signin")}
      >
        <Text className="text-sm text-mutedForeground">
          {mode === "signin"
            ? "No tienes cuenta? Crea una"
            : "Ya tienes cuenta? Inicia sesion"}
        </Text>
      </Pressable>
    </View>
  );
}
