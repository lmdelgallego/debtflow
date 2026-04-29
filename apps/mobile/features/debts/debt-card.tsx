import { colors } from "@debtflow/design-tokens";
import type { Debt } from "@debtflow/domain";
import { Pressable, Text, View } from "react-native";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

interface DebtCardProps {
  debt: Debt;
  isTarget?: boolean;
  onEdit: (debt: Debt) => void;
  onPay: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export function DebtCard({ debt, isTarget, onEdit, onPay, onDelete }: DebtCardProps) {
  const isPaid = debt.balance <= 0;

  return (
    <View
      className="rounded-3xl border border-border bg-card p-5"
      style={isTarget ? { borderColor: colors.debt } : undefined}
    >
      <View className="mb-1 h-1 w-10 rounded-full" style={{ backgroundColor: isPaid ? colors.income : colors.debt }} />

      <View className="mt-3 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-foreground">{debt.name}</Text>
          {isTarget && !isPaid && (
            <Text className="mt-0.5 text-xs" style={{ color: colors.debt }}>
              Objetivo actual
            </Text>
          )}
        </View>
        <Text className="text-xl font-semibold text-foreground">
          {currency.format(debt.balance)}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-6">
        <View>
          <Text className="text-xs text-mutedForeground">Tasa</Text>
          <Text className="mt-0.5 text-sm font-medium text-foreground">
            {debt.interest_rate}%
          </Text>
        </View>
        <View>
          <Text className="text-xs text-mutedForeground">Pago mínimo</Text>
          <Text className="mt-0.5 text-sm font-medium text-foreground">
            {currency.format(debt.minimum_payment)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-mutedForeground">Día de pago</Text>
          <Text className="mt-0.5 text-sm font-medium text-foreground">
            {debt.payment_day}
          </Text>
        </View>
      </View>

      {!isPaid && (
        <View className="mt-5 flex-row gap-2">
          <Pressable
            className="flex-1 items-center rounded-2xl py-3"
            style={{ backgroundColor: colors.debt + "20" }}
            onPress={() => onPay(debt)}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.debt }}>
              Pagar
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-2xl border border-border py-3"
            onPress={() => onEdit(debt)}
          >
            <Text className="text-sm font-medium text-foreground">Editar</Text>
          </Pressable>
          <Pressable
            className="items-center rounded-2xl border border-border px-4 py-3"
            onPress={() => onDelete(debt)}
          >
            <Text className="text-sm text-mutedForeground">✕</Text>
          </Pressable>
        </View>
      )}

      {isPaid && (
        <View className="mt-4 items-center rounded-2xl py-3" style={{ backgroundColor: colors.income + "15" }}>
          <Text className="text-sm font-semibold" style={{ color: colors.income }}>
            ¡Deuda pagada!
          </Text>
        </View>
      )}
    </View>
  );
}
