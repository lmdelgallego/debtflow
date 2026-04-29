import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmModal } from "@/components/confirm-modal";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/features/auth/auth-provider";
import { useDashboardQuery } from "@/features/dashboard/use-dashboard-query";
import { AvalancheCard } from "@/features/debts/avalanche-card";
import { DebtCard } from "@/features/debts/debt-card";
import { DebtFormSheet } from "@/features/debts/debt-form-sheet";
import { PayDebtSheet } from "@/features/debts/pay-debt-sheet";
import { useDeleteDebt } from "@/features/debts/use-debt-mutations";
import { useDebtsQuery } from "@/features/debts/use-debts-query";
import type { Debt } from "@debtflow/domain";

export default function DebtsScreen() {
  const { session } = useAuth();
  const debtsQuery = useDebtsQuery(Boolean(session));
  const dashboardQuery = useDashboardQuery(Boolean(session));
  const deleteDebt = useDeleteDebt();

  const [formVisible, setFormVisible] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const debts = debtsQuery.data ?? [];
  const summary = dashboardQuery.data?.summary;
  const isRefreshing = debtsQuery.isRefetching || dashboardQuery.isRefetching;
  const avalancheTarget = debts.find((d) => {
    const active = debts.filter((x) => x.balance > 0).sort((a, b) => b.interest_rate - a.interest_rate);
    return active[0]?.id === d.id;
  });

  function handleEdit(debt: Debt) {
    setSelectedDebt(debt);
    setFormVisible(true);
  }

  function handlePay(debt: Debt) {
    setSelectedDebt(debt);
    setPayVisible(true);
  }

  function handleDeleteRequest(debt: Debt) {
    setSelectedDebt(debt);
    setConfirmVisible(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedDebt) return;
    await deleteDebt.mutateAsync(selectedDebt.id);
    setConfirmVisible(false);
    setSelectedDebt(null);
  }

  function onRefresh() {
    void debtsQuery.refetch();
    void dashboardQuery.refetch();
  }

  const isLoading = debtsQuery.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row items-center justify-between pt-4">
          <View>
            <Text className="text-3xl font-semibold text-foreground">Deudas</Text>
            <Text className="mt-1 text-sm text-mutedForeground">
              {debts.filter((d) => d.balance > 0).length} deuda
              {debts.filter((d) => d.balance > 0).length !== 1 ? "s" : ""} activa
              {debts.filter((d) => d.balance > 0).length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-foreground"
            onPress={() => {
              setSelectedDebt(null);
              setFormVisible(true);
            }}
          >
            <Text className="text-lg font-medium text-background">+</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View className="rounded-3xl border border-border bg-card p-6">
            <Text className="text-base text-mutedForeground">Cargando deudas...</Text>
          </View>
        ) : debts.length === 0 ? (
          <EmptyState
            title="Sin deudas registradas"
            description="Agrega tus deudas para ver las recomendaciones del método avalanche."
          />
        ) : (
          <>
            {summary && (
              <AvalancheCard
                debts={debts}
                monthlyIncome={summary.monthlyIncome}
                monthlyExpenses={summary.monthlyExpenses}
              />
            )}
            {debts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                isTarget={avalancheTarget?.id === debt.id && debt.balance > 0}
                onEdit={handleEdit}
                onPay={handlePay}
                onDelete={handleDeleteRequest}
              />
            ))}
          </>
        )}
      </ScrollView>

      <DebtFormSheet
        visible={formVisible}
        debt={selectedDebt}
        onClose={() => {
          setFormVisible(false);
          setSelectedDebt(null);
        }}
      />

      <PayDebtSheet
        visible={payVisible}
        debt={selectedDebt}
        onClose={() => {
          setPayVisible(false);
          setSelectedDebt(null);
        }}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar deuda"
        message={`¿Eliminar "${selectedDebt?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          setConfirmVisible(false);
          setSelectedDebt(null);
        }}
      />
    </SafeAreaView>
  );
}
