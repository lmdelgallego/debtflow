import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmModal } from "@/components/confirm-modal";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/features/auth/auth-provider";
import { IncomeCard } from "@/features/incomes/income-card";
import { IncomeFormSheet } from "@/features/incomes/income-form-sheet";
import { useDeleteIncome } from "@/features/incomes/use-income-mutations";
import { useIncomesQuery } from "@/features/incomes/use-incomes-query";
import type { Income } from "@debtflow/domain";
import { colors } from "@debtflow/design-tokens";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

export default function IncomesScreen() {
  const { session } = useAuth();
  const incomesQuery = useIncomesQuery(Boolean(session));
  const deleteIncome = useDeleteIncome();

  const [formVisible, setFormVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const incomes = incomesQuery.data ?? [];
  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  function handleEdit(income: Income) {
    setSelectedIncome(income);
    setFormVisible(true);
  }

  function handleDeleteRequest(income: Income) {
    setSelectedIncome(income);
    setConfirmVisible(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedIncome) return;
    await deleteIncome.mutateAsync(selectedIncome.id);
    setConfirmVisible(false);
    setSelectedIncome(null);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={incomesQuery.isRefetching}
            onRefresh={() => void incomesQuery.refetch()}
          />
        }
      >
        <View className="flex-row items-center justify-between pt-4">
          <View>
            <Text className="text-3xl font-semibold text-foreground">Ingresos</Text>
            <Text className="mt-1 text-sm text-mutedForeground">
              {incomes.length} registro{incomes.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-foreground"
            onPress={() => {
              setSelectedIncome(null);
              setFormVisible(true);
            }}
          >
            <Text className="text-lg font-medium text-background">+</Text>
          </Pressable>
        </View>

        {incomes.length > 0 && (
          <View className="rounded-3xl border border-border bg-card p-5">
            <View className="mb-1 h-1 w-10 rounded-full" style={{ backgroundColor: colors.income }} />
            <Text className="mt-3 text-xs uppercase tracking-widest text-mutedForeground">
              Total acumulado
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-foreground">
              {currency.format(total)}
            </Text>
          </View>
        )}

        {incomesQuery.isPending ? (
          <View className="rounded-3xl border border-border bg-card p-6">
            <Text className="text-base text-mutedForeground">Cargando ingresos...</Text>
          </View>
        ) : incomes.length === 0 ? (
          <EmptyState
            title="Sin ingresos registrados"
            description="Agrega tus fuentes de ingreso para calcular el flujo de caja disponible."
          />
        ) : (
          incomes.map((income) => (
            <IncomeCard
              key={income.id}
              income={income}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))
        )}
      </ScrollView>

      <IncomeFormSheet
        visible={formVisible}
        income={selectedIncome}
        onClose={() => {
          setFormVisible(false);
          setSelectedIncome(null);
        }}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar ingreso"
        message="¿Eliminar este ingreso? Esta acción no se puede deshacer."
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          setConfirmVisible(false);
          setSelectedIncome(null);
        }}
      />
    </SafeAreaView>
  );
}
