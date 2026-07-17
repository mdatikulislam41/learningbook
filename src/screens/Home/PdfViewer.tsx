import React from "react";
import { View } from "react-native";
import Pdf from "react-native-pdf";
import { useRoute } from "@react-navigation/native";
import PageLayout from "../../components/PageLayout";

export default function PdfViewer() {
  const route = useRoute<any>();
  const { localFile } = route.params;

  const source = localFile.startsWith("file://")
    ? { uri: localFile }
    : { uri: `file://${localFile}` };

  return (
    <PageLayout>
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