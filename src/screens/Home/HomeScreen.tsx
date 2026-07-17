import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PageLayout from '../../components/PageLayout'
import Ionicons from '@react-native-vector-icons/ionicons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { downloadPdf } from '../../services/download';

type Chapter = {
  id: number;
  title: string;
  chapter: number | string;
  boxbg?: string;
  pdf_url: string;
};
type RootStackParamList = {
  Home: undefined;
  PdfViewer: {
    localFile: string;
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const navigation = useNavigation<NavigationProp>();
   async function openPdf(pdfUrl: string) {
  try {
    // pdfsetLoading(true);

    const localFile = await downloadPdf(pdfUrl, "classSix");
    navigation.navigate("PdfViewer", {
      localFile: localFile,
    });
    // navigation.push("PdfViewer");
    //  Alert.alert("bangladesh",localFile);
    
  } catch (e) {
    console.log(e);
  } finally {
    // pdfsetLoading(false);
  }
}
    useEffect(() => {
        let cancelled = false;
    
        (async () => {
        const { data, error } = await supabase
          .from('chapters')
          .select('id, title, chapter, boxbg, pdf_url')
          .order('chapter', { ascending: true });
    
          if (cancelled) {
            return;
          }
    
          if (error) {
            console.log('Supabase error:', error);
            setErrorMessage(error.message);
            setChapters([]);
          } else {
            setChapters((data ?? []) as Chapter[]);
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
    
      if (chapters.length === 0) {
        return (
          <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            <Text>No chapters found.</Text>
          </View>
        );
      }
  return (

    <PageLayout>
      <FlatList
        data={chapters}
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
                  openPdf(item.pdf_url);
                }}
              >

              <View style={[styles.chapterBox, {
                backgroundColor: item.boxbg ?? Colors.button
              }]}>

                <Text style={styles.chapterNumber}>{item.chapter}</Text>
              </View>
              <Text style={styles.chapterTitle}>{item.title}</Text>
              <View style={styles.chevronContainer}>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#cbd5e1"
                />
              </View>
              {/* File Icon Status */}
              <FileStatusIcon color={item.boxbg ?? Colors.button} downloaded={false} />
            </TouchableOpacity>
          </View>

        )}
      />
    </PageLayout>
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
    padding: 14,
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
    width: 48,
    height: 48,
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
    fontSize: 18,
    fontWeight: "500",
    color: "#1e293b",
    lineHeight: 22,
  },
   chapterNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  chevronContainer: {
    marginRight: 12,
  },
});