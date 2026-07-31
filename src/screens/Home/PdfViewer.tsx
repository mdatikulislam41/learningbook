import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import Orientation from 'react-native-orientation-locker';
import { useRoute, useNavigation } from '@react-navigation/native';
import PageLayout from '../../components/PageLayout';
import { saveReadingHistory } from '../../services/readingHistory';

type RouteParams = {
  localFile: string;
  title: string;
  type: 'chapter' | 'formula';
  startPage?: number;
};

export default function PdfViewer() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { localFile, title, type, startPage }: RouteParams = route.params || {};

  const [isLandscape, setIsLandscape] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);

  const pdfRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(startPage || 1);
  const [totalPages, setTotalPages] = useState(0);
  const pdfTitle = title || 'Untitled';
  const pdfType = type || 'chapter';

  const latestPageRef = useRef(currentPage);
  const latestTotalRef = useRef(totalPages);
  const localFileRef = useRef(localFile);
  const pdfTitleRef = useRef(pdfTitle);
  const pdfTypeRef = useRef(pdfType);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  latestPageRef.current = currentPage;
  latestTotalRef.current = totalPages;
  localFileRef.current = localFile;
  pdfTitleRef.current = pdfTitle;
  pdfTypeRef.current = pdfType;

  const saveDebounced = () => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }
    saveDebounceRef.current = setTimeout(() => {
      if (latestTotalRef.current > 0 && localFileRef.current) {
        saveReadingHistory({
          pdfUrl: localFileRef.current,
          localFile: localFileRef.current,
          title: pdfTitleRef.current,
          currentPage: latestPageRef.current,
          totalPages: latestTotalRef.current,
          type: pdfTypeRef.current,
        });
      }
    }, 400);
  };

  const source = localFile?.startsWith('file://')
    ? { uri: localFile }
    : { uri: `file://${localFile}` };

  useEffect(() => {
    Orientation.unlockAllOrientations();
    const onOrientationChange = (orientation: string) => {
      const landscape =
        orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT';
      setIsLandscape(landscape);
    };
    Orientation.addOrientationListener(onOrientationChange);
    setHeaderVisible(true);
    return () => {
      Orientation.removeOrientationListener(onOrientationChange);
      Orientation.unlockAllOrientations();

      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (latestTotalRef.current > 0 && localFileRef.current) {
        saveReadingHistory({
          pdfUrl: localFileRef.current,
          localFile: localFileRef.current,
          title: pdfTitleRef.current,
          currentPage: latestPageRef.current,
          totalPages: latestTotalRef.current,
          type: pdfTypeRef.current,
        });
      }
    };
  }, []);

  useEffect(() => {
    if (isLandscape) {
      setHeaderVisible(false);
    } else {
      setHeaderVisible(true);
    }
  }, [isLandscape]);

  useEffect(() => {
    if (totalPages > 0 && startPage && startPage > 1 && startPage <= totalPages) {
      pdfRef.current?.setPage(startPage);
    }
  }, [totalPages, startPage]);

  const toggleHeader = () => {
    if (isLandscape) {
      setHeaderVisible(prev => !prev);
    }
  };

  const handleRotate = () => {
    if (isLandscape) {
      Orientation.lockToPortrait();
      setIsLandscape(false);
    } else {
      Orientation.lockToLandscape();
      setIsLandscape(true);
    }
  };

  const handleStart = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStart.current = { x: pageX, y: pageY };
  };

  const handleEnd = (e: any) => {
    if (!touchStart.current) return;
    const { pageX, pageY } = e.nativeEvent;
    const dx = Math.abs(pageX - touchStart.current.x);
    const dy = Math.abs(pageY - touchStart.current.y);
    touchStart.current = null;
    if (dx < 10 && dy < 10) {
      toggleHeader();
    }
  };

  return (
    <PageLayout
      headerVisible={headerVisible}
      headerVariant="pdf"
      onBack={() => navigation.goBack()}
      onRotate={handleRotate}
    >
      <View style={styles.container} onTouchStart={handleStart} onTouchEnd={handleEnd}>
        <Pdf
          ref={pdfRef}
          source={source}
          fitPolicy={0}
          style={styles.pdf}
          onError={error => console.log('PDF ERROR:', error)}
          onLoadComplete={pages => {
            setTotalPages(pages);
            if ((startPage && startPage > 1) || latestPageRef.current > 1) {
              saveDebounced();
            }
          }}
          onPageChanged={(page) => {
            setCurrentPage(page);
            saveDebounced();
          }}
        />

        <Pressable
          style={styles.pageButton}
          onPress={() => {
            const next =
              currentPage >= totalPages ? totalPages : currentPage + 1;

            pdfRef.current?.setPage(next);
          }}
        >
          <Text style={styles.pageText}>
            {currentPage}
          </Text>

          <Text style={styles.totalText}>
            /{totalPages}
          </Text>
        </Pressable>
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#3a0707"
  },
  pdf: {
    flex: 1,
    backgroundColor: '#fff',
  },


  pageButton: {
  position: 'absolute',
  right: 15,
  top: '50%',

  width: 58,
  height: 58,

  borderRadius: 29,
  backgroundColor: '#000000CC',

  justifyContent: 'center',
  alignItems: 'center',
  },

  pageText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 18,
  },

  totalText: {
  color: '#ddd',
  fontSize: 11,
  },
});
