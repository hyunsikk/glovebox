/**
 * In-app App Store rating prompt.
 *
 * Asks for a review only after the user has had a few *positive* moments
 * (e.g. logging services) — never on launch, never on an error. Ratings drive
 * both App Store ranking and conversion, which matters most for a paid app.
 *
 * Uses the native StoreReview sheet (SKStoreReviewController). Same guarded-
 * require seam as PurchaseContext: web and any build without the module simply
 * no-op. To activate on device:  npx expo install expo-store-review
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let StoreReview = null;
if (Platform.OS !== 'web') {
  try { StoreReview = require('expo-store-review'); } catch { StoreReview = null; }
}

const COUNT_KEY = '@autolog_positive_events';
const ASKED_KEY = '@autolog_review_asked_for'; // app version we last asked on
const THRESHOLD = 3; // ask only after a few real wins, so the timing feels earned

const appVersion = Constants?.expoConfig?.version || '0';

/**
 * Record a genuinely positive action (a service logged, a snapshot shared).
 * Once the user crosses the threshold, asks for a review — at most once per
 * app version. Safe to call freely; all the gating lives here.
 */
export async function recordPositiveEvent() {
  try {
    const n = parseInt((await AsyncStorage.getItem(COUNT_KEY)) || '0', 10) + 1;
    await AsyncStorage.setItem(COUNT_KEY, String(n));
    if (n >= THRESHOLD) await maybeRequestReview();
  } catch {
    // never let a rating-prompt failure affect the user's actual action
  }
}

/** Show the native review sheet if it's available and we haven't asked this version. */
export async function maybeRequestReview() {
  if (!StoreReview) return; // not native, or module not installed yet
  try {
    if ((await AsyncStorage.getItem(ASKED_KEY)) === appVersion) return;
    const available = (await StoreReview.isAvailableAsync?.()) ?? false;
    if (!available) return;
    // Stamp before requesting so a throw can't put us in a re-ask loop.
    await AsyncStorage.setItem(ASKED_KEY, appVersion);
    await StoreReview.requestReview();
  } catch {
    // ignore — Apple may also silently no-op (it rate-limits to ~3/year)
  }
}
