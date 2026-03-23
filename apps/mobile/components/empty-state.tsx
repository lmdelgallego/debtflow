import { Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="rounded-3xl border border-dashed border-border bg-card px-6 py-10">
      <Text className="text-xl font-semibold text-foreground">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-mutedForeground">{description}</Text>
    </View>
  );
}
