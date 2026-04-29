import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancel} />
        <View className="mx-6 rounded-3xl border border-border bg-card p-6">
          <Text className="text-lg font-semibold text-foreground">{title}</Text>
          <Text className="mt-2 text-sm leading-6 text-mutedForeground">{message}</Text>
          <View className="mt-6 gap-3">
            <Pressable
              className="items-center rounded-2xl bg-danger px-5 py-4"
              onPress={onConfirm}
            >
              <Text className="font-semibold text-foreground">{confirmLabel}</Text>
            </Pressable>
            <Pressable
              className="items-center rounded-2xl border border-border px-5 py-4"
              onPress={onCancel}
            >
              <Text className="font-medium text-foreground">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)"
  }
});
