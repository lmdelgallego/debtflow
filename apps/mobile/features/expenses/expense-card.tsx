import { colors } from "@debtflow/design-tokens";
import type { Expense } from "@debtflow/domain";
import { Pressable, Text, View } from "react-native";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const CATEGORY_LABELS: Record<string, string> = {
  housing: "Casa",
  transport: "Transporte",
  entertainment: "Entretenimiento",
  utilities: "Servicios",
  food: "Alimentación",
  health: "Salud",
  debt: "Deuda",
  others: "Otros"
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="mb-1 h-1 w-10 rounded-full" style={{ backgroundColor: colors.expense }} />

      <View className="mt-3 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-foreground">
            {expense.description ?? expense.subcategory ?? CATEGORY_LABELS[expense.category] ?? expense.category}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            <View
              className="self-start rounded-lg px-2.5 py-1"
              style={{ backgroundColor: colors.expense + "20" }}
            >
              <Text className="text-xs font-medium" style={{ color: colors.expense }}>
                {CATEGORY_LABELS[expense.category] ?? expense.category}
              </Text>
            </View>
            {expense.is_recurring && (
              <View className="self-start rounded-lg px-2.5 py-1" style={{ backgroundColor: colors.debt + "20" }}>
                <Text className="text-xs font-medium" style={{ color: colors.debt }}>
                  Recurrente
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xl font-semibold text-foreground">
            {currency.format(expense.amount)}
          </Text>
          <Text className="mt-1 text-xs text-mutedForeground">{formatDate(expense.date)}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <Pressable
          className="flex-1 items-center rounded-2xl border border-border py-3"
          onPress={() => onEdit(expense)}
        >
          <Text className="text-sm font-medium text-foreground">Editar</Text>
        </Pressable>
        <Pressable
          className="items-center rounded-2xl border border-border px-4 py-3"
          onPress={() => onDelete(expense)}
        >
          <Text className="text-sm text-mutedForeground">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}
