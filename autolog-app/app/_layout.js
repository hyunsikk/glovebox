import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { View } from 'react-native';
import { Colors } from '../theme';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';
import { SettingsProvider } from '../lib/SettingsContext';
import { requestNotificationPermissions, scheduleServiceNotifications } from '../lib/notifications';

function RootLayoutInner() {
  const { isDark, colors } = useTheme();

  useEffect(() => {
    (async () => {
      await requestNotificationPermissions();
      await scheduleServiceNotifications();
    })();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <RootLayoutInner />
      </SettingsProvider>
    </ThemeProvider>
  );
}