/**
 * Pure helpers for the feedback/bug channel: build the mailto URL and the
 * diagnostics body. No React Native or Expo imports here on purpose, so this is
 * unit-testable in plain node. The RN/Linking side lives in support.js.
 */

export function feedbackSubject(kind) {
  return kind === 'bug' ? 'Car Story — Bug report' : 'Car Story — Feedback';
}

/** Diagnostics footer appended to every message so we can help without a back-and-forth. */
export function feedbackBody(diag = {}) {
  const device = `${diag.os || 'unknown'} ${diag.osVersion || ''}`.trim();
  return [
    '',
    '',
    '———',
    'Sent from Car Story',
    `Version: ${diag.version || 'unknown'} (${diag.build || 'unknown'})`,
    `Device: ${device}`,
  ].join('\n');
}

export function buildMailtoUrl({ email, subject, body }) {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${email}?${query}`;
}
