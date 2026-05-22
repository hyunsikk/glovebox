# Car Story — ASO package (v2.2.0)

The foundation for the App Store listing and downstream marketing. Built on a
deliberate positioning: own-your-data, no-account, no-subscription maintenance
tracker — the things FIXD / CARFAX Car Care / Drivvo / Fuelly structurally can't
claim. Every field is sized to App Store limits and verified.

---

## 1. Title (≤30) — strongest ranking field
**Final:** `Car Story: Maintenance Log`  (26)
- Brand + the single most valuable head term. Title tokens (`car`, `story`, `maintenance`, `log`) combine with subtitle/keywords for indexing, so we don't repeat them anywhere else.

Test alternatives for Product Page Optimization later:
- `Car Story: Service & Fuel Log` (29) — leads with the functional verbs
- `Car Story – Car Maintenance` (27) — leads with the head phrase

## 2. Subtitle (≤30) — second-strongest, also user-facing
**Final:** `Service, fuel & repair tracker`  (30)
- Adds four new high-value tokens (`service`, `fuel`, `repair`, `tracker`) with no overlap with the title.

Differentiator-led alternative (test if "private" outperforms in conversion):
- `Private service & fuel records`  (30)

## 3. Keywords (≤100; singular, no spaces, no repeats of Title/Subtitle)
**Final (99/100):**
```
vehicle,mileage,odometer,gas,mpg,oil,reminder,history,record,expense,recall,private,receipt,ev,care
```
Rationale: Apple combines Title + Subtitle + Keywords and auto-pluralizes, so this fills the gaps the user-facing copy doesn't cover. The set is deliberately weighted toward (a) high-intent searchers — `mileage`, `mpg`, `gas`, `oil`, `reminder`, `recall`, `expense`; (b) the differentiator wedge — `private`; (c) the actual features — `receipt`, `ev`, `odometer`, `history`, `record`, `care`.

## 4. Promotional text (≤170; editable anytime, NOT indexed — use for hooks)
**Final (145/170):**
`Your car's full history — service, fuel, repairs & photos — backed up to your private iCloud. No account, no subscription. Restore on any device.`

Rotate seasonally without re-review (e.g., "Winter checkup season — log your service before the cold hits.").

## 5. Description (≤4000) — the conversion engine
The first ~2 lines show in the listing before "more" — they decide whether anyone reads further. The lead is benefit + differentiator, not a feature list.

```
Track every car you own — privately. Service, fuel, EV charging, repairs, and photo receipts — backed up to your own iCloud, restorable on any device. No account, no servers, no subscription.

Car Story is the maintenance tracker for people who actually care about their cars. It stays out of your way, holds a complete history for every vehicle, and gives you proof of service whenever you need it — for a buyer, a mechanic, or a warranty claim.

WHY CAR STORY
• Your records, owned by you. Backs up to your own private iCloud — not our servers. Keep multiple named snapshots and restore any one of them on a reinstall or a new phone.
• No subscription. Unlock Car Story Pro once for $4.99. No monthly fees, ever.
• Private by design. No account, no login, no analytics, no data selling. The app simply has no way to see your records.
• Proof of service in one tap. Export any vehicle's full history as a clean PDF for resale, warranty, or your mechanic.

EVERYTHING YOU TRACK, IN ONE PLACE
• Service records with photos, vendor, and notes
• Fuel-ups and EV charging — with cost, MPG, and efficiency
• Issues and repairs with severity and status
• Odometer, vehicle profile pictures, and per-vehicle maintenance schedules
• As many vehicles as you own (Pro)

STAY AHEAD WITHOUT THE NOISE
• NHTSA recall alerts — anonymous lookup, never linked to you
• Smart maintenance reminders and due-soon predictions
• Vehicle health score at a glance
• Cost insights and benchmarks against similar vehicles (Pro)

CAR STORY PRO — $4.99, ONE TIME
Unlock:
• Unlimited vehicles
• Recall alerts
• Cost insights and benchmarks
• PDF service reports
One purchase. No subscription. Ever.

PRIVACY YOU CAN ACTUALLY VERIFY
Your maintenance data never leaves your device and your iCloud. The only network use is:
• Anonymous recall lookups (make, model, year — never linked to you)
• A one-way download of our public maintenance-schedule data
• Purchase validation
No analytics. No tracking. No advertising. No data sold.

For car people who keep things in order — and want their history to be theirs, forever.
```

## 6. "What's New" for 2.2.0 release (user-facing release notes)
From `RELEASE-2.2.0.md`:
- iCloud backup & restore with named snapshots — vehicles, logs, photos, and profile pictures.
- Attach photo receipts to service, fuel, and issue logs.
- Send feedback or report a bug from Settings.
- Service reports export as PDF, with a preview before you share.
- Car Story Pro — unlock unlimited vehicles, recall alerts, insights, and PDF reports.
- Cleaner logging forms, refreshed icons, fixed launch screen, and lots of polish.

## 7. In-App Purchase metadata (Car Story Pro)
- **Display Name:** `Car Story Pro`
- **Description (≤45):** `Unlimited vehicles, recall alerts, PDF reports` (44)
- **Review Screenshot:** the iPhone Pro screenshot (`iphone-02-no-subscription.png`).
- **Promoted IAP:** consider promoting Pro on the product page once you've validated conversion.

## 8. Category
Primary: **Utilities**. Secondary: **Lifestyle**. (The App Store has no Automotive category — the popular trackers all sit in Utilities.)

## 9. Screenshot strategy (already built — `~/Desktop/CarStory-AppStore-Screenshots/`)
Order: 00 overview → 01 own-your-data → 02 no-subscription → 03 private → 04 PDF → 05 stay-ahead → 06 receipts. Names sort to this order automatically.

## 10. Keyword strategy — where to fight, where not to
Three tiers, ranked by winnability for a new app:

**Tier 1 — too competitive head terms (own only by long-tail, don't burn budget):**
"car maintenance", "fuel log", "mileage tracker" — dominated by FIXD, CARFAX, Fuelly. Going head-on wastes the metadata.

**Tier 2 — winnable + high intent (the bread and butter):**
"car maintenance log", "service log", "car log book", "maintenance reminder", "car records", "car service history", "MPG tracker", "oil change reminder", "car expenses". The title + subtitle + keywords above cover these naturally.

**Tier 3 — differentiated long-tail (low competition, high relevance — own these):**
"private car maintenance", "car log no account", "car maintenance no subscription", "offline car log", "icloud car maintenance", "no-account car app". These map directly onto what the popular apps **can't** say. They're woven through the description and promo text — not in the keywords field because Apple uses bigrams from the user-facing copy too.

## 11. Post-launch iteration (ASO is a feedback loop, not a launch artifact)
- **Product Page Optimization (PPO):** test up to 3 screenshot or icon variants once you have ≥1k impressions per variant. Try the differentiator-led subtitle.
- **App Store Connect → Analytics → Search terms:** see which queries actually convert. Rotate the bottom-3 keywords each update toward what's converting.
- **Promo text:** edit anytime without review. Use it for seasonal hooks ("winter checkup", "tax-time vehicle expenses", "selling your car? export the PDF").
- **Ratings & reviews:** the in-app rating prompt fires after positive events — keep that. Ratings are a top-3 ranking + conversion factor.
- **Localization:** if/when there's signal, English-first is fine for launch; consider DE/JA/KO/ES after the first month — those markets have strong "car person" cultures and lower English-app competition.
- **Featuring pitch:** Apple's editorial loves privacy-first, no-subscription, well-designed indie apps. After 3–4 weeks with reviews, pitch the "private maintenance tracker, no account, one price" angle directly via the editorial form.
