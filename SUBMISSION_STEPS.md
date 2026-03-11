# Car Story v2.0.0 — Detailed App Store Submission Steps

**⚠️ BLOCKER: Build 10 failed — Push Notifications provisioning profile issue. Fix this first (Step 0).**

---

## Step 0: Fix Build Error (REQUIRED FIRST)

**Error:** Provisioning profile `*[expo] dev.teamam.glovebox AppStore` doesn't include Push Notifications capability.

**Root cause:** The app uses `expo-notifications` but the provisioning profile on EAS doesn't have the Push Notifications entitlement enabled.

### 0.1 — Enable Push Notifications in Apple Developer Portal

1. Open **https://developer.apple.com/account**
2. Sign in with Apple ID: `paul483@naver.com`
3. Click **"Certificates, Identifiers & Profiles"** in the left sidebar
4. Click **"Identifiers"** in the left sidebar
5. Find and click **`dev.teamam.glovebox`** (Car Story)
6. Scroll down to **"Capabilities"** section
7. Find **"Push Notifications"** — check the box to **ENABLE** it
8. Click **"Save"** at the top right
9. Confirm the dialog if prompted

### 0.2 — Regenerate Provisioning Profile

After enabling Push Notifications, you need to regenerate the provisioning profile:

1. Still in Apple Developer Portal
2. Click **"Profiles"** in the left sidebar
3. Find any existing profiles for `dev.teamam.glovebox`
4. **Delete them** (EAS will create new ones automatically)
5. Or: Let EAS handle this automatically (next step)

### 0.3 — Clear EAS Credentials & Rebuild

Run these commands in Terminal:

```bash
cd /Users/hsik/.openclaw/workspace/teamam/apps/glovebox/autolog-app

# Clear the cached provisioning profile so EAS regenerates it
eas credentials --platform ios
# Select: "production" profile
# Select: "Provisioning Profile" → "Remove current"
# This forces EAS to generate a new one with Push Notifications enabled

# Now rebuild
eas build --platform ios --profile production --non-interactive
```

**Alternative (simpler):**
```bash
cd /Users/hsik/.openclaw/workspace/teamam/apps/glovebox/autolog-app
eas build --platform ios --profile production --clear-credentials
```

### 0.4 — Verify Build Succeeds

```bash
# Watch the build
eas build:list --platform ios --limit 1

# Wait for "finished" status (takes ~5-10 minutes)
# The build will auto-upload to App Store Connect via EAS submit config
```

### 0.5 — Submit Build to App Store Connect

Once the build succeeds:

```bash
# Auto-submit to App Store Connect
eas submit --platform ios --latest
```

This uses the credentials in your `eas.json`:
- Apple ID: `paul483@naver.com`
- ASC App ID: `6759947168`
- Apple Team ID: `22R4239A68`

**Wait 5-15 minutes** for Apple to process the build.

---

## Step 1: Deploy GitHub Pages (Websites)

The privacy policy and support pages need to be live before submission.

### 1.1 — Enable GitHub Pages

1. Open **https://github.com/hyunsikk/glovebox**
2. Click **"Settings"** tab (gear icon, top right)
3. In left sidebar, click **"Pages"**
4. Under **"Source"**, select:
   - **Source:** "Deploy from a branch"
   - **Branch:** `main`
   - **Folder:** `/website` (if available) or `/ (root)`
5. Click **"Save"**

### 1.2 — Verify Pages Are Live

Wait 2-3 minutes, then check:
- https://hyunsikk.github.io/glovebox/ → Landing page
- https://hyunsikk.github.io/glovebox/privacy.html → Privacy policy
- https://hyunsikk.github.io/glovebox/support.html → Support page
- https://hyunsikk.github.io/glovebox/terms.html → Terms of service

**If the folder structure doesn't work**, you may need to move the website files:
```bash
cd /Users/hsik/.openclaw/workspace/teamam/apps/glovebox
# Option A: Set GitHub Pages to serve from /docs
mkdir -p docs
cp website/* docs/
git add docs/ && git commit -m "chore: copy website to docs/ for GitHub Pages" && git push
# Then set GitHub Pages source to: main / /docs
```

### 1.3 — Verify All URLs Return 200

Open each URL in your browser and confirm:
- ✅ Page loads with correct content
- ✅ No 404 errors
- ✅ Links between pages work
- ✅ Email links (support@teamam.dev) are correct

---

## Step 2: Open App Store Connect

1. Open **https://appstoreconnect.apple.com** in Safari or Chrome
2. Sign in with Apple ID: **`paul483@naver.com`**
3. Complete 2FA if prompted
4. Click **"My Apps"**
5. Find and click **"Car Story"** (or whatever the current app name is)

---

## Step 3: Create New Version

1. In the left sidebar, under **"iOS App"**, click the current version
2. If v2.0.0 doesn't exist yet:
   - Click **"+ Version or Platform"** button (top left, blue text)
   - Select **"iOS"**
   - Enter version number: **`2.0.0`**
   - Click **"Create"**
3. You should now see the v2.0.0 version page

---

## Step 4: Upload Screenshots

### 4.1 — iPhone 6.7-inch Display

1. Scroll to **"App Screenshots"** section
2. Click the **"6.7-inch"** tab (iPhone 15 Pro Max)
3. Drag and drop these files (in order):

```
screenshots/appstore/iPhone-6.7/01-garage.png        → "Track Unlimited Vehicles"
screenshots/appstore/iPhone-6.7/03-history.png        → "Complete Service History"  
screenshots/appstore/iPhone-6.7/04-insights.png       → "Smart Cost & Fuel Analytics"
screenshots/appstore/iPhone-6.7/06-settings.png       → "Your Data, Your Control"
screenshots/appstore/iPhone-6.7/00-welcome.png        → "Get Started in Seconds"
screenshots/appstore/iPhone-6.7/02-vehicle-detail.png → "Factory Maintenance Schedules"
```

**Full path on disk:**
```
/Users/hsik/.openclaw/workspace/teamam/apps/glovebox/screenshots/appstore/iPhone-6.7/
```

4. After uploading, you can drag screenshots to reorder them
5. **Recommended order:** Garage → History → Insights → Settings → Welcome → Vehicle Detail

### 4.2 — iPhone 6.5-inch Display

1. Click the **"6.5-inch"** tab
2. **Option A (recommended):** Check the box **"Use 6.7-inch Display screenshots"**
3. **Option B:** Upload from `screenshots/appstore/iPhone-6.5/` (same files, slightly different resolution)

### 4.3 — iPad Pro 12.9-inch Display

1. Click the **"iPad Pro (6th Gen) 12.9-inch"** tab
2. Upload from:
```
/Users/hsik/.openclaw/workspace/teamam/apps/glovebox/screenshots/appstore/iPad-12.9/
```
3. Same order as iPhone screenshots
4. **Note:** If the iPad screenshots look too similar to iPhone (web-captured), you can skip iPad for now and add later

---

## Step 5: Enter Version Information

### 5.1 — Promotional Text
*(Can be changed anytime without a new review)*

Click the **"Promotional Text"** field and paste:

```
Free forever! Track unlimited vehicles, get smart maintenance alerts, fuel tracking, cost insights & recall alerts. 100% offline, no account required.
```

### 5.2 — Description

Click the **"Description"** field and paste the full description.

**Copy from:** `/Users/hsik/.openclaw/workspace/teamam/apps/glovebox/APP_STORE_SUBMISSION_PACKAGE.md` → Section 3

Or open the file and copy everything between the ``` markers in section 3.

**Quick check:** Make sure it's under 4,000 characters (our version is 3,995).

### 5.3 — What's New in This Version

Click the **"What's New in This Version"** field and paste:

```
New in 2.0: Major Free Update! 🎉

✨ NOW 100% FREE — No ads, no subscriptions, no compromises. All features unlocked for everyone.

NEW FEATURES
✓ Fuel Tracking — Log fuel stops, track MPG trends, see cost per mile
✓ Issue Tracking — Log vehicle problems with severity, status, and cost history
✓ Cost Benchmarks — Compare your spending against national averages
✓ Month-over-Month Trends — Visual spending analysis with charts
✓ Shareable Reports — Generate monthly cost summaries to share
✓ Demo Data — Try sample vehicles instantly (dismissible)
✓ Light Mode — Beautiful new light theme option
✓ Units & Currency — Switch between imperial/metric, USD/EUR/GBP/KRW

IMPROVEMENTS
• Renamed Timeline → History with global search
• Type filters for service, fuel, and issues
• Auto-load demo data on first launch
• Improved settings screen layout
• Refined recall alerts (dismissible per vehicle)
• Better data visualization throughout

BUG FIXES
• Analytics crash fixed
• Light mode rendering issues resolved
• Report generation improved
• Health score calculation accuracy
• Cost per mile edge cases handled

Keep the feedback coming! Next up: Apple Watch support and CarPlay integration.
```

### 5.4 — Keywords

Click the **"Keywords"** field and paste:

```
car,maintenance,vehicle,oil change,service,auto,repair,mileage,tracker,mechanic,garage,log,reminder
```

**⚠️ IMPORTANT:**
- No spaces after commas
- No duplicate words
- Must be ≤ 100 characters (ours is 98)
- Don't include the app name (Apple indexes it automatically)

### 5.5 — Support URL

```
https://hyunsikk.github.io/glovebox/support.html
```

### 5.6 — Marketing URL (optional)

```
https://hyunsikk.github.io/glovebox/
```

---

## Step 6: Update App Information

1. In the left sidebar, click **"App Information"** (under "General")

### 6.1 — Name

```
Car Story — Maintenance Log
```

### 6.2 — Subtitle

```
Track Service & Auto Repair
```

### 6.3 — Primary Category

Select: **Utilities**

### 6.4 — Secondary Category

Select: **Lifestyle**

### 6.5 — Content Rights

- "Does your app contain, show, or access third-party content?": **No**

### 6.6 — Age Rating

Click **"Edit"** next to Age Rating:
- Answer **"No"** to ALL questions
- Result should show: **4+**
- Click **"Done"**

---

## Step 7: Set Up Pricing

1. In the left sidebar, click **"Pricing and Availability"** (under "General")
2. **Price:** Select **"Free"** (or $0.00 / USD 0)
3. **Availability:** Select **"Available in all territories"** (or choose specific countries)
4. Click **"Save"**

---

## Step 8: App Privacy

1. In the left sidebar, click **"App Privacy"** (under "General")
2. Click **"Get Started"** (if not already configured)
3. **"Does your app collect any of the data types listed below?"**
   - Select: **"No, we do not collect data from this app"**
4. Click **"Save"** then **"Publish"**

**Privacy Policy URL:**
```
https://hyunsikk.github.io/glovebox/privacy.html
```

Make sure this is entered in the Privacy Policy URL field.

---

## Step 9: Select Build

1. Go back to the v2.0.0 version page
2. Scroll down to the **"Build"** section
3. Click **"Select a build before you submit your app"** (or the "+" button)
4. Wait for the build to appear (it may take 5-15 minutes after `eas submit`)
5. Select **build 2.0.0** (the latest successful build)
6. **Export Compliance dialog will appear:**
   - "Does your app use encryption?": Click **"No"**
   - (Our app.json has `ITSAppUsesNonExemptEncryption: false`)
7. Click **"Done"**

**If the build doesn't appear:**
- Go to **"TestFlight"** tab in App Store Connect
- Check if the build is processing
- Wait until status shows "Ready to Submit"

---

## Step 10: App Review Information

1. Scroll down to **"App Review Information"** section

### 10.1 — Contact Information

- **First Name:** `Hyun Sik`
- **Last Name:** `Kim`
- **Phone Number:** [Your phone number]
- **Email Address:** `paul483@naver.com`

### 10.2 — Sign-in Required

- Select: **"Sign-in is not required"**
- (Our app doesn't require login)

### 10.3 — Notes

Paste the full review notes:

```
REVIEW NOTES FOR APPLE

Car Story v2.0.0 is a privacy-first car maintenance tracker. Key points:

1. PRIVACY: 100% offline. All data stored locally via AsyncStorage. No servers, no analytics, no tracking. Zero network requests except optional NHTSA recall checks (user must enable per vehicle).

2. DATA: Vehicle maintenance schedules for 1,000+ vehicles are bundled in the app (content/v1/vehicles.json). All data derived from publicly available owner's manuals.

3. NO ACCOUNT: App works immediately upon download. No login, no signup, no email collection.

4. FEATURES:
   - Service logging with photo attachments
   - Fuel tracking with MPG calculations
   - Cost analytics and benchmarks
   - Optional NHTSA recall alerts (opt-in per vehicle)
   - Cloud backup via JSON export/import
   - Shareable HTML reports

5. PERMISSIONS:
   - Camera/Photos (optional): For receipt photos attached to service records
   - Notifications (optional): For local maintenance reminders (no server push)

6. FREE: Completely free, no ads, no IAP.

TEST FLOW:
1. Launch app → complete onboarding
2. Add vehicle: Tap "+" → search "2019 Toyota RAV4" → select → save
3. Log service: History tab → "+" → select vehicle → "Oil Change" → save
4. Log fuel: History tab → "+" → "Fuel" → total cost → save
5. View analytics: Insights tab → see MPG, cost trends
6. Export data: Settings → Cloud Backup → Export Data

OR tap "Load Sample Data" on welcome screen for instant demo.

Contact: support@teamam.dev
```

### 10.4 — Attachments (optional)

You can attach additional screenshots or a demo video if you want.

---

## Step 11: Version Release Method

1. Scroll down to **"Version Release"** section
2. Select one:
   - ⭐ **"Manually release this version"** — RECOMMENDED
     - You control exactly when it goes live after approval
   - "Automatically release this version" — Goes live immediately after approval
   - "Automatically release this version after App Review, no earlier than [date]" — Schedule a specific date

---

## Step 12: Final Review & Submit

### 12.1 — Check All Sections

Look at the left sidebar. Every section should have a **green checkmark** ✅:
- [ ] Version Information ✅
- [ ] App Screenshots ✅
- [ ] Build ✅
- [ ] App Review Information ✅
- [ ] App Information ✅
- [ ] Pricing and Availability ✅
- [ ] App Privacy ✅

**If any section has a yellow warning** ⚠️ **or red X** ❌:
- Click on that section
- Fix the issue (usually a missing required field)
- Save

### 12.2 — Submit

1. Click **"Add for Review"** button (top right, blue button)
2. A summary page appears — review all details
3. Click **"Submit to App Review"**
4. Confirmation dialog appears — click **"Submit"**
5. Status changes to: **"Waiting for Review"**

---

## Step 13: After Submission — What to Expect

### Timeline

| Status | Typical Duration | What's Happening |
|--------|-----------------|-------------------|
| Waiting for Review | 1-3 days | In Apple's review queue |
| In Review | 24-48 hours | A reviewer is testing your app |
| Pending Developer Release | Immediate | Approved! Ready for you to release |
| Ready for Sale | After you release | Live on the App Store! |

### If Rejected

1. You'll receive an email with the rejection reason
2. Go to App Store Connect → **"Resolution Center"**
3. Read the specific issue(s) cited
4. Fix the issue(s)
5. Resubmit

**Common rejection reasons for v2.0:**
- Screenshots don't match app (unlikely — ours are real)
- Privacy label mismatch (unlikely — we truly collect no data)
- NHTSA API not disclosed (we disclosed it in review notes)
- Push notification permission not justified (we justify it in infoPlist)

### If Approved

1. You'll get an email: "Your app has been approved"
2. Go to App Store Connect
3. Status shows: **"Pending Developer Release"**
4. When ready, click **"Release This Version"**
5. App goes live within ~1 hour
6. 🎉 Celebrate!

---

## Quick Reference: All Copy-Paste Values

| Field | Value |
|-------|-------|
| App Name | `Car Story — Maintenance Log` |
| Subtitle | `Track Service & Auto Repair` |
| Keywords | `car,maintenance,vehicle,oil change,service,auto,repair,mileage,tracker,mechanic,garage,log,reminder` |
| Support URL | `https://hyunsikk.github.io/glovebox/support.html` |
| Marketing URL | `https://hyunsikk.github.io/glovebox/` |
| Privacy URL | `https://hyunsikk.github.io/glovebox/privacy.html` |
| Category (Primary) | Utilities |
| Category (Secondary) | Lifestyle |
| Price | Free |
| Age Rating | 4+ |
| Encryption | No |
| Data Collection | No |
| Sign-in Required | No |

---

## Files on Disk

| What | Path |
|------|------|
| iPhone 6.7" screenshots | `teamam/apps/glovebox/screenshots/appstore/iPhone-6.7/` |
| iPhone 6.5" screenshots | `teamam/apps/glovebox/screenshots/appstore/iPhone-6.5/` |
| iPad 12.9" screenshots | `teamam/apps/glovebox/screenshots/appstore/iPad-12.9/` |
| Full submission metadata | `teamam/apps/glovebox/APP_STORE_SUBMISSION_PACKAGE.md` |
| App icon (1024×1024) | `teamam/apps/glovebox/autolog-app/assets/icon.png` |

---

*Generated by Sam | March 10, 2026*
