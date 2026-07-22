import { createNativeStackNavigator } from "@react-navigation/native-stack"
import FormulaScreen from "../screens/Home/Formula"
import PdfViewer from "../screens/Home/PdfViewer"

const Stack = createNativeStackNavigator()

export default function FormulaStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="FormulaScreen" component={FormulaScreen} />
      <Stack.Screen name="PdfViewer" component={PdfViewer} />
    </Stack.Navigator>
  )
}
