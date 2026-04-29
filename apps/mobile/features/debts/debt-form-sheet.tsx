import type { Debt } from "@debtflow/domain";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";
import { BottomSheet } from "@/components/bottom-sheet";
import { FormInput } from "@/components/form-input";
import { useCreateDebt, useUpdateDebt } from "./use-debt-mutations";

interface DebtFormSheetProps {
  visible: boolean;
  debt?: Debt | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  balance: string;
  interest_rate: string;
  minimum_payment: string;
  payment_day: string;
}

const empty: FormState = {
  name: "",
  balance: "",
  interest_rate: "",
  minimum_payment: "",
  payment_day: ""
};

export function DebtFormSheet({ visible, debt, onClose }: DebtFormSheetProps) {
  const [form, setForm] = useState<FormState>(empty);
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();

  const isEditing = Boolean(debt);
  const isPending = createDebt.isPending || updateDebt.isPending;

  useEffect(() => {
    if (visible) {
      if (debt) {
        setForm({
          name: debt.name,
          balance: String(debt.balance),
          interest_rate: String(debt.interest_rate),
          minimum_payment: String(debt.minimum_payment),
          payment_day: String(debt.payment_day)
        });
      } else {
        setForm(empty);
      }
    }
  }, [visible, debt]);

  function set(field: keyof FormState) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const name = form.name.trim();
    const balance = parseFloat(form.balance);
    const interest_rate = parseFloat(form.interest_rate);
    const minimum_payment = parseFloat(form.minimum_payment);
    const payment_day = parseInt(form.payment_day, 10);

    if (!name) return Alert.alert("Error", "El nombre es obligatorio.");
    if (isNaN(balance) || balance < 0) return Alert.alert("Error", "Saldo inválido.");
    if (isNaN(interest_rate) || interest_rate < 0) return Alert.alert("Error", "Tasa inválida.");
    if (isNaN(minimum_payment) || minimum_payment <= 0) return Alert.alert("Error", "Pago mínimo inválido.");
    if (isNaN(payment_day) || payment_day < 1 || payment_day > 31) return Alert.alert("Error", "Día de pago debe ser entre 1 y 31.");

    const input = { name, balance, interest_rate, minimum_payment, payment_day };

    if (isEditing && debt) {
      await updateDebt.mutateAsync({ id: debt.id, ...input });
    } else {
      await createDebt.mutateAsync(input);
    }

    onClose();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? "Editar deuda" : "Nueva deuda"}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="gap-4">
        <FormInput
          label="Nombre"
          placeholder="Ej: Tarjeta Visa"
          value={form.name}
          onChangeText={set("name")}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <FormInput
          label="Saldo actual"
          placeholder="0"
          value={form.balance}
          onChangeText={set("balance")}
          keyboardType="decimal-pad"
          returnKeyType="next"
        />
        <FormInput
          label="Tasa de interés anual (%)"
          placeholder="Ej: 24.5"
          value={form.interest_rate}
          onChangeText={set("interest_rate")}
          keyboardType="decimal-pad"
          returnKeyType="next"
        />
        <FormInput
          label="Pago mínimo mensual"
          placeholder="0"
          value={form.minimum_payment}
          onChangeText={set("minimum_payment")}
          keyboardType="decimal-pad"
          returnKeyType="next"
        />
        <FormInput
          label="Día de pago (1–31)"
          placeholder="Ej: 15"
          value={form.payment_day}
          onChangeText={set("payment_day")}
          keyboardType="number-pad"
          returnKeyType="done"
        />

        <Pressable
          className="mt-2 items-center rounded-2xl bg-foreground px-5 py-4"
          onPress={() => void handleSubmit()}
          disabled={isPending}
        >
          <Text className="font-semibold text-background">
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar deuda"}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}
