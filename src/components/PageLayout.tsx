import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import { View } from "react-native";

type PageLayoutProps = {
  children: React.ReactNode;
  headerVariant?: "default" | "pdf";
  headerVisible?: boolean;
  onBack?: () => void;
  onRotate?: () => void;
};

export default function PageLayout({
  children,
  headerVariant = "default",
  headerVisible = true,
  onBack,
  onRotate,
}: PageLayoutProps) {
  return (
    <>
       
        <SafeAreaView style={{ flex: 1, width: "100%" }} edges={["top", "right"]}>
        {headerVisible && <Header variant={headerVariant} onBack={onBack} onRotate={onRotate} />}
        {children}
      </SafeAreaView>
       
    </>
  );
}
