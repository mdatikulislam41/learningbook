import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Icon, { Ionicons } from "@react-native-vector-icons/ionicons";
import { Colors } from "../constants/Colors";

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
          <Icon name="arrow-back" size={24} color={Colors.button} />
        </TouchableOpacity>
        <Text style={styles.pdfTitle}>PDF Viewer</Text>
        <TouchableOpacity onPress={onRotate} style={styles.iconButton}>
          <Icon name="phone-portrait-outline" size={24} color={Colors.button} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.defaultHeader}>
      <View style={{
          display:"flex",
          flexDirection:"row",
          justifyContent: "space-between",
          width:"100%"
        }}>
         <Text style={{ color: Colors.black, fontSize: 16,fontWeight:600 }}>
        {/* {topHeader[0]?.subject} */}
        গণিত সমাধান
        </Text>
        <View style={{display:"flex",flexDirection:"row",gap:10,alignItems:"center",backgroundColor:"#132a6d",paddingInline:15,borderRadius:20}}>
          <Ionicons name="book" size={16} color="#fff" />
          <Text style={{ color: Colors.white, fontSize: 14,fontWeight:500 }}>
          {/* {topHeader[0]?.class} */}
          নবম ও দশম শ্রেণি
          </Text>
        </View>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
  },
  pdfTitle: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    padding: 6,
  },
});
