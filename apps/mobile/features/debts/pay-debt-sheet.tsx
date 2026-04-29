import { colors } from "@debtflow/design-tokens";
import type { Debt } from "@debtflow/domain";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { BottomSheet } from "@/components/bottom-sheet";
import { FormInput } from "@/components/form-input";
import { usePayDebt } from "./use-debt-mutations";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

interface PayDebtSheetProps {
  visible: boolean;
  debt: Debt | null;
  onClose: () => void;
}

export function PayDebtSheet({ visible, debt, onClose }: PayDebtSheetProps) {
  const [amount, setAmount] = useState("");
  const [createExpenseLog, setCreateExpenseLog] = useState(true);
  const payDebt = usePayDebt();

  useEffect(() => {
    if (visible && debt) {
      setAmount(String(debt.minimum_payment));
      setCreateExpenseLog(true);
    }
  }, [visible, debt]);

  async function handlePay() {
    if (!debt) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return Alert.alert("Error", "Ingresa un monto válido.");
    if (parsed > debt.balance) return Alert.alert("Error", `El monto no puede ser mayor al saldo (${currency.format(debt.balance)}).`);

    await payDebt.mutateAsync({
      debtId: debt.id,
      debtName: debt.name,
      currentBalance: debt.balance,
      amount: parsed,
      createExpenseLog
    });

    onClose();
  }

  if (!debt) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`Pagar: ${debt.name}`}>
      <View className="gap-4">
        <View className="rounded-2xl border border-border bg-background p-4">
          <Text className="text-xs text-mutedForeground">Saldo restante</Text>
          <Text className="mt-1 text-2xl font-semibold text-foreground">
            {currency.format(debt.balance)}
          </Text>
        </View>

        <FormInput
          label="Monto a pagar"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />

        <Pressable
          className="flex-row items-center gap-3 rounded-2xl border border-border px-4 py-4"
          onPress={() => setCreateExpenseLog((v) => !v)}
        >
          <View
            className="h-5 w-5 items-center justify-center rounded"
            style={{
              backgroundColor: createExpenseLog ? colors.debt : "transparent",
              borderWidth: 1.5,
              borderColor: createExpenseLog ? colors.debt : colors.border
            }}
          >
            {createExpenseLog && <Text style={{ color: "#fff", fontSize: 11, lineHeight: 14 }}>✓</Text>}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-foreground">Registrar como gasto</Text>
            <Text className="text-xs text-mutedForeground">
              Se agrega un gasto en categoría "deuda"
            </Text>
          </View>
        </Pressable>

        <Pressable
          className="mt-2 items-center rounded-2xl px-5 py-4"
          style={{ backgroundColor: colors.debt }}
          onPress={() => void handlePay()}
          disabled={payDebt.isPending}
        >
          <Text className="font-semibold text-foreground">
            {payDebt.isPending ? "Procesando..." : "Confirmar pago"}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
