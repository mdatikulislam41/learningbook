import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import Orientation from 'react-native-orientation-locker';
import { useRoute, useNavigation } from '@react-navigation/native';
import PageLayout from '../../components/PageLayout';

export default function PdfViewer() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { localFile } = route.params;

  const [isLandscape, setIsLandscape] = useState(false);
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  const source = localFile.startsWith('file://')
    ? { uri: localFile }
    : { uri: `file://${localFile}` };

  useEffect(() => {
    const onChange = ({ window }: { window: any }) => setDimensions(window);
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

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
    setIsLandscape(prev => !prev);
    setTimeout(() => setDimensions(Dimensions.get('window')), 300);
  };

  return (
    <PageLayout
      headerVariant="pdf"
      onBack={() => navigation.goBack()}
      onRotate={handleRotate}
    >
      <View style={styles.container} >
        <Pdf
          key={`${dimensions.width}x${dimensions.height}`}
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
