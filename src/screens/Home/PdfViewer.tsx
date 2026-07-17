import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Pdf from "react-native-pdf";
import Orientation from "react-native-orientation-locker";
import { useRoute, useNavigation } from "@react-navigation/native";
import PageLayout from "../../components/PageLayout";

export default function PdfViewer() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { localFile } = route.params;

  const [isLandscape, setIsLandscape] = useState(false);

  const source = localFile.startsWith("file://")
    ? { uri: localFile }
    : { uri: `file://${localFile}` };

  useEffect(() => {
    Orientation.lockToPortrait();
    return () => {
      Orientation.lockToPortrait();
      Orientation.unlockAllOrientations();
    };
  }, []);

  const handleRotate = () => {
    if (isLandscape) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setIsLandscape((prev) => !prev);
  };

  return (
    <PageLayout
      headerVariant="pdf"
      onBack={() => navigation.goBack()}
      onRotate={handleRotate}
    >
      <View style={{ flex: 1 }}>
        <Pdf
          source={source}
          style={{ flex: 1, backgroundColor: "#fff" }}
          onError={(error) => console.log("PDF ERROR:", error)}
          onLoadComplete={(pages) => console.log("PDF pages:", pages)}
        />
      </View>
    </PageLayout>
  );
}
