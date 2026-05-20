import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VehicleStorage, SettingsStorage } from './storage';
import { ServiceDue } from './analytics';
import { syncRecallNotifications } from './recalls';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// Schedule notifications for all vehicles' upcoming services
export async function scheduleServiceNotifications() {
  if (Platform.OS === 'web') return;

  try {
    const settings = await SettingsStorage.get();
    if (!settings.notifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Cancel existing scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const daysBeforeDue = settings.notificationTiming || 7;
    const vehicles = await VehicleStorage.getAll();

    // Overdue notifications fire immediately (trigger:null), so without a guard
    // they'd re-fire every time this runs (app launch, after logging a service).
    // De-dupe to at most once per item per day.
    const today = new Date().toISOString().slice(0, 10);
    const overdueNotified = JSON.parse((await AsyncStorage.getItem('@autolog_overdue_notified')) || '{}');

    for (const vehicle of vehicles) {
      const vehicleName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

      try {
        // Get services due within the notification window (daysBeforeDue + 30 for overdue)
        const upcomingServices = await ServiceDue.getUpcomingServices(vehicle.id, daysBeforeDue + 30);

        for (const service of upcomingServices) {
          if (service.isOverdue) {
            const ovKey = `${vehicle.id}|${service.service}`;
            if (overdueNotified[ovKey] === today) continue; // already alerted today
            // Deliver now (a short interval could be wiped by the next cancelAll).
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Overdue: ${service.service}`,
                body: `${vehicleName} — this service is overdue. Schedule it soon!`,
                data: { vehicleId: vehicle.id, serviceType: service.service },
              },
              trigger: null,
            });
            overdueNotified[ovKey] = today;
          } else if (service.daysUntilDue <= daysBeforeDue && service.daysUntilDue >= 0) {
            // Fire on the due date. A wall-clock date trigger survives reboots and
            // timezone shifts, unlike a multi-million-second interval timer.
            const fireDate = new Date(Date.now() + service.daysUntilDue * 24 * 60 * 60 * 1000);
            // Date triggers must be in the future; nudge same-day ones forward.
            if (fireDate.getTime() <= Date.now() + 60 * 1000) {
              fireDate.setTime(Date.now() + 60 * 1000);
            }
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Upcoming: ${service.service}`,
                body: `${vehicleName} — due in ${service.daysUntilDue} day${service.daysUntilDue !== 1 ? 's' : ''}`,
                data: { vehicleId: vehicle.id, serviceType: service.service },
              },
              trigger: { type: 'date', date: fireDate.getTime() },
            });
          }
        }
      } catch (err) {
        console.error(`Error scheduling notifications for ${vehicleName}:`, err);
      }
    }

    // Persist the overdue de-dupe map (prune to today's entries to bound growth).
    const prunedOverdue = Object.fromEntries(Object.entries(overdueNotified).filter(([, d]) => d === today));
    await AsyncStorage.setItem('@autolog_overdue_notified', JSON.stringify(prunedOverdue));

    // Pro-only: alert on newly-published NHTSA safety recalls. Runs last so the
    // cancelAll above never wipes the immediate recall notifications it fires.
    // No-ops for free users (gated inside syncRecallNotifications).
    await syncRecallNotifications(vehicles, ({ title, body, data }) =>
      Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: null, // deliver now; recalls are de-duped, so firing immediately is safe
      })
    );
  } catch (error) {
    console.error('Error scheduling service notifications:', error);
  }
}

// --- Tap handling -----------------------------------------------------------
// Both service and recall notifications carry { vehicleId } in their data
// payload. These helpers surface that id so the UI can open the right vehicle.

// Warm taps (app already running). Returns a subscription with .remove().
export function addNotificationResponseListener(onVehicle) {
  if (Platform.OS === 'web') return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response?.notification?.request?.content?.data;
    if (data?.vehicleId != null) onVehicle(String(data.vehicleId));
  });
}

// Cold start (app launched by tapping a notification). Call once on mount.
const HANDLED_TAP_KEY = '@autolog_handled_notif_id';
export async function getInitialNotificationVehicleId() {
  if (Platform.OS === 'web') return null;
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    const id = response?.notification?.request?.identifier;
    const data = response?.notification?.request?.content?.data;
    if (!id || data?.vehicleId == null) return null;
    // getLastNotificationResponseAsync persists across sessions, so a normal
    // icon launch would otherwise re-route an old tap. Only act on a tap we
    // haven't already handled.
    const handled = await AsyncStorage.getItem(HANDLED_TAP_KEY);
    if (handled === id) return null;
    await AsyncStorage.setItem(HANDLED_TAP_KEY, id);
    return String(data.vehicleId);
  } catch {
    return null;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

// Get count of scheduled notifications
export async function getScheduledNotificationCount() {
  if (Platform.OS === 'web') return 0;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch {
    return 0;
  }
}
