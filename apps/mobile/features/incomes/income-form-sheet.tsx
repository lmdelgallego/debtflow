import { colors } from "@debtflow/design-tokens";
import type { Income } from "@debtflow/domain";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { BottomSheet } from "@/components/bottom-sheet";
import { FormInput } from "@/components/form-input";
import { useCreateIncome, useUpdateIncome } from "./use-income-mutations";

type IncomeType = "fixed" | "variable";

interface FormState {
  type: IncomeType;
  amount: string;
  description: string;
}

const empty: FormState = { type: "fixed", amount: "", description: "" };

interface IncomeFormSheetProps {
  visible: boolean;
  income?: Income | null;
  onClose: () => void;
}

export function IncomeFormSheet({ visible, income, onClose }: IncomeFormSheetProps) {
  const [form, setForm] = useState<FormState>(empty);
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();

  const isEditing = Boolean(income);
  const isPending = createIncome.isPending || updateIncome.isPending;

  useEffect(() => {
    if (visible) {
      if (income) {
        setForm({
          type: income.type,
          amount: String(income.amount),
          description: income.description ?? ""
        });
      } else {
        setForm(empty);
      }
    }
  }, [visible, income]);

  async function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return Alert.alert("Error", "Ingresa un monto válido.");

    const input = {
      type: form.type,
      amount,
      description: form.description.trim() || undefined
    };

    if (isEditing && income) {
      await updateIncome.mutateAsync({ id: income.id, ...input });
    } else {
      await createIncome.mutateAsync(input);
    }

    onClose();
  }

  const typeOptions: { value: IncomeType; label: string }[] = [
    { value: "fixed", label: "Fijo" },
    { value: "variable", label: "Variable" }
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? "Editar ingreso" : "Nuevo ingreso"}
    >
      <View className="gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Tipo</Text>
          <View className="flex-row gap-2">
            {typeOptions.map((opt) => {
              const active = form.type === opt.value;
              const accent = opt.value === "fixed" ? colors.income : colors.expense;
              return (
                <Pressable
                  key={opt.value}
                  className="flex-1 items-center rounded-2xl border py-3"
                  style={{
                    borderColor: active ? accent : colors.border,
                    backgroundColor: active ? accent + "20" : "transparent"
                  }}
                  onPress={() => setForm((prev) => ({ ...prev, type: opt.value }))}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: active ? accent : colors.mutedForeground }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FormInput
          label="Monto"
          placeholder="0"
          value={form.amount}
          onChangeText={(v) => setForm((prev) => ({ ...prev, amount: v }))}
          keyboardType="decimal-pad"
          returnKeyType="next"
        />

        <FormInput
          label="Descripción (opcional)"
          placeholder="Ej: Salario mensual"
          value={form.description}
          onChangeText={(v) => setForm((prev) => ({ ...prev, description: v }))}
          autoCapitalize="sentences"
          returnKeyType="done"
        />

        <Pressable
          className="mt-2 items-center rounded-2xl bg-foreground px-5 py-4"
          onPress={() => void handleSubmit()}
          disabled={isPending}
        >
          <Text className="font-semibold text-background">
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar ingreso"}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
