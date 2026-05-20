import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
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

    for (const vehicle of vehicles) {
      const vehicleName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

      try {
        // Get services due within the notification window (daysBeforeDue + 30 for overdue)
        const upcomingServices = await ServiceDue.getUpcomingServices(vehicle.id, daysBeforeDue + 30);

        for (const service of upcomingServices) {
          if (service.isOverdue) {
            // Schedule immediate notification for overdue services
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Overdue: ${service.service}`,
                body: `${vehicleName} — this service is overdue. Schedule it soon!`,
                data: { vehicleId: vehicle.id, serviceType: service.service },
              },
              trigger: { seconds: 5 },
            });
          } else if (service.daysUntilDue <= daysBeforeDue && service.daysUntilDue >= 0) {
            // Schedule notification for the due date minus the notification window
            const triggerSeconds = Math.max(60, service.daysUntilDue * 24 * 60 * 60);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Upcoming: ${service.service}`,
                body: `${vehicleName} — due in ${service.daysUntilDue} day${service.daysUntilDue !== 1 ? 's' : ''}`,
                data: { vehicleId: vehicle.id, serviceType: service.service },
              },
              trigger: { seconds: triggerSeconds },
            });
          }
        }
      } catch (err) {
        console.error(`Error scheduling notifications for ${vehicleName}:`, err);
      }
    }

    // Pro-only: alert on newly-published NHTSA safety recalls. Runs last so the
    // cancelAll above never wipes the immediate recall notifications it fires.
    // No-ops for free users (gated inside syncRecallNotifications).
    await syncRecallNotifications(vehicles, ({ title, body, data }) =>
      Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: { seconds: 2 },
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
export async function getInitialNotificationVehicleId() {
  if (Platform.OS === 'web') return null;
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    const data = response?.notification?.request?.content?.data;
    return data?.vehicleId != null ? String(data.vehicleId) : null;
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
