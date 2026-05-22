# Car Story 2.2.0 — App Store submission copy

## What's New (App Store "What's New" — user-facing)

Your maintenance history just got safer, and the app got cleaner.

• iCloud backup & restore — your vehicles, service/fuel/issue logs, attached photos,
  and each vehicle's profile picture back up to your own private iCloud and restore
  automatically after a reinstall or on a new device. Keep multiple named snapshots
  and restore any one. No accounts, no servers — your data stays yours.
• Attach photo receipts to service, fuel, and issue logs.
• Send feedback or report a bug right from Settings.
• Service reports export as PDF, with a preview before you share.
• Car Story Pro — unlock unlimited vehicles, recall alerts, cost insights, and PDF
  reports.
• Cleaner logging forms, refreshed icons, a fixed launch screen, and lots of polish.

## App Review notes (App Store Connect → App Review Information → Notes)

Car Story is a local-first car maintenance tracker. No account or login is required —
all data lives on the device (and, with 2.2.0, in the user's own private iCloud).

Testing:
• To explore with data, open Settings and load the sample data, or add a vehicle from
  the Garage tab.
• In-App Purchase "Car Story Pro" (dev.teamam.glovebox.pro, $4.99 non-consumable)
  unlocks unlimited vehicles, NHTSA recall alerts, cost forecasts/benchmarks, and PDF
  service reports. To test: Settings → Unlock Pro (works with a sandbox account).
• iCloud backup: Settings → Back up now (device must be signed into iCloud with iCloud
  Drive on). It writes backup snapshots to the app's private iCloud container; no data
  is sent to any server we operate.

Network use (all disclosed in the privacy policy):
• NHTSA recall lookups — sends only make/model/year, never personal data.
• A one-way download of our public vehicle-schedule dataset (GitHub Pages).
• RevenueCat for purchase validation.
No analytics, tracking, or personal-data collection.

## App Store Connect URLs
• Support URL:        https://support-teamam.github.io/carstory-data/support.html
• Marketing URL:      https://support-teamam.github.io/carstory-data/
• Privacy Policy URL: https://support-teamam.github.io/carstory-data/privacy.html

## Pre-submit reminders
• Attach the new build (41+) to the 2.2.0 version; remove the earlier build from
  review if one is still selected.
• Confirm the Pro IAP (dev.teamam.glovebox.pro) is attached to the 2.2.0 version and in
  the "Ready to Submit" state.
• Submit only after the on-device QA pass: iCloud restore (vehicle + profile pic +
  service/fuel/issue receipts), the log forms (required-field validation), Pro
  purchase + restore (sandbox), feedback, and notifications.
