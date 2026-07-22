import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PageLayout from '../../components/PageLayout'
import Ionicons from '@react-native-vector-icons/ionicons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getOrDownloadPdf, isPdfDownloaded } from '../../services/download';

type Chapter = {
  id: number;
  title: string;
  chapter: number | string;
  boxbg?: string;
  pdf_url: string;
};
type RootStackParamList = {
  HomeScreen: undefined;
  PdfViewer: {
    localFile: string;
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HomeScreen"
>;

export default function HomeScreen() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [downloadedIds, setDownloadedIds] = useState<Record<number, boolean>>({});
    const [refreshing, setRefreshing] = useState(false);
    const [noInternet, setNoInternet] = useState(false);
  const navigation = useNavigation<NavigationProp>();
    async function loadChapters(isRefresh = false) {
      if (isRefresh) {
        setRefreshing(true);
        setErrorMessage(null);
        setNoInternet(false);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, chapter, boxbg, pdf_url')
        .order('chapter', { ascending: true });

      if (error) {
        console.log('Supabase error:', error);
        const isNetworkError =
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('fetch') ||
          error.code === 'PGRST000' && error.message?.toLowerCase().includes('failed');
        setNoInternet(!!isNetworkError);
        setErrorMessage(error.message);
        setChapters([]);
      } else {
        const list = (data ?? []) as Chapter[];
        setChapters(list);
        const status: Record<number, boolean> = {};
        await Promise.all(
          list.map(async (c) => {
            status[c.id] = await isPdfDownloaded(c.pdf_url, "classSix");
          })
        );
        setDownloadedIds(status);
      }

      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
    async function openPdf(pdfUrl: string, id: number) {
  try {
    setDownloadProgress(0);

    const { localFile } = await getOrDownloadPdf(
      pdfUrl,
      "classSix",
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
        loadChapters();
      }, []);

      const onRefresh = () => loadChapters(true);
      
      if (loading) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        );
      }
    
      if (errorMessage) {
        return (
          <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
            {noInternet ? (
              <Text style={{ color: '#DC2626', marginBottom: 16, textAlign: 'center' }}>
                Please turn on your data to load chapters.
              </Text>
            ) : (
              <>
                <Text style={{ color: '#DC2626', marginBottom: 8 }}>
                  Could not load chapters
                </Text>
                <Text style={{ marginBottom: 16, textAlign: 'center' }}>{errorMessage}</Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.card, { paddingHorizontal: 24, paddingVertical: 10, marginBottom: 0 }]}
              activeOpacity={0.8}
              disabled={refreshing}
              onPress={() => loadChapters(true)}
            >
              {refreshing
                ? <ActivityIndicator color={Colors.button} />
                : <Text style={{ color: Colors.button, fontWeight: '600' }}>Try Again</Text>}
            </TouchableOpacity>
          </View>
        );
      }
    
      if (chapters.length === 0) {
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
        data={chapters}
        contentContainerStyle={{ paddingBlockStart: 10, paddingInline: 20, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.card}
              key={item.id}
              activeOpacity={0.8}
              onPress={()=>{
                  openPdf(item.pdf_url, item.id);
                }}
              >

              <View style={[styles.chapterBox, {
                backgroundColor: item.boxbg ?? Colors.button
              }]}>

                <Text style={styles.chapterNumber}>{item.chapter}</Text>
              </View>
              <Text style={styles.chapterTitle}>{item.title}</Text>
              {/* File Icon Status */}
              <FileStatusIcon color={item.boxbg ?? Colors.button} downloaded={!!downloadedIds[item.id]} />
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
  )
}

// File Status Icon Component (matching the document outline + badge style)
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
  bottom: 4,             // bottom-1
  right: 4,              // right-1
  backgroundColor: "#fff",
  borderRadius: 9999,    // rounded-full
  padding: 1,            // p-[1px]

  // iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,

  // Android shadow
  elevation: 2,
}}>
        <View
          
          style={{
            backgroundColor: badgeColor,
  width: 16,               // w-4
  height: 16,              // h-4
  borderRadius: 9999,      // rounded-full
  alignItems: "center",    // items-center
  justifyContent: "center" // justify-center
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