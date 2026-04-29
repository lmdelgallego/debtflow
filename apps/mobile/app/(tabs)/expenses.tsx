import { colors } from "@debtflow/design-tokens";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmModal } from "@/components/confirm-modal";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/features/auth/auth-provider";
import { ExpenseCard } from "@/features/expenses/expense-card";
import { ExpenseFormSheet } from "@/features/expenses/expense-form-sheet";
import { useDeleteExpense } from "@/features/expenses/use-expense-mutations";
import { useExpensesQuery } from "@/features/expenses/use-expenses-query";
import type { Expense } from "@debtflow/domain";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

export default function ExpensesScreen() {
  const { session } = useAuth();
  const expensesQuery = useExpensesQuery(Boolean(session));
  const deleteExpense = useDeleteExpense();

  const [formVisible, setFormVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const expenses = expensesQuery.data ?? [];
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  function handleEdit(expense: Expense) {
    setSelectedExpense(expense);
    setFormVisible(true);
  }

  function handleDeleteRequest(expense: Expense) {
    setSelectedExpense(expense);
    setConfirmVisible(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedExpense) return;
    await deleteExpense.mutateAsync(selectedExpense.id);
    setConfirmVisible(false);
    setSelectedExpense(null);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={expensesQuery.isRefetching}
            onRefresh={() => void expensesQuery.refetch()}
          />
        }
      >
        <View className="flex-row items-center justify-between pt-4">
          <View>
            <Text className="text-3xl font-semibold text-foreground">Gastos</Text>
            <Text className="mt-1 text-sm text-mutedForeground">
              {expenses.length} registro{expenses.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-foreground"
            onPress={() => {
              setSelectedExpense(null);
              setFormVisible(true);
            }}
          >
            <Text className="text-lg font-medium text-background">+</Text>
          </Pressable>
        </View>

        {expenses.length > 0 && (
          <View className="rounded-3xl border border-border bg-card p-5">
            <View className="mb-1 h-1 w-10 rounded-full" style={{ backgroundColor: colors.expense }} />
            <Text className="mt-3 text-xs uppercase tracking-widest text-mutedForeground">
              Total acumulado
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-foreground">
              {currency.format(total)}
            </Text>
          </View>
        )}

        {expensesQuery.isPending ? (
          <View className="rounded-3xl border border-border bg-card p-6">
            <Text className="text-base text-mutedForeground">Cargando gastos...</Text>
          </View>
        ) : expenses.length === 0 ? (
          <EmptyState
            title="Sin gastos registrados"
            description="Registra tus gastos para ver cómo afectan tu flujo de caja disponible."
          />
        ) : (
          expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))
        )}
      </ScrollView>

      <ExpenseFormSheet
        visible={formVisible}
        expense={selectedExpense}
        onClose={() => {
          setFormVisible(false);
          setSelectedExpense(null);
        }}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar gasto"
        message="¿Eliminar este gasto? Esta acción no se puede deshacer."
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          setConfirmVisible(false);
          setSelectedExpense(null);
        }}
      />
    </SafeAreaView>
  );
}
