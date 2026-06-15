// ============================================================
// STAGEY MOBILE — PUSH NOTIFICATIONS SERVICE
//
// Handles the full Expo push-notification lifecycle:
//   1. setNotificationHandler   — how notifications behave in foreground
//   2. registerForPushNotifications() — asks permission + gets the Expo
//      push token + creates the Android notification channel
//   3. registerDeviceToken()    — sends the token to the Stagey backend
//      (POST /api/user/push-token) so the server can target this device
//   4. unregisterDeviceToken()  — clears the token server-side on logout
//
// Usage:
//   import { setupNotifications, registerDeviceToken } from './services/notifications';
//   setupNotifications();              // once, at app start (App.tsx)
//   await registerDeviceToken();       // after the user logs in
//   await unregisterDeviceToken();     // before the user logs out
// ============================================================
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { AuthAPI } from './api';

const ANDROID_CHANNEL_ID = 'default';

// ── Foreground behaviour ──────────────────────────────────────
// By default Expo suppresses banners while the app is open. We show
// them so users see casting matches / messages without leaving the app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Resolve the EAS projectId required by Expo's push service in builds.
 * Falls back gracefully so the call never throws in Expo Go / dev.
 */
function getProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    undefined
  );
}

/**
 * Create the Android notification channel. No-op on iOS.
 * Channels must exist before notifications can be displayed on Android 8+.
 */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Stagey notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#8B5CF6',
  });
}

/**
 * Ask for permission and return the Expo push token for this device.
 * Returns null if running on a simulator/emulator, if permission is
 * denied, or if no projectId is configured.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  await ensureAndroidChannel();

  // Push tokens are only issued on physical devices.
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getProjectId();

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResponse.data;
  } catch {
    return null;
  }
}

/**
 * Full opt-in flow: get the token and send it to the Stagey backend.
 * Safe to call repeatedly (e.g. on every login). Never throws.
 */
export async function registerDeviceToken(): Promise<string | null> {
  try {
    const token = await registerForPushNotifications();
    if (!token) return null;
    await AuthAPI.registerPushToken(token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Clear the device token server-side. Call before logging out so the
 * device stops receiving notifications for the previous account.
 */
export async function unregisterDeviceToken(): Promise<void> {
  try {
    await AuthAPI.removePushToken();
  } catch {
    // Non-fatal — logout should always proceed.
  }
}

/**
 * Configure global notification behaviour. Call once at app start.
 * (The handler is already registered at module load; this also creates
 * the Android channel so notifications display correctly.)
 */
export async function setupNotifications(): Promise<void> {
  await ensureAndroidChannel();
}

export { Notifications };
