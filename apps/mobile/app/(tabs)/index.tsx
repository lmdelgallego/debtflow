import { colors } from "@debtflow/design-tokens";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { useAuth } from "@/features/auth/auth-provider";
import { useDashboardQuery } from "@/features/dashboard/use-dashboard-query";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

export default function DashboardScreen() {
  const { session } = useAuth();
  const query = useDashboardQuery(Boolean(session));
  const summary = query.data?.summary;
  const hasData = Boolean(
    query.data?.incomes.length || query.data?.expenses.length || query.data?.debts.length
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              void query.refetch();
            }}
          />
        }
      >
        <View className="pt-4">
          <Text className="text-3xl font-semibold text-foreground">DebtFlow Mobile</Text>
          <Text className="mt-2 text-sm leading-6 text-mutedForeground">
            Resumen rapido de ingresos, gastos y deudas del mes actual.
          </Text>
        </View>

        {query.isPending ? (
          <View className="rounded-3xl border border-border bg-card p-6">
            <Text className="text-base text-mutedForeground">Cargando resumen...</Text>
          </View>
        ) : query.isError ? (
          <EmptyState
            title="No fue posible cargar el dashboard"
            description="Revisa tu conexion o vuelve a intentarlo en unos segundos."
          />
        ) : !hasData || !summary ? (
          <EmptyState
            title="Todavia no hay datos"
            description="Agrega ingresos, gastos y deudas desde la web para empezar a ver tu panorama financiero en mobile."
          />
        ) : (
          <>
            <MetricCard
              label="Flujo disponible"
              value={currency.format(summary.availableFlow)}
              hint={`Pago minimo mensual: ${currency.format(summary.monthlyDebtPayments)}`}
              accent={summary.availableFlow >= 0 ? colors.income : colors.danger}
            />
            <View className="gap-4">
              <MetricCard
                label="Ingresos del mes"
                value={currency.format(summary.monthlyIncome)}
                hint={`Acumulado historico: ${currency.format(summary.totalIncome)}`}
                accent={colors.income}
              />
              <MetricCard
                label="Gastos del mes"
                value={currency.format(summary.monthlyExpenses)}
                hint={`Acumulado historico: ${currency.format(summary.totalExpenses)}`}
                accent={colors.expense}
              />
              <MetricCard
                label="Deuda activa"
                value={currency.format(summary.totalDebt)}
                hint={summary.nextDebtName ? `Siguiente objetivo: ${summary.nextDebtName}` : "Sin deudas activas"}
                accent={colors.debt}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
