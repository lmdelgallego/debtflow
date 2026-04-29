import { colors } from "@debtflow/design-tokens";
import { calculateAvalanche, formatMonths, simulatePortfolio, type Debt } from "@debtflow/domain";
import { Text, View } from "react-native";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

interface AvalancheCardProps {
  debts: Debt[];
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function AvalancheCard({ debts, monthlyIncome, monthlyExpenses }: AvalancheCardProps) {
  const activeDebts = debts.filter((d) => d.balance > 0);
  if (activeDebts.length === 0) return null;

  const result = calculateAvalanche(debts, monthlyIncome, monthlyExpenses);
  const portfolio = simulatePortfolio(debts, "avalanche", result.monthlyDebtBudget);

  const target = result.recommendedPayments.find((p) => p.isTarget);

  return (
    <View className="rounded-3xl border bg-card p-5" style={{ borderColor: colors.debt + "60" }}>
      <View className="mb-1 h-1 w-10 rounded-full" style={{ backgroundColor: colors.debt }} />
      <Text className="mt-3 text-xs uppercase tracking-widest text-mutedForeground">
        Estrategia avalanche
      </Text>

      <View className="mt-4 flex-row gap-4">
        <View className="flex-1 rounded-2xl border border-border bg-background p-4">
          <Text className="text-xs text-mutedForeground">Presupuesto mensual</Text>
          <Text className="mt-1 text-lg font-semibold text-foreground">
            {currency.format(result.monthlyDebtBudget)}
          </Text>
        </View>
        {portfolio && (
          <View className="flex-1 rounded-2xl border border-border bg-background p-4">
            <Text className="text-xs text-mutedForeground">Libre de deudas en</Text>
            <Text className="mt-1 text-lg font-semibold text-foreground">
              {formatMonths(portfolio.months)}
            </Text>
          </View>
        )}
      </View>

      {target && (
        <View className="mt-4 rounded-2xl border border-border bg-background p-4">
          <Text className="text-xs text-mutedForeground">Objetivo actual</Text>
          <Text className="mt-1 text-base font-semibold text-foreground">{target.debtName}</Text>
          <View className="mt-3 flex-row gap-4">
            <View>
              <Text className="text-xs text-mutedForeground">Mín.</Text>
              <Text className="text-sm font-medium text-foreground">
                {currency.format(target.minimumPayment)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-mutedForeground">Recomendado</Text>
              <Text className="text-sm font-semibold" style={{ color: colors.debt }}>
                {currency.format(target.recommendedPayment)}
              </Text>
            </View>
            {target.extraApplied > 0 && (
              <View>
                <Text className="text-xs text-mutedForeground">Extra</Text>
                <Text className="text-sm font-medium" style={{ color: colors.income }}>
                  +{currency.format(target.extraApplied)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {result.mode !== "NORMAL" && (
        <View className="mt-3 rounded-xl px-3 py-2" style={{ backgroundColor: colors.expense + "20" }}>
          <Text className="text-xs" style={{ color: colors.expense }}>
            {result.mode === "CRISIS_NO_MINIMUMS"
              ? "Flujo insuficiente para cubrir todos los mínimos"
              : "Sin presupuesto disponible para deudas"}
          </Text>
        </View>
      )}
    </View>
  );
}
