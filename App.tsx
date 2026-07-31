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
        barStyle={isDarkMode ? 'dark-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#000'}
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
