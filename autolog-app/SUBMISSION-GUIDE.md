# Car Story v2.0.0 — App Store Submission Guide

## Pre-Submission Checklist

- [x] Code committed and pushed to GitHub
- [x] Privacy policy updated (no AdMob references, ad-free)
- [x] Support page created with FAQ
- [x] Store listing metadata written (store-listing.md)
- [x] app.json updated: version 2.0.0, automatic UI style
- [x] EAS build triggered (production profile)
- [ ] Screenshots taken on device/simulator (see below)
- [ ] Build completes successfully
- [ ] Submit via EAS or App Store Connect

---

## Step 1: Wait for EAS Build

Monitor at: https://expo.dev/accounts/hsikk/projects/glovebox-app/builds

Or run:
```bash
cd ~/teamam/apps/glovebox/autolog-app
eas build:list --platform ios --limit 1
```

## Step 2: Take Screenshots (MANUAL — requires Simulator or device)

The headless screenshots captured the first-launch/onboarding state. For App Store, you need to:

### Open in iOS Simulator
```bash
# Start the app in Simulator
cd ~/teamam/apps/glovebox/autolog-app
npx expo run:ios
```

### Or use the dev build
If you have a development build on your device, use that.

### Screenshot Flow (recommended order for store listing)

**Shot 1: Garage (hero shot)**
- Dismiss onboarding → demo data loads automatically
- Show the 3 demo vehicles with mileage cards
- iPhone: ⌘+S in Simulator to save screenshot

**Shot 2: Vehicle Detail**
- Tap into a vehicle (Toyota RAV4 recommended — most data)
- Show service history, mileage, recall section

**Shot 3: Insights — Monthly Summary + Trends**
- Go to Insights tab
- Scroll to show the monthly summary card and trends section
- This is the "money shot" — shows the data intelligence

**Shot 4: Insights — Charts**
- Scroll down to show spending breakdown (donut chart), cost by category, heatmap

**Shot 5: Insights — Cost Benchmark**
- Show the benchmark comparison ("Your Toyota vs average")

**Shot 6: Settings**
- Show settings tab with dark mode toggle, units, currency options

### Required Sizes
| Device | Resolution | Required |
|--------|-----------|----------|
| iPhone 6.7" | 1290 × 2796 | ✅ Required |
| iPhone 6.5" | 1242 × 2688 | ✅ Required |
| iPad Pro 12.9" | 2048 × 2732 | ✅ Required (supportsTablet: true) |

### Simulators to use
- **iPhone 15 Pro Max** → 6.7" screenshots
- **iPhone 11 Pro Max** → 6.5" screenshots  
- **iPad Pro 12.9-inch (6th gen)** → iPad screenshots

### Taking screenshots in Simulator
```
⌘+S → saves to Desktop
```

## Step 3: Deploy GitHub Pages (privacy/support URLs)

Make sure the privacy and support pages are live:
```bash
cd ~/teamam/apps/glovebox
# If using GitHub Pages from /docs folder:
git push origin main
# Then enable GitHub Pages in repo settings → Source: Deploy from branch → /docs
```

Verify URLs work:
- https://hyunsikk.github.io/glovebox/privacy.html
- https://hyunsikk.github.io/glovebox/support.html

## Step 4: Submit to App Store Connect

### Option A: EAS Submit (recommended)
```bash
cd ~/teamam/apps/glovebox/autolog-app
eas submit --platform ios --latest
```
This auto-uploads the latest build. You'll still need to fill in metadata in App Store Connect.

### Option B: Manual via App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Select **Car Story** (ASC App ID: 6759947168)
3. Click **+ Version or Platform** → iOS → Version 2.0.0

### Fill in App Store Connect fields:

**App Information tab:**
| Field | Value |
|-------|-------|
| Name | Car Story — Vehicle Tracker |
| Subtitle | Maintenance, Fuel & Cost Logs |
| Category | Utilities (primary), Lifestyle (secondary) |
| Content Rights | Does not contain third-party content |
| Age Rating | 4+ |

**Pricing and Availability:**
| Field | Value |
|-------|-------|
| Price | Free |
| Availability | All territories |

**Version Information:**
| Field | Value |
|-------|-------|
| Promotional Text | New in v2.0: Cost benchmarks, monthly summary cards, spending heatmaps, month-over-month trends, dark/light mode, multi-currency support, and printable reports. |
| Description | (Copy from store-listing.md — the full description) |
| Keywords | car maintenance,vehicle tracker,fuel log,mileage,oil change,service record,auto repair,gas tracker,MPG,cost per mile,car expense,recall alert,maintenance schedule,fleet |
| Support URL | https://hyunsikk.github.io/glovebox/support.html |
| Marketing URL | https://hyunsikk.github.io/glovebox/ |
| Privacy Policy URL | https://hyunsikk.github.io/glovebox/privacy.html |
| What's New | (Copy from store-listing.md) |

**App Privacy (Privacy Nutrition Labels):**
| Question | Answer |
|----------|--------|
| Do you collect data? | **No, we do not collect data from this app** |

This is accurate — Car Story stores everything locally, has no analytics, no ads, no server communication except the NHTSA recall API (which sends vehicle make/model/year, not personal data).

**Screenshots:**
- Upload 6.7" iPhone screenshots (minimum 3, recommended 6)
- Upload 6.5" iPhone screenshots (same images, scaled — or retake in that simulator)
- Upload 12.9" iPad screenshots (minimum 3)
- Recommended order: Garage → Vehicle Detail → Insights Summary → Charts → Benchmark → Settings

**App Review Information:**
| Field | Value |
|-------|-------|
| Contact Name | Hyun Sik Kim |
| Contact Email | paul483@naver.com |
| Contact Phone | (your phone) |
| Notes | Car Story is a free, offline-first car maintenance tracker. Demo data loads automatically on first launch — you can explore all features immediately. No account or sign-in required. To test: explore vehicles in Garage tab, view analytics in Insights tab, try Settings tab for dark/light mode and unit switching. |

**Build:**
- Select the build uploaded from EAS (version 2.0.0, build 9)

## Step 5: Submit for Review

1. Fill in all fields above
2. Upload screenshots
3. Click **Add for Review**
4. Click **Submit to App Review**

Review typically takes 24-48 hours for updates.

---

## Post-Submission

After approval:
- Update status.json: glovebox version 2.0.0, status "live"
- Monitor reviews in App Store Connect
- Track keyword rankings (ASO)
