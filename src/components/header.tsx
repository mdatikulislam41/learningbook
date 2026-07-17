import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "@react-native-vector-icons/ionicons";

type HeaderProps = {
  variant?: "default" | "pdf";
  onBack?: () => void;
  onRotate?: () => void;
};

export default function Header({ variant = "default", onBack, onRotate }: HeaderProps) {
  if (variant === "pdf") {
    return (
      <View style={styles.pdfHeader}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pdfTitle}>PDF Viewer</Text>
        <TouchableOpacity onPress={onRotate} style={styles.iconButton}>
          <Icon name="phone-portrait-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.defaultHeader}>
      <Text style={styles.defaultTitle}>Header</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1e1e2e",
    alignItems: "center",
  },
  defaultTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  pdfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1e1e2e",
  },
  pdfTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    padding: 6,
  },
});
