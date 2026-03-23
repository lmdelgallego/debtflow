import { colors, radii, spacing } from "@debtflow/design-tokens";
import { ReactNode } from "react";
import { Text, View } from "react-native";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  children?: ReactNode;
}

export function MetricCard({ label, value, hint, accent = colors.primary, children }: MetricCardProps) {
  return (
    <View
      className="rounded-3xl border border-border bg-card p-5"
      style={{ borderRadius: radii.md, padding: spacing.md }}
    >
      <View className="mb-4 h-1.5 w-16 rounded-full" style={{ backgroundColor: accent }} />
      <Text className="text-sm uppercase tracking-[1.8px] text-mutedForeground">{label}</Text>
      <Text className="mt-2 text-3xl font-semibold text-foreground">{value}</Text>
      {hint ? <Text className="mt-2 text-sm text-mutedForeground">{hint}</Text> : null}
      {children}
    </View>
  );
}
