/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { useForceUpdate } from './src/update';
import { ForceUpdateModal } from './src/update/ForceUpdateModal';
import { useEffect } from 'react';
import MobileAds from 'react-native-google-mobile-ads';
import { preloadPdfOpenInterstitialAd } from './src/services/ads';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
const {
    visible,
    updateInfo,
    dismiss,
  } = useForceUpdate();

  useEffect(() => {
    MobileAds().initialize().then(() => {
      preloadPdfOpenInterstitialAd();
    });
  }, []);

  return (
    <SafeAreaProvider style={{backgroundColor:Colors.background}}>
      <StatusBar
         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.background}
        translucent={false}
      />
      <AppNavigator/>

      <ForceUpdateModal
        visible={visible}
        updateInfo={updateInfo}
        onDismiss={dismiss}
      />
    </SafeAreaProvider>
  );
}

export default App;
