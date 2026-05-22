import React, { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { View, Text, TouchableOpacity, AppState, Alert } from 'react-native';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';
import { SettingsProvider } from '../lib/SettingsContext';
import { PurchaseProvider } from '../lib/PurchaseContext';
import {
  requestNotificationPermissions,
  scheduleServiceNotifications,
  addNotificationResponseListener,
  getInitialNotificationVehicleId,
} from '../lib/notifications';
import { initVehicleDB, checkForUpdate } from '../lib/vehicleDB';
import { DataUtils } from '../lib/storage';
import { scheduleAutoBackup, shouldOfferRestore, restoreFromBackup } from '../lib/backup';
import { DataVersionProvider, useDataVersion } from '../lib/DataVersion';

/**
 * Catches render-time errors anywhere in the tree so a single bad component
 * shows a recoverable fallback instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Render error caught by ErrorBoundary:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Text style={[Typography.h1, { color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md }]}>
            Something went wrong
          </Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }]}>
            The app hit an unexpected error. Your saved data is safe on this device.
          </Text>
          <TouchableOpacity style={[Shared.buttonPrimary, { paddingHorizontal: Spacing.xl }]} onPress={() => this.setState({ error: null })} activeOpacity={0.85}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#FFFFFF' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayoutInner() {
  const { isDark, colors } = useTheme();
  const router = useRouter();
  // After a successful restore, bump the global data version so already-mounted
  // screens (e.g. the garage) re-read the freshly imported data immediately.
  const { bumpDataVersion } = useDataVersion();

  useEffect(() => {
    (async () => {
      // Migrate stored data before anything reads it.
      await DataUtils.runMigrations();
      // Fresh install / no local data but a backup exists (e.g. after reinstall
      // or on a new device via iCloud) — offer to restore it.
      if (await shouldOfferRestore()) {
        Alert.alert(
          'Restore your data?',
          'We found a Car Story backup for this device. Restore your vehicles and records now?',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Restore', onPress: async () => {
              const r = await restoreFromBackup();
              if (r.success) {
                bumpDataVersion(); // make mounted screens reload the restored data
                Alert.alert('Restored', `Recovered ${r.vehicleCount} vehicle(s) from your backup.`);
              } else {
                Alert.alert(
                  'Restore failed',
                  r.reason === 'none'
                    ? 'No backup could be read. Make sure you are signed into the same iCloud account.'
                    : (r.error || 'Could not restore your backup. Please try again.'),
                );
              }
            } },
          ],
        );
      }
      await requestNotificationPermissions();
      await scheduleServiceNotifications();
      // Load any cached remote vehicle data, then check for updates in the
      // background (throttled to once a day; falls back to bundled on failure).
      await initVehicleDB();
      checkForUpdate().catch(() => {});
    })();
  }, []);

  // Route notification taps (recall + service) to the affected vehicle.
  // Gate on the navigator being mounted — calling router.navigate on cold start
  // before the root navigation state is ready throws / silently drops.
  const navState = useRootNavigationState();
  useEffect(() => {
    if (!navState?.key) return;
    const openVehicle = (vehicleId) =>
      router.navigate({ pathname: '/(tabs)/garage', params: { openVehicleId: vehicleId } });

    const sub = addNotificationResponseListener(openVehicle);
    getInitialNotificationVehicleId().then((id) => { if (id) openVehicle(id); });

    return () => sub.remove();
  }, [router, navState?.key]);

  // Auto-backup when the app goes to the background (debounced; respects the
  // user's toggle). Cheap insurance against data loss between manual backups.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') scheduleAutoBackup();
    });
    return () => sub.remove();
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
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <PurchaseProvider>
            <DataVersionProvider>
              <RootLayoutInner />
            </DataVersionProvider>
          </PurchaseProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
