import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { View } from 'react-native';
import { Colors } from '../theme';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';
import { SettingsProvider } from '../lib/SettingsContext';
import { PurchaseProvider } from '../lib/PurchaseContext';
import { requestNotificationPermissions, scheduleServiceNotifications } from '../lib/notifications';
import { initVehicleDB, checkForUpdate } from '../lib/vehicleDB';

function RootLayoutInner() {
  const { isDark, colors } = useTheme();

  useEffect(() => {
    (async () => {
      await requestNotificationPermissions();
      await scheduleServiceNotifications();
      // Load any cached remote vehicle data, then check for updates in the
      // background (throttled to once a day; falls back to bundled on failure).
      await initVehicleDB();
      checkForUpdate().catch(() => {});
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
        <PurchaseProvider>
          <RootLayoutInner />
        </PurchaseProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}