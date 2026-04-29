import { colors } from "@debtflow/design-tokens";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View
            className="rounded-t-3xl border border-b-0 border-border bg-card px-5 pb-12 pt-6"
            style={styles.sheet}
          >
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-foreground">{title}</Text>
              <Pressable
                className="h-8 w-8 items-center justify-center rounded-full bg-muted"
                onPress={onClose}
                hitSlop={8}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>✕</Text>
              </Pressable>
            </View>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)"
  },
  keyboardView: {
    width: "100%"
  },
  sheet: {
    width: "100%"
  }
});
