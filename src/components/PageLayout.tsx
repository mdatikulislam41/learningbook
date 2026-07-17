import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";

type PageLayoutProps = {
  children: React.ReactNode;
  headerVariant?: "default" | "pdf";
  onBack?: () => void;
  onRotate?: () => void;
};

export default function PageLayout({
  children,
  headerVariant = "default",
  onBack,
  onRotate,
}: PageLayoutProps) {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "right"]}>
        <Header variant={headerVariant} onBack={onBack} onRotate={onRotate} />
        {children}
      </SafeAreaView>
    </>
  );
}
