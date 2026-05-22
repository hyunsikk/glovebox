/**
 * Feedback / bug channel. Opens the user's mail app with diagnostics prefilled
 * (lightweight, no infra, no network egress beyond the mail the user chooses to
 * send), plus a link to the Help/FAQ page. Pure URL building lives in
 * supportFormat.js so it can be unit-tested without RN.
 */

import { Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import { buildMailtoUrl, feedbackSubject, feedbackBody } from './supportFormat';

export const SUPPORT_EMAIL = 'owal@teamam.org';
export const SUPPORT_URL = 'https://hyunsikk.github.io/carstory-data/support.html';

function diagnostics() {
  return {
    version: Application.nativeApplicationVersion,
    build: Application.nativeBuildVersion,
    os: Platform.OS === 'ios' ? 'iOS' : Platform.OS,
    osVersion: String(Platform.Version || ''),
  };
}

/**
 * Open the mail app composing to support. kind: 'bug' | 'feedback'.
 * Returns { success } — when no mail app is configured the caller should show
 * the address so the user can reach us another way.
 */
export async function contactSupport(kind = 'feedback') {
  const url = buildMailtoUrl({
    email: SUPPORT_EMAIL,
    subject: feedbackSubject(kind),
    body: feedbackBody(diagnostics()),
  });
  const canOpen = await Linking.canOpenURL(url).catch(() => false);
  if (!canOpen) return { success: false, email: SUPPORT_EMAIL };
  await Linking.openURL(url);
  return { success: true };
}

export async function openHelp() {
  await Linking.openURL(SUPPORT_URL).catch(() => {});
}
