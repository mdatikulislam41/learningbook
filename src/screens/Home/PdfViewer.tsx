import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import Orientation from 'react-native-orientation-locker';
import { useRoute, useNavigation } from '@react-navigation/native';
import PageLayout from '../../components/PageLayout';

export default function PdfViewer() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { localFile } = route.params;

  const [isLandscape, setIsLandscape] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);

  const source = localFile.startsWith('file://')
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
    };
  }, []);

  useEffect(() => {
    if (isLandscape) {
      setHeaderVisible(false);
    } else {
      setHeaderVisible(true);
    }
  }, [isLandscape]);

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
          source={source}
          fitPolicy={0}
          style={styles.pdf}
          onError={error => console.log('PDF ERROR:', error)}
          onLoadComplete={pages => console.log('PDF pages:', pages)}
        />
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
});
