/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { useForceUpdate } from './src/update';
import { ForceUpdateModal } from './src/update/ForceUpdateModal';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
const {
    visible,
    updateInfo,
    dismiss,
  } = useForceUpdate();
  return (
    <SafeAreaProvider style={{backgroundColor:Colors.background}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.background}
        translucent={false}
      />
      {/* <AppContent /> */}
      <AppNavigator/>
       <ForceUpdateModal
        visible={visible}
        updateInfo={updateInfo}
        onDismiss={dismiss}
      />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
