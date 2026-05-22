# Car Story 2.2.0 — App Store submission copy

## What's New (App Store "What's New" — user-facing)

Your maintenance history just got safer, and the app got cleaner.

• iCloud backup — your vehicles, service records, fuel logs, and photos back up to
  your own private iCloud and restore automatically on a new device or after a
  reinstall. No accounts, no servers — your data stays yours.
• Send feedback or report a bug right from Settings.
• Service reports now export as PDF.
• More currencies — JPY, CNY, INR, CAD, AUD, and more.
• Refreshed icons throughout, a fixed launch screen, and lots of polish.

_(If iCloud slips to the next build, delete the first bullet.)_

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
  Drive on). It writes a single backup file to the app's private iCloud container;
  no data is sent to any server we operate.

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
• Reject the in-review 2.1.0 (build 16) so 2.2.0 can take its place.
• Confirm the Pro IAP is attached to the 2.2.0 version.
• Submit only after the TestFlight 4-point verification passes (iCloud restore,
  feedback, Pro purchase+restore, notifications).
