# Car Story — ASO package (App Store Optimization)

Goal: rank for high-intent maintenance-tracker searches while leaning on the
differentiators the popular apps can't easily claim (private, no-account,
no-subscription, iCloud-owned). Singular keywords (Apple auto-pluralizes), no
word repeated across Title/Subtitle/Keywords (Apple combines all three for
indexing), US English first.

---

## 1. App Name / Title  (max 30 chars)
**Recommended:** `Car Story: Maintenance Log`  (26)
- Indexes: car, story (brand), maintenance, log → covers "car maintenance",
  "maintenance log", "car log".
Alternatives:
- `Car Story: Service & Fuel Log` (29) — trades "maintenance" for "service/fuel"
- `Car Story – Car Care & Log` (26)

Decision needed: keep the brand-only "Car Story", or use the brand+keyword title
above. Recommend brand+keyword — the title is the single strongest ranking field.

## 2. Subtitle  (max 30 chars)
**Recommended:** `Service, fuel & repair log`  (26)
Alternatives:
- `Service log, MPG & reminders` (28)
- `Private service & fuel tracker` (30)
- `Track service, fuel & repairs` (29)

## 3. Keywords field  (max 100 chars; comma-separated, NO spaces, singular, no
words already in Title/Subtitle)
```
vehicle,mileage,odometer,gas,mpg,oil,reminder,history,record,expense,auto,care,recall,receipt,garage
```
(100 chars exactly.) Rationale: covers the search themes not in the title/subtitle
— mileage/odometer/MPG/gas (fuel-economy seekers), reminder/recall (proactive),
history/record/receipt (resale/warranty), expense/care/garage/auto. If you target
the UK, swap one term for `mot` (the UK service-check term).

## 4. Promotional text  (max 170 chars; editable anytime, NOT indexed — use for
hooks/seasonal)
**Recommended:**
`Your car's full history — service, fuel, repairs & photos — backed up to your private iCloud. No account, no subscription. Restore anytime, on any device.` (~152)

## 5. Description  (max 4000; conversion, lightly indexed — lead with the hook)
```
Car Story is a private, no-nonsense maintenance tracker for people who actually care about their cars.

Log every service, fuel-up, EV charge, and issue — with photos — and keep a complete history for each vehicle. Everything lives on your device and backs up to your own private iCloud, so your records survive a reinstall or a new phone. No account. No servers. No subscription.

WHY CAR STORY
- Own your data — backs up to your private iCloud, not our servers. Restore on any device, keep multiple snapshots.
- No subscription — unlock Car Story Pro once. No monthly fees, ever.
- Private by design — no login, no tracking, no data selling.
- Proof of service — export any vehicle's full history as a PDF for resale, warranty, or your mechanic.

TRACK EVERYTHING
- Service records with photo receipts and notes
- Fuel and EV charging, with cost and efficiency
- Issues and repairs, with severity and status
- Odometer, vendors, and per-vehicle maintenance schedules
- As many vehicles as you own

STAY AHEAD
- NHTSA recall alerts
- Smart maintenance reminders and due-soon predictions
- Vehicle health score at a glance
- Cost insights and benchmarks (Pro)

CAR STORY PRO — $4.99, one time
Unlock unlimited vehicles, recall alerts, cost insights, and PDF reports. One purchase, no subscription.

PRIVACY
Your maintenance data never leaves your device and your iCloud. The only network use is anonymous recall lookups (make/model/year only), a one-way download of our public maintenance-schedule data, and purchase validation. No analytics. No tracking. No data sold.
```

## 6. Screenshot captions (already built — `~/Desktop/CarStory-AppStore-Screenshots/`)
Order is set: 00 overview, then own-your-data, no-subscription, private, PDF,
recall/reminders, receipts. The headline on each is the caption.

## 7. Category
Recommended: **Utilities** (primary), **Lifestyle** (secondary). The App Store has
no Automotive category; the popular trackers sit in Utilities.

---

## Keyword strategy (where to fight)
Tiers by winnability for a new, small app:
- TOO COMPETITIVE to win head-on (own via long-tail, not the head term): "car
  maintenance", "fuel log", "mileage tracker" — dominated by FIXD/CARFAX/Fuelly.
- WINNABLE, high intent (target hardest): "car maintenance log", "service log",
  "car log book", "maintenance reminder", "car records", "car service history".
- DIFFERENTIATED long-tail (low competition, high relevance — own these): "private
  car maintenance", "car log no account", "car maintenance no subscription",
  "offline car log", "icloud car maintenance". These map onto exactly what the
  popular apps can't say. Weave into description + promo text.

## Post-launch (ASO is iterative)
- App Store has no A/B in-app, but use **Product Page Optimization** (test up to 3
  screenshot/icon variants) once you have traffic.
- Check App Store Connect → Analytics for the search terms actually converting,
  then rotate weaker keywords. Re-evaluate keywords every update.
- Promotional text is editable without review — use it for seasonal hooks
  ("winter checkup", "tax-time vehicle expenses").
- Ratings/reviews are a major ranking + conversion factor — the in-app feedback
  prompt after a positive event is doing this; keep it.
