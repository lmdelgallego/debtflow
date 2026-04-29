import { colors } from "@debtflow/design-tokens";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-foreground">{label}</Text>
      <TextInput
        className="rounded-2xl border bg-background px-4 py-4 text-base text-foreground"
        style={[{ borderColor: error ? colors.danger : colors.border }, style]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
