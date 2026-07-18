import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screens/Home/HomeScreen"
import PdfViewer from "../screens/Home/PdfViewer"

const Stack =createNativeStackNavigator()
export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown:false,
    }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="PdfViewer" component={PdfViewer} />
    </Stack.Navigator>
  )
}
