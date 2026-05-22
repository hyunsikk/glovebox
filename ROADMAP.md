# Car Story — Roadmap

_Last updated: 2026-05-21_

## Product thesis

A private, offline-first, pay-once maintenance log for car people. No accounts, no
subscription, no ads, no tracking. The wedge: enthusiasts / multi-vehicle owners who
won't use Google Sheets (unusable on mobile) or subscription/cloud apps (privacy).

- App: `hyunsikk/glovebox` (`autolog-app/`). Data + site: `hyunsikk/carstory-data`.
- Monetization: free tier (1 real vehicle); one-time **$4.99 Pro** IAP
  (`dev.teamam.glovebox.pro`, entitlement `pro`) — unlimited vehicles, recall alerts,
  cost forecast/benchmarks, report export.
- Price stays **$4.99** at launch (low trust barrier). Raise to $7.99–$9.99 later,
  once reviews + value are socially proven. One-time IAP is easy to raise + grandfather.

---

## Phase 1 — Fix cons, relaunch, prove one channel (NOW)

Goal: a polished, trustworthy app + a *repeatable* way to sell it.

1. **Address the two cons** (no engine refactor; clean module boundaries only):
   - **iCloud backup** — implement the iCloud Documents (ubiquity container) adapter
     behind the existing seam in `lib/backup.js` (`loadICloudAdapter`). Approach B: own
     small Swift Expo module + entitlement + config plugin. Backup blob already includes
     photos (base64), so it must be file-based, not key-value.
     - Harden: make `restoreFromBackup` non-destructive (snapshot local first).
     - Wire the first-launch "Restore from iCloud?" prompt (`shouldOfferRestore` exists).
     - Apple-side prereqs (Hyun): enable iCloud capability, create container
       `iCloud.dev.teamam.glovebox`.
   - **Feedback / bug channel** — Settings row → `mailto:` prefilled with app version +
     build + device + OS. Plus a "Help / FAQ" link to a support page.
   - **Support URL page** on `carstory-data` GitHub Pages (App Review needs it anyway).

2. **New submission** (not the 2026-05-20 build — iCloud isn't in it):
   - Ship the Phase-1 features first, then resubmit **once**.
   - Improved ASO + screenshots selling the pros: offline-first, privacy/no-account,
     iCloud backup, no subscription, photos, recall alerts.

3. **Marketing + sales** — community/organic is the channel (paid acquisition is
   unprofitable on a cheap one-time IAP). Validate in car communities (r/cars,
   r/MechanicAdvice, make-specific forums, etc.) without tripping self-promo rules.

4. **Phase 1 → 2 gate:** not raw sales — a **repeatable channel + retention**.
   - Target: ~50 paid users in 3 weeks AS EVIDENCE OF A REUSABLE CHANNEL
     (a post/community that converts and can be run again), plus users still logging in
     week 3. "I know how to get the next 50" > "I got 50."

---

## Phase 2 — Extract the engine, expand horizontally

Direction is set: **horizontal expansion is the plan** (Hyun's conviction).

1. **Refactor:** separate the core log-tracking engine from car-specific UI/data
   (vehicles DB, recalls, schedules). Engine = entities, storage, backup/restore,
   reminders, analytics, reports, paywall — domain-agnostic.

2. **Vertical apps** on the shared engine: home maintenance/expense, boat, plane, bike,
   and more. Each = engine + a domain pack (entities, schedules, terminology, ASO).

3. Publish to App Store; market + sell as a portfolio.

**Sequencing guardrail (not a veto):** don't launch app N+1 until app N has a working,
repeatable channel. Going wide multiplies the marketing surface (the real bottleneck),
not just build cost. Expand on proven distribution, not on hope.

---

## Phase 3 — Play Store

Port the proven apps to Android. Mostly mechanical.
- Set the RevenueCat **Android** API key (currently empty → iOS-only monetization today).
- Do this once at least one iOS app's funnel is proven.

---

## Standing principles

- Privacy/offline-first is the brand — never add tracking, ads, or mandatory accounts.
- Backup + low entry-friction are retention prerequisites, not features. Protect them.
- Price is not the lever; distribution + retention are. Optimize those first.
- Build Phase-1 code with clean boundaries so the Phase-2 engine extraction is cheap.
