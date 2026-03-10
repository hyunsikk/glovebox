import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../theme';
import { useTheme } from '../../lib/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface1,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_500Medium',
          fontSize: 11,
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          ...Typography.hero,
          color: colors.textPrimary,
          fontSize: 24,
        },
      }}
    >
      <Tabs.Screen
        name="garage"
        options={{
          title: 'garage',
          headerTitle: 'your garage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'history',
          headerTitle: 'history',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'insights',
          headerTitle: 'insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'learn',
          headerTitle: 'knowledge base',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}