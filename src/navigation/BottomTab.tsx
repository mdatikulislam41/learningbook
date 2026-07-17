import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { ComponentProps } from 'react';

import BookMark from '../screens/Home/BookMark';
import HistoryScreen from '../screens/Home/History';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator();

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TabIconProps = {
  routeName: string;
  color: string;
  size: number;
  focused: boolean;
};

function TabIcon({ routeName, color, size, focused }: TabIconProps) {
  let iconName: IoniconName = 'time-outline';

  if (routeName === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (routeName === 'BookMark') {
    iconName = focused ? 'bookmark' : 'bookmark-outline';
  } else {
    iconName = focused ? 'time' : 'time-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
}

export default function BottomTab() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, size, focused }) => (
          <TabIcon
            routeName={route.name}
            color={color}
            size={size}
            focused={focused}
          />
        ),
      })}
    >
      <Tab.Screen
        name="BookMark"
        component={BookMark}
        options={{ title: 'Bookmark' }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
    </Tab.Navigator>
  );
}
