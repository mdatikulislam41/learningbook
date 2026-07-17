import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./header";


type PageLayoutProps = {
  children: React.ReactNode;
};
export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <SafeAreaView style={{flex:1}} edges={["top","right",]}>
        <Header />
        {children}
      </SafeAreaView>
    </>
  );
}