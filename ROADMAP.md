# Car Story — Roadmap

_Last updated: 2026-06-09_

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

**Status (2026-06-09): the two cons are addressed and shipping.** 2.2.0 (iCloud
backup + feedback channel) was approved and auto-released; 2.2.1 (build 43) folds
in the device-only iCloud hardening below + B-001, was device-verified on
TestFlight, and is in App Store review.

1. **Address the two cons** (no engine refactor; clean module boundaries only):
   - ✅ **iCloud backup** — Swift Expo module + entitlement + config plugin behind
     the `loadICloudAdapter` seam (file-based; blob includes base64 photos).
     `restoreFromBackup` is non-destructive; the first-launch "Restore?" prompt is
     wired. Apple-side (container `iCloud.dev.teamam.glovebox` + capability) was
     already set up — proven by store build #42. **Device-verified in 2.2.1** after
     fixing device-only bugs: `.icloud` placeholder listing (broke cross-device
     restore), unreliable background auto-backup (now immediate + held by an iOS
     background task), a restore-prompt sync retry, and a longer download timeout
     for large photo backups.
   - ✅ **Feedback / bug channel** — Settings → Report a bug / Send feedback
     (`mailto:` prefilled with version/build/device/OS) + Help & FAQ link.
   - ✅ **Support URL page** — live on `carstory-data` GitHub Pages.
   - Also shipped in 2.2.1: app-wide UI consistency pass (design tokens: Radii /
     IconSize / Typography.micro / figure) + Settings polish (unified toggles,
     tighter cards).

2. **New submission** — ✅ 2.2.0 resubmitted, approved, auto-released. 2.2.1
   (build 43) in review now. Resubmission discipline still applies: batch fixes,
   don't churn review.
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

---

## Deferred — Pro 2.0 feature spec (DO NOT BUILD UNTIL PAID-USER GATE)

**Gate to start building any of this:** the Phase 1 → 2 retention/channel gate is met
(~50 paid users from a repeatable channel + week-3 retention). Until then, this section
exists so the ideas aren't lost, not as a build queue.

### Theme: "Pro = Evidence Locker + Diagnostic Toolkit"

Two reinforcing pillars. Storage system × content factory. Together they pitch as
*"the receipts your mechanic actually believes, and the diagnostic kit you forgot was
in your phone."*

### Pillar A — Evidence Locker

- **Voice memos** attached to any Issue / Service / Fuel log. `expo-av` AudioRecording.
  ≤ 5 min, AAC 64 kbps mono → ~2–3 MB per memo.
- **Short video clips** attached to any log. `expo-image-picker` (already a dep) with
  `mediaTypes: Videos`. ≤ 60 s, H.265 720p → ~8–12 MB per clip.
- **iCloud sync** for all attachments (photos + voice + video). Files live in the app's
  iCloud Documents container, in the user's own quota. Reuses Phase-1 iCloud groundwork.
- **Share-to-mechanic bundle** — `expo-sharing` rolls media + log notes into one share
  sheet, or a temporary link.
- **Storage policy: sync everything by default, transparent quota.** Aggressive
  compression at capture; show app's iCloud footprint in Settings; graceful "iCloud full"
  failure with deep link to Apple's storage manager. Defer Photos-style "Optimize
  Storage" toggle until real heavy-user behavior says we need it.
  - Considered and rejected: app-managed auto-archive (breaks "evidence survives wipe"
    promise); per-entry sync toggle (decision fatigue, same risk without the upside).

### Pillar B — Diagnostic Toolkit

UX pattern shared by all tools: **sample → numeric summary → attach to a log entry**.
Build that pipeline once as the generic core primitive; each tool plugs in.

| Tool                  | What                                           | Sensor / lib                          | Priority |
|-----------------------|------------------------------------------------|---------------------------------------|----------|
| Noise meter           | Relative dB graph over 10–30s, peak/avg, tag idle/40/65 mph | `expo-av` averagePower @ ~20Hz | First — sets the rails |
| Vibration logger      | 30s accelerometer capture, intensity over time + dominant frequency (FFT) | `expo-sensors` Accelerometer | Second — genuinely differentiated |
| Drive cycle recorder  | Background trip GPS + accel; smoothness score, hard events, real MPG | `expo-location` + `expo-sensors` (needs background entitlement) | Third — heaviest lift |
| VIN scanner           | Camera → VIN barcode/OCR → autofill vehicle    | barcode + VIN decode API              | Anytime, slot with onboarding pass |
| Light meter           | Headlight brightness via camera, track over time | camera EV/ISO              | Maybe — accuracy hard |
| Tire tread depth      | Photo w/ coin for scale → measure tread        | camera + CV                | Maybe — accuracy hard without ML |
| Fluid color check     | Oil/coolant photo vs. reference chart          | camera + color distance    | Maybe — DIYer love, tutorial heavy |
| Garage location pin   | Auto-pin on CarPlay/BT disconnect              | location + BT hook         | Skip — overlaps with Find My |
| Engine sound classifier | "Rod knock / lifter tick / belt squeal"      | on-device ML or hosted     | Skip v1 — liability risk |
| OBD2 integration      | Real check-engine codes via BT dongle          | external $15–25 hardware   | Skip v1 — support burden |

**Accuracy honesty (non-negotiable):** phone sensors are not calibrated instruments.
Frame all readings as **relative on the same phone**, not absolute clinical values.
Track deltas, not numbers. Undersell accuracy and ship the actually-useful version.

### Decisions already made

- **Cloud backend: iCloud only.** Drive/Dropbox deferred until Play Store port (Phase 3).
- **Free-tier teaser: none.** Clean line between Free and Pro; sharper paywall pitch.
- **Pricing on launch: hold at $4.99**, raise after conversion stabilizes. Don't add
  Pro+ tier yet — fragments the funnel too early.

### Build order (when the gate is met)

1. Voice memo attachments on Issue logs (smallest viable shape, 2–3 days)
2. Video attachments + capture-time compression (2–3 days)
3. iCloud sync extended to all attachments (3–4 days)
4. Share-to-mechanic bundle (1–2 days)
5. Noise meter — establishes sample-pipeline rails (3–4 days)
6. Vibration logger (3–5 days)
7. Drive cycle recorder (5–7 days)

Rough total: ~4 weeks focused work. VIN scanner is independent, slot anywhere.

### Phase-2 architecture prep is the only thing worth doing right now

Even before the gate, do the **cheap rename** that makes Phase-2 engine extraction
costless when it comes:

```
autolog-app/
  app/                  # routes (unchanged)
  components/           # generic UI primitives
  domain/car/           # ← car-specific only (recalls, costBenchmarks, etc.)
  core/                 # ← domain-agnostic (storage, attachments, iCloudSync,
                        #     PurchaseContext, samplePipeline)
```

No new abstractions, no extracted packages. Just physical separation between
"things only a car needs" and "things any Story app would need." When Home Story #1
starts, `core/` lifts cleanly into `packages/core` of the future monorepo.

### Reference artifacts

- v1 brainstorm: `~/Desktop/Brain/Design/glovebox/glovebox_pro-tier-features_v1_20260525-1926.html`
- v2 decisions + storage + cross-app strategy + build-vs-wait: `~/Desktop/Brain/Design/glovebox/glovebox_pro-tier-features_v2_20260525-1957.html`
