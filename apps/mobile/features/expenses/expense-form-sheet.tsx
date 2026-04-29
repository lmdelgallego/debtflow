import { colors } from "@debtflow/design-tokens";
import type { Expense } from "@debtflow/domain";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { BottomSheet } from "@/components/bottom-sheet";
import { FormInput } from "@/components/form-input";
import { useCreateExpense, useUpdateExpense } from "./use-expense-mutations";

const CATEGORIES = [
  { value: "housing", label: "Casa" },
  { value: "food", label: "Alimentación" },
  { value: "transport", label: "Transporte" },
  { value: "utilities", label: "Servicios" },
  { value: "health", label: "Salud" },
  { value: "entertainment", label: "Entrete." },
  { value: "debt", label: "Deuda" },
  { value: "others", label: "Otros" }
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

interface FormState {
  category: Category;
  subcategory: string;
  description: string;
  amount: string;
  date: string;
  is_recurring: boolean;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getEmpty(): FormState {
  return {
    category: "others",
    subcategory: "",
    description: "",
    amount: "",
    date: todayStr(),
    is_recurring: false
  };
}

interface ExpenseFormSheetProps {
  visible: boolean;
  expense?: Expense | null;
  onClose: () => void;
}

export function ExpenseFormSheet({ visible, expense, onClose }: ExpenseFormSheetProps) {
  const [form, setForm] = useState<FormState>(getEmpty());
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const isEditing = Boolean(expense);
  const isPending = createExpense.isPending || updateExpense.isPending;

  useEffect(() => {
    if (visible) {
      if (expense) {
        setForm({
          category: (expense.category as Category) ?? "others",
          subcategory: expense.subcategory ?? "",
          description: expense.description ?? "",
          amount: String(expense.amount),
          date: expense.date,
          is_recurring: expense.is_recurring ?? false
        });
      } else {
        setForm(getEmpty());
      }
    }
  }, [visible, expense]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return Alert.alert("Error", "Ingresa un monto válido.");
    if (!form.date.match(/^\d{4}-\d{2}-\d{2}$/)) return Alert.alert("Error", "Fecha inválida. Usa el formato AAAA-MM-DD.");

    const input = {
      category: form.category,
      subcategory: form.subcategory.trim() || undefined,
      description: form.description.trim() || undefined,
      amount,
      date: form.date,
      is_recurring: form.is_recurring
    };

    if (isEditing && expense) {
      await updateExpense.mutateAsync({ id: expense.id, ...input });
    } else {
      await createExpense.mutateAsync(input);
    }

    onClose();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? "Editar gasto" : "Nuevo gasto"}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Categoría</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = form.category === cat.value;
              return (
                <Pressable
                  key={cat.value}
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: active ? colors.expense : colors.border,
                    backgroundColor: active ? colors.expense + "20" : "transparent"
                  }}
                  onPress={() => set("category", cat.value)}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: active ? colors.expense : colors.mutedForeground }}
                  >
                    {cat.label}
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
          onChangeText={(v) => set("amount", v)}
          keyboardType="decimal-pad"
          returnKeyType="next"
        />

        <FormInput
          label="Fecha (AAAA-MM-DD)"
          placeholder={todayStr()}
          value={form.date}
          onChangeText={(v) => set("date", v)}
          keyboardType="numbers-and-punctuation"
          returnKeyType="next"
        />

        <FormInput
          label="Descripción (opcional)"
          placeholder="Ej: Supermercado"
          value={form.description}
          onChangeText={(v) => set("description", v)}
          autoCapitalize="sentences"
          returnKeyType="done"
        />

        <Pressable
          className="flex-row items-center gap-3 rounded-2xl border border-border px-4 py-4"
          onPress={() => set("is_recurring", !form.is_recurring)}
        >
          <View
            className="h-5 w-5 items-center justify-center rounded"
            style={{
              backgroundColor: form.is_recurring ? colors.debt : "transparent",
              borderWidth: 1.5,
              borderColor: form.is_recurring ? colors.debt : colors.border
            }}
          >
            {form.is_recurring && (
              <Text style={{ color: "#fff", fontSize: 11, lineHeight: 14 }}>✓</Text>
            )}
          </View>
          <Text className="text-sm font-medium text-foreground">Gasto recurrente</Text>
        </Pressable>

        <Pressable
          className="mt-2 items-center rounded-2xl bg-foreground px-5 py-4"
          onPress={() => void handleSubmit()}
          disabled={isPending}
        >
          <Text className="font-semibold text-background">
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar gasto"}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}
