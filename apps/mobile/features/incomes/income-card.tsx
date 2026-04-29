import { colors } from "@debtflow/design-tokens";
import type { Income } from "@debtflow/domain";
import { Pressable, Text, View } from "react-native";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const TYPE_LABELS: Record<string, string> = {
  fixed: "Fijo",
  variable: "Variable"
};

interface IncomeCardProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}

export function IncomeCard({ income, onEdit, onDelete }: IncomeCardProps) {
  const accent = income.type === "fixed" ? colors.income : colors.expense;

  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="mb-1 h-1 w-10 rounded-full" style={{ backgroundColor: accent }} />

      <View className="mt-3 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-foreground">
            {income.description ?? "Sin descripción"}
          </Text>
          <View
            className="mt-1.5 self-start rounded-lg px-2.5 py-1"
            style={{ backgroundColor: accent + "20" }}
          >
            <Text className="text-xs font-medium" style={{ color: accent }}>
              {TYPE_LABELS[income.type] ?? income.type}
            </Text>
          </View>
        </View>
        <Text className="text-xl font-semibold text-foreground">
          {currency.format(income.amount)}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-2">
        <Pressable
          className="flex-1 items-center rounded-2xl border border-border py-3"
          onPress={() => onEdit(income)}
        >
          <Text className="text-sm font-medium text-foreground">Editar</Text>
        </Pressable>
        <Pressable
          className="items-center rounded-2xl border border-border px-4 py-3"
          onPress={() => onDelete(income)}
        >
          <Text className="text-sm text-mutedForeground">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}
