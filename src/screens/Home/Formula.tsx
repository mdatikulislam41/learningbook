import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import PageLayout from '../../components/PageLayout';
import { Colors } from '../../constants/Colors';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getOrDownloadPdf, isPdfDownloaded } from '../../services/download';

type Formula = {
  id: number;
  title: string;
  box_bg:string;
  pdf_formula_url:string;
  serial:number;
};

type RootStackParamList = {
  FormulaScreen: undefined;
  PdfViewer: {
    localFile: string;
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FormulaScreen"
>;

export default function FormulaScreen() {
  const [formula, setFormula] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Record<number, boolean>>({});
  const navigation = useNavigation<NavigationProp>();

  async function openPdf(pdfUrl: string, id: number) {
    try {
      setDownloadProgress(0);

      const { localFile } = await getOrDownloadPdf(
        pdfUrl,
        "formula",
        (percent) => {
          setDownloadProgress(percent);
        }
      );
      setDownloadedIds((prev) => ({ ...prev, [id]: true }));
      navigation.navigate("PdfViewer", {
        localFile: localFile,
      });

    } catch (e) {
      console.log(e);
      Alert.alert("Error", "PDF download failed. Please try again.");
    } finally {
      setDownloadProgress(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('formulas')
        .select('id, title, serial, box_bg ,pdf_formula_url')
        .order('serial', { ascending: true });

      if (cancelled) {
        return;
      }

      if (error) {
        console.log('Supabase error:', error);
        setErrorMessage(error.message);
        setFormula([]);
      } else {
        const list = (data ?? []) as Formula[];
        setFormula(list);
        const status: Record<number, boolean> = {};
        await Promise.all(
          list.map(async (f) => {
            status[f.id] = await isPdfDownloaded(f.pdf_formula_url, "formula");
          })
        );
        setDownloadedIds(status);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Text style={{ color: '#DC2626', marginBottom: 8 }}>
          Could not load chapters
        </Text>
        <Text>{errorMessage}</Text>
      </View>
    );
  }

  if (formula.length === 0) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Text>No chapters found.</Text>
      </View>
    );
  }

  return (
    <>
    <PageLayout>
        <FlatList
                data={formula}
                contentContainerStyle={{ paddingBlockStart: 10, paddingInline: 20, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.card}
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={()=>{
                          openPdf(item.pdf_formula_url, item.id);
                        }}
                      >
         
                      <View style={[styles.chapterBox, {
                        backgroundColor: item.box_bg ?? Colors.button
                      }]}>
                        <Text style={styles.chapterNumber}>{item.serial}</Text>
                      </View>
                      <Text style={styles.chapterTitle}>{item.title}</Text>
                      {/* <View style={styles.chevronContainer}>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#cbd5e1"
                        />
                      </View> */}
                      <FileStatusIcon color={item.box_bg ?? Colors.button} downloaded={!!downloadedIds[item.id]} />
                    </TouchableOpacity>
                  </View>
        
                )}
              />
    </PageLayout>

    <Modal visible={downloadProgress !== null} transparent animationType="fade">
      <View style={styles.downloadOverlay}>
        <View style={styles.downloadCard}>
          <Text style={styles.downloadTitle}>Downloading Book…</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${downloadProgress ?? 0}%` },
              ]}
            />
          </View>
          <Text style={styles.downloadPercent}>{downloadProgress ?? 0}%</Text>
        </View>
      </View>
    </Modal>
    </>
  );
}

const FileStatusIcon = ({ color, downloaded }: { color: string; downloaded: boolean }) => {
  const iconColor = downloaded ? "#0d9488" : color;
  const badgeColor = downloaded ? "#10b981" : color;
  const badgeIcon = downloaded ? "checkmark-sharp" : "arrow-down-sharp";

  return (
    <View style={{
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  }}>
      <Ionicons name="document-text-outline" size={26} color={iconColor} />
      <View style={{
  position: "absolute",
  bottom: 4,
  right: 4,
  backgroundColor: "#fff",
  borderRadius: 9999,
  padding: 1,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,

  elevation: 2,
}}>
        <View
          style={{
            backgroundColor: badgeColor,
  width: 16,
  height: 16,
  borderRadius: 9999,
  alignItems: "center",
  justifyContent: "center"
}}
        >
          <Ionicons name={badgeIcon as any} size={10} color="#ffffff" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  container: {
    alignItems: "center",
    justifyContent: "center",
    width:"100%",
    flex:1,
    backgroundColor: "#a04d11",
    paddingInline:40,
  },
  pdfContainer:{
    paddingInline:64,
    paddingBlock:64,
  },
    card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chapterBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chapterTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    lineHeight: 22,
  },
   chapterNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  chevronContainer: {
    marginRight: 12,
  },
  downloadOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 8, 38, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 32,
  },
  downloadCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  progressTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.button,
    borderRadius: 9999,
  },
  downloadPercent: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.paragraph,
  },
});