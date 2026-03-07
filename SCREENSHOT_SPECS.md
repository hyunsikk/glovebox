# Car Story — App Store Screenshot Specifications

**Version:** 1.1.0  
**Last Updated:** March 4, 2026  
**Brand System:** Car Story Automotive-Tech Design Language

---

## Brand Color System (from theme.js)

### Core Colors
```css
--background: #0A0E1A           /* Deep space background */
--surface1: #111827             /* Card background (glassmorphism base) */
--surface2: #1A2236             /* Elevated cards/modals */
--surface3: #243049             /* Interactive elements hover */

--primary: #3B82F6              /* Electric blue (CTAs, interactive) */
--warning: #F59E0B              /* Amber (due soon) */
--danger: #EF4444               /* Safety red (overdue) */
--success: #10B981              /* Emerald green (healthy) */

--text-primary: #F1F5F9         /* Crisp white */
--text-secondary: #94A3B8       /* Cool gray */
--text-tertiary: #64748B        /* Muted */

--glass-border: rgba(255,255,255,0.06)
--glass-background: rgba(17,24,39,0.8)
```

### Typography Scale
```css
Hero:    Nunito Bold 32px, line-height 38px
H1:      Nunito Bold 24px, line-height 30px  
H2:      Nunito SemiBold 18px, line-height 24px
Body:    Nunito Regular 15px, line-height 21px
Caption: Nunito Medium 13px, line-height 17px
```

---

## Screenshot Narrative Arc

Tell a left-to-right story: **Problem → Solution → Ease → Insight → Organization → Peace**

1. **Never Miss an Oil Change** — Problem/Attention (maintenance anxiety)
2. **Instant Manufacturer Schedules** — Solution/Value (accurate data)
3. **Log Services in Seconds** — Ease of Use (quick interaction)
4. **Track Every Dollar** — Insight/Intelligence (cost awareness)
5. **All Your Documents, One Place** — Organization (comprehensive tool)
6. **Complete Peace of Mind** — Conclusion/Emotion (success state)

---

## iPhone 6.7" (1290 x 2796) — iPhone 15 Pro Max [REQUIRED]

### Screenshot 1: "Never Miss an Oil Change"
**Screen to Show:** Garage tab with 2-3 vehicles showing maintenance status mix

**Headline Text:** "Never Miss an Oil Change"
- **Position:** Top center, 80px from top edge
- **Font:** Nunito Bold 52px
- **Color:** #F1F5F9 (Crisp White)
- **Accent:** "Oil Change" in #3B82F6 (Electric Blue)

**Subheadline:** "Smart alerts for every vehicle"
- **Position:** Below headline, 16px gap
- **Font:** Nunito SemiBold 26px
- **Color:** #94A3B8 (Cool Gray)

**Background Treatment:**
- **Base:** #0A0E1A (Deep space background) solid
- **Top Gradient:** Subtle radial glow from #3B82F6 at 10% opacity, centered at top-third
- **Purpose:** Draw eye to headline while maintaining premium dark theme

**Screen Details:**
- **Status Bar:** 9:41, full signal, WiFi, 100% battery (white icons)
- **Navigation:** "garage" title (lowercase) in top left
- **Main Content:** 2 vehicle cards in vertical stack
  
  **Card 1 (Top):**
  - Make icon circle (Toyota "T" in red-tinted circle)
  - Vehicle: "2019 Toyota RAV4" in white
  - Nickname: "Daily Driver" in cool gray
  - Health score dial: 89% in amber/warning zone
  - Status badge: "Oil Change Due" in amber (#F59E0B) background
  - Next service: "Due in 3 days" with small clock icon
  - Mileage: "24,567 mi" in caption
  
  **Card 2 (Bottom):**
  - Make icon circle (Tesla "T" in charcoal circle)
  - Vehicle: "2021 Tesla Model 3"
  - Nickname: "Weekend Car"
  - Health score dial: 98% in green/success zone
  - Status: Green checkmark with "All services up to date"
  - Next service: "Tire rotation in 42 days"
  - Mileage: "12,340 mi"

- **Bottom:** "+" FAB button in electric blue, subtle shadow
- **Tab Bar:** 5 icons (garage selected in electric blue)

**Visual Emphasis:**
- Amber alert badge should be prominent but not alarming
- Health score dials use graduated colors (red → amber → green)
- Clean glassmorphism cards with subtle borders
- Touch of urgency without stress

---

### Screenshot 2: "Instant Manufacturer Schedules"
**Screen to Show:** Vehicle detail modal showing manufacturer maintenance schedule list

**Headline Text:** "Instant Manufacturer Schedules"
- **Position:** Top center, 80px from top edge
- **Font:** Nunito Bold 50px
- **Color:** #F1F5F9 (Crisp White)
- **Accent:** "Instant" in #3B82F6 (Electric Blue)

**Subheadline:** "1,000+ vehicles. 1976-2026."
- **Position:** Below headline, 16px gap
- **Font:** Nunito SemiBold 26px
- **Color:** #94A3B8 (Cool Gray)

**Background Treatment:**
- **Base:** #0A0E1A (Deep space)
- **Left Edge:** Vertical electric blue accent line (4px width, 60% opacity, running from top to 1/3 down)
- **Purpose:** Professional, data-focused aesthetic

**Screen Details:**
- **Modal Header:**
  - Vehicle: "2023 Honda Civic" with car icon
  - Subtitle: "Sport Touring Sedan"
  - Close button (X) top-right
  
- **Maintenance Schedule Section:**
  - Section header: "Manufacturer Schedule" with small info icon
  - List of 6-8 service items in glassmorphism cards:
  
  **1. Oil Change**
  - Icon: 🛢️ emoji in amber-tinted circle
  - Interval: "7,500 miles / 12 months"
  - Status: Green dot + "Not due (5,200 mi left)"
  - Est. Cost: "$45-65"
  
  **2. Tire Rotation**
  - Icon: 🔄 emoji in blue-tinted circle
  - Interval: "7,500 miles / 6 months"  
  - Status: Amber dot + "Due soon (800 mi)"
  - Est. Cost: "$25-45"
  
  **3. Air Filter**
  - Icon: ⚙️ emoji in gray-tinted circle
  - Interval: "30,000 miles / 24 months"
  - Status: Green dot + "Not due"
  - Est. Cost: "$15-40"
  
  **4. Brake Inspection**
  - Icon: 🔧 emoji in blue-tinted circle
  - Interval: "15,000 miles / 12 months"
  - Status: Green dot + "Completed 2 months ago"
  - Est. Cost: "$0-50"
  
  **5. Cabin Air Filter**
  - Icon: 🌬️ emoji in green-tinted circle
  - Interval: "20,000 miles / 12 months"
  - Status: Green dot + "Not due"
  - Est. Cost: "$15-40"

  **6. Transmission Fluid**
  - Icon: ⚙️ emoji in amber-tinted circle
  - Interval: "60,000 miles / 48 months"
  - Status: Gray dot + "Not due (38,000 mi left)"
  - Est. Cost: "$80-200"

- **Source Attribution:** Bottom of screen
  - Small gray text: "Source: Honda 2023 Civic Maintenance Guide"
  - Icon: Small document icon

- **Action Button:** "Add Service Record" in electric blue, bottom-fixed

**Visual Emphasis:**
- Professional table/list layout with clear hierarchy
- Color-coded status dots (green = good, amber = soon, red = overdue, gray = far out)
- Cost ranges visible but not overpowering
- Clean intervals displayed prominently
- Source citation builds trust

---

### Screenshot 3: "Log Services in Seconds"
**Screen to Show:** Log Service modal with form fields and attached photo

**Headline Text:** "Log Services in Seconds"
- **Position:** Bottom center, 120px from bottom edge
- **Font:** Nunito Bold 52px
- **Color:** #F1F5F9 (Crisp White)
- **Accent:** "Seconds" in #3B82F6 (Electric Blue)

**Subheadline:** "Photos, costs, & notes — all organized"
- **Position:** Above headline, 16px gap
- **Font:** Nunito SemiBold 26px
- **Color:** #94A3B8 (Cool Gray)

**Background Treatment:**
- **Base:** #0A0E1A (Deep space)
- **Bottom Gradient:** Soft fade from #3B82F6 at 8% opacity at bottom
- **Purpose:** Ground the text and create visual stability

**Screen Details:**
- **Modal Header:**
  - Title: "Log Service" centered
  - Close button (X) top-right
  - Back arrow top-left

- **Form Fields (all glassmorphism style):**

  **Vehicle Selector:**
  - Selected: "2019 Toyota RAV4 • Daily Driver"
  - Small dropdown indicator

  **Service Type:**
  - Dropdown: "Oil Change" selected
  - Icon: 🛢️ emoji left-aligned
  
  **Date:**
  - Date picker: "Today, March 4, 2026"
  - Calendar icon
  
  **Mileage:**
  - Input field: "24,567 miles"
  - Speedometer icon
  
  **Cost:**
  - Input field: "$52.99"
  - Dollar icon
  - Keyboard visible at bottom (numbers)
  
  **Vendor:**
  - Input field: "Quick Lube Station"
  - Location pin icon
  
  **Notes:**
  - Text area: "Synthetic 0W-20, replaced oil filter"
  - Note icon
  
  **Photos Section:**
  - Label: "Receipt Photos (2/5)"
  - 2 photo thumbnails visible:
    - Thumb 1: Receipt showing "Quick Lube" text
    - Thumb 2: Close-up of oil change sticker on windshield
  - "+" button to add more photos
  - Small "Tap to view" hint

- **Bottom Actions:**
  - "Save Service" button in electric blue, full-width, prominent
  - "Cancel" text button below (gray)

**Visual Emphasis:**
- Clean, minimal form design
- Photo thumbnails clearly visible showing actual receipt
- Keyboard visible to show "actively logging" state
- Clear call-to-action button
- Show how fast/easy the process is
- Professional but friendly

---

### Screenshot 4: "Track Every Dollar"
**Screen to Show:** Insights tab with cost chart and spending breakdown

**Headline Text:** "Track Every Dollar"
- **Position:** Top center, 80px from top edge
- **Font:** Nunito Bold 52px
- **Color:** #F1F5F9 (Crisp White)
- **Accent:** "Every Dollar" in #3B82F6 (Electric Blue)

**Subheadline:** "See where your money goes"
- **Position:** Below headline, 16px gap
- **Font:** Nunito SemiBold 26px
- **Color:** #94A3B8 (Cool Gray)

**Background Treatment:**
- **Base:** #0A0E1A (Deep space)
- **Center:** Subtle radial gradient from #1A2236 (surface2) behind the chart area
- **Purpose:** Highlight data visualization area

**Screen Details:**
- **Tab Title:** "insights" (lowercase) top-left
- **Vehicle Selector:** Dropdown at top showing "2019 Toyota RAV4"

- **Monthly Spending Chart:**
  - Card with glassmorphism background
  - Title: "Spending Trend (6 months)"
  - Bar chart showing:
    - X-axis: Oct, Nov, Dec, Jan, Feb, Mar
    - Y-axis: $0, $100, $200, $300, $400, $500
    - Bars in electric blue gradient (darker at top, lighter at bottom)
    - Values: $89, $0, $156, $234, $0, $52 (showing typical oil change pattern)
  - Current month (Mar) bar is highlighted/brighter
  - Clean gridlines in subtle gray (horizontal only)

- **Cost Summary Cards (3 cards in row below chart):**
  
  **Card 1: Total Spent**
  - Icon: 💰 emoji in amber circle
  - Label: "Total Spent (2024)"
  - Value: "$1,247.50" in large white bold
  - Subtext: "+12% vs 2023" with small up arrow
  
  **Card 2: Cost Per Mile**
  - Icon: 📊 emoji in blue circle
  - Label: "Cost per Mile"
  - Value: "$0.12" in large white bold
  - Subtext: "-8% optimized" with small down arrow in green
  
  **Card 3: This Month**
  - Icon: 📅 emoji in green circle
  - Label: "March 2026"
  - Value: "$52.99" in large white bold
  - Subtext: "-23% vs Feb" with small down arrow

- **Service Breakdown Section:**
  - Title: "Top Services (2024)"
  - List of 3 items:
    1. Oil Changes: $320 (4 services)
    2. Tire Rotations: $180 (4 services)
    3. Brake Inspection: $145 (1 service)
  - Each item has small icon and horizontal bar showing proportion

- **Pro Feature Teaser (subtle, bottom):**
  - Small card with blurred content behind glass
  - Label: "🔒 Pro: 12-Month Predictions"
  - Subtext: "Unlock advanced analytics"
  - "Learn More" link in electric blue

**Visual Emphasis:**
- Beautiful chart with electric blue accent color
- Clear financial insights without overwhelming
- Professional dashboard feel
- Subtle Pro feature hint (not pushy)
- Color-coded trends (green = good, red = bad)
- Easy-to-scan layout

---

### Screenshot 5: "All Your Documents, One Place"
**Screen to Show:** Documents tab with organized document cards

**Headline Text:** "All Your Documents, One Place"
- **Position:** Top center, 80px from top edge
- **Font:** Nunito Bold 48px (slightly smaller to fit)
- **Color:** #F1F5F9 (Crisp White)
- **Accent:** "One Place" in #3B82F6 (Electric Blue)

**Subheadline:** "Receipts, insurance, registration"
- **Position:** Below headline, 16px gap
- **Font:** Nunito SemiBold 26px
- **Color:** #94A3B8 (Cool Gray)

**Background Treatment:**
- **Base:** #0A0E1A (Deep space)
- **Right Edge:** Diagonal electric blue accent (subtle, 15% opacity, from top-right going down-left)
- **Purpose:** Modern, organized aesthetic

**Screen Details:**
- **Tab Title:** "documents" (lowercase) top-left
- **Action Button:** "+" in top-right for adding documents
- **Subtitle:** "2019 Toyota RAV4" with dropdown (vehicle selector)

- **Document Cards (4 visible):**

  **Card 1: Insurance**
  - Icon: 🛡️ emoji in blue-tinted circle (large)
  - Type: "Insurance"
  - Document name: "State Farm Auto Policy"
  - Status badge: "Expires in 127d" in green
  - Date added: "Updated Feb 15, 2026"
  - Preview: Thumbnail of insurance card visible (blurred for privacy)
  - Actions: Eye icon (view) and share icon
  
  **Card 2: Registration**
  - Icon: 📋 emoji in green-tinted circle
  - Type: "Registration"  
  - Document name: "California Vehicle Registration"
  - Status badge: "Expires in 18d" in amber (warning)
  - Date added: "Expires Mar 22, 2026"
  - Preview: Thumbnail of registration document
  - Actions: Eye icon and share icon
  
  **Card 3: Title**
  - Icon: 📜 emoji in amber-tinted circle
  - Type: "Title"
  - Document name: "Vehicle Title Certificate"
  - Status: No expiry (green checkmark)
  - Date added: "Added Apr 3, 2024"
  - Preview: Thumbnail of title document
  - Actions: Eye icon and share icon
  
  **Card 4: Service Receipt**
  - Icon: 📄 emoji in blue-tinted circle
  - Type: "Other"
  - Document name: "Oil Change Receipt - Mar 4"
  - Status: No expiry
  - Date added: "Today"
  - Preview: Thumbnail showing "Quick Lube" receipt
  - Actions: Eye icon and share icon

- **Bottom Action:**
  - "Generate Service Report" button in electric blue
  - Subtext: "Create PDF with full service history"

**Visual Emphasis:**
- Professional document organization
- Clear visual thumbnails (but privacy-respecting blur)
- Expiry tracking badges prominent
- Color-coded urgency (green = valid, amber = expiring soon)
- Modern file management aesthetic
- PDF generation capability highlighted

---

### Screenshot 6: "Complete Peace of Mind"
**Screen to Show:** Garage view with multiple healthy vehicles + summary

**Headline Text:** "Complete Peace of Mind"
- **Position:** Bottom center, 120px from bottom edge
- **Font:** Nunito Bold 52px
- **Color:** #F1F5F9 (Crisp White)
- **Accent:** "Peace of Mind" in #10B981 (Emerald Green)

**Subheadline:** "Track unlimited vehicles, forever free"
- **Position:** Above headline, 16px gap
- **Font:** Nunito SemiBold 26px
- **Color:** #94A3B8 (Cool Gray)

**Background Treatment:**
- **Base:** #0A0E1A (Deep space)
- **Bottom:** Subtle gradient fade to #10B981 (Emerald Green) at 5% opacity
- **Purpose:** Positive, reassuring conclusion

**Screen Details:**
- **Tab Title:** "garage" (lowercase) top-left
- **Navigation:** Settings gear icon top-right

- **Summary Stats Card (top):**
  - Glassmorphism card spanning full width
  - Title: "Your Garage"
  - 3 stat columns:
    - "3 Vehicles" with car icon
    - "$2,456 Spent (2024)" with dollar icon  
    - "All Up to Date ✓" with checkmark icon in green
  - Clean, minimal design

- **Vehicle Cards (3 visible):**

  **Card 1: 2019 Toyota RAV4**
  - Toyota icon (red-tinted T in circle)
  - Name: "2019 Toyota RAV4"
  - Nickname: "Daily Driver"
  - Health score dial: 100% in pure green zone
  - Large green checkmark: "All services up to date"
  - Next service: "Oil change in 42 days"
  - Mileage: "24,567 mi"
  - Last service: "3 days ago"
  
  **Card 2: 2021 Tesla Model 3**
  - Tesla icon (charcoal T in circle)
  - Name: "2021 Tesla Model 3"
  - Nickname: "Weekend Car"
  - Health score dial: 95% in green zone
  - Green checkmark: "All services current"
  - Next service: "Tire rotation in 28 days"
  - Mileage: "12,340 mi"
  - Last service: "2 weeks ago"
  
  **Card 3: 2015 Honda Accord**
  - Honda icon (blue-tinted H in circle)
  - Name: "2015 Honda Accord"
  - Nickname: "Commuter"
  - Health score dial: 89% in light green zone
  - Status: "Next: Air filter"
  - Next service: "Air filter in 18 days"
  - Mileage: "87,234 mi"
  - Last service: "1 month ago"

- **Bottom Area:**
  - "Add Vehicle" button in transparent with electric blue border
  - Small text: "Unlimited vehicles, forever free"

**Visual Emphasis:**
- Positive, successful state showing ALL green
- Health scores all looking healthy
- Clean multi-vehicle management
- Reassuring, professional conclusion
- Emphasis on "unlimited" and "free" in subtext
- No urgency, all calm and organized
- Completion feeling

---

## iPhone 6.5" (1284 x 2778) — iPhone 14 Plus [REQUIRED]

**Note:** All specifications identical to iPhone 6.7" with the following adjustments:

### Dimension Adjustments
- **Canvas:** 1284 x 2778 (vs 1290 x 2796)
- **Top Margin:** 75px (vs 80px)
- **Bottom Margin:** 115px (vs 120px)
- **Font Sizes:** 
  - Headlines: 48-50px (vs 50-52px)
  - Subheadlines: 24px (vs 26px)

### Layout Considerations
- Slightly tighter vertical spacing (4-6px reduction per section)
- All other design elements, colors, and content **identical**
- Test that all text remains readable at smaller headlines
- Ensure touch targets remain 44px minimum
- Status bar and safe areas adjusted for device

**Screenshot Order:** Same 1-6 progression as iPhone 6.7"

---

## iPad Pro 12.9" (2048 x 2732) [REQUIRED]

### General iPad Adaptations

**Typography Scale (Larger for tablet viewing distance):**
- **Headline:** Nunito Bold 64-70px
- **Subheadline:** Nunito SemiBold 32-36px
- **Body Text:** 18-20px (where applicable)

**Layout Philosophy:**
- Use horizontal space to show more content simultaneously
- Split-screen layouts where appropriate (sidebar + detail view)
- Larger cards with more breathing room
- Desktop-class information density
- Two-column layouts for list content

**Margins:**
- **Top/Bottom:** 120px minimum
- **Left/Right:** 160px minimum (centered content)
- **Card Padding:** 32px (vs 20px on iPhone)

---

### Screenshot 1: "Never Miss an Oil Change"
**Screen to Show:** Garage tab with side-by-side vehicle cards (2 columns) + upcoming maintenance calendar

**Headline Text:** "Never Miss an Oil Change"
- **Position:** Top center, 120px from edge
- **Size:** 68px, Nunito Bold
- **Color:** #F1F5F9, "Oil Change" in #3B82F6

**Subheadline:** "Smart alerts for every vehicle you own"
- **Position:** Below headline, 20px gap
- **Size:** 34px, Nunito SemiBold
- **Color:** #94A3B8

**Background Treatment:**
- **Base:** #0A0E1A
- **Top Gradient:** Wide radial glow from #3B82F6 (15% opacity)

**Screen Details:**
- **Left Panel (60%):** 2×2 grid of vehicle cards
  - 4 vehicles visible simultaneously
  - Each card larger than iPhone version:
    - Make icon and health score prominent
    - Next service with countdown
    - Last service date
    - Quick action buttons visible
  - Mix of states:
    - Vehicle 1: Amber alert "Oil Change Due"
    - Vehicle 2: Green "All services current"
    - Vehicle 3: Blue "Tire rotation soon"
    - Vehicle 4: Green "Up to date"

- **Right Panel (40%):** Maintenance calendar sidebar
  - **Calendar Widget:**
    - Current month (March 2026) with dates
    - Service due dates marked with colored dots:
      - March 7: Amber dot (oil change due)
      - March 15: Blue dot (tire rotation)
      - March 22: Red dot (registration expiry)
  - **Upcoming Services List (below calendar):**
    - Next 3 services with vehicle names:
      1. "Oil Change • RAV4 • Due Mar 7"
      2. "Tire Rotation • Accord • Due Mar 15"  
      3. "Registration Expiry • Tesla • Due Mar 22"
  - Clean, desktop-class sidebar design

- **Bottom:** Tab bar with 5 icons (garage selected)
- **FAB:** "+" button in bottom-right for quick add

**Visual Emphasis:**
- Desktop-class multi-vehicle management
- Calendar integration prominent
- Professional dashboard aesthetic
- Spatial organization showing relationships
- No scrolling needed to see overview

---

### Screenshot 2: "Instant Manufacturer Schedules"
**Screen to Show:** Split view — vehicle list sidebar + detailed schedule table

**Headline Text:** "Instant Manufacturer Schedules"
- **Position:** Top center, 120px from edge
- **Size:** 66px, Nunito Bold
- **Color:** #F1F5F9, "Instant" in #3B82F6

**Subheadline:** "1,000+ vehicles from 1976 to 2026 — every major brand"
- **Position:** Below headline, 20px gap
- **Size:** 32px, Nunito SemiBold
- **Color:** #94A3B8

**Background Treatment:**
- **Base:** #0A0E1A
- **Left Third:** Vertical #3B82F6 accent bar (6px, 50% opacity)

**Screen Details:**
- **Left Sidebar (30%):** Vehicle/brand selector
  - Search bar at top: "Search vehicles..."
  - Brand logo grid (scrollable):
    - Toyota (red logo)
    - Honda (blue logo)
    - Ford (blue logo)
    - Chevrolet (gold logo)
    - BMW (black/white logo)
    - Tesla (red logo)
    - Mercedes (silver logo)
    - Audi (red logo)
  - Currently selected: "Honda" → "2023 Civic"
  - Clean, icon-based navigation

- **Right Panel (70%):** Full maintenance schedule table
  - Card header: "2023 Honda Civic Sport Touring"
  - Professional data table:
    
    **Columns:**
    - Service Type (with icon)
    - Mileage Interval
    - Time Interval
    - Status
    - Est. Cost
    
    **Rows (8-10 visible):**
    1. 🛢️ Oil Change | 7,500 mi | 12 mo | ✅ Not due (5,200 left) | $45-65
    2. 🔄 Tire Rotation | 7,500 mi | 6 mo | ⚠️ Due soon (800 mi) | $25-45
    3. ⚙️ Air Filter | 30,000 mi | 24 mo | ✅ Not due | $15-40
    4. 🔧 Brake Inspection | 15,000 mi | 12 mo | ✅ Completed 2 mo ago | $0-50
    5. 🌬️ Cabin Filter | 20,000 mi | 12 mo | ✅ Not due | $15-40
    6. 💧 Brake Fluid | 30,000 mi | 24 mo | ✅ Not due | $70-120
    7. ⚙️ Transmission | 60,000 mi | 48 mo | ⚪ Not due (38k left) | $80-200
    8. 💧 Coolant | 60,000 mi | 48 mo | ⚪ Not due | $50-150
    9. ⚡ Spark Plugs | 60,000 mi | 48 mo | ⚪ Not due | $60-200
    10. 🔧 Timing Belt | 105,000 mi | 84 mo | ⚪ Not due | $500-900
  
  - Status icons color-coded
  - Sortable columns (small sort icon in headers)
  - Clean typography, easy to scan

- **Footer:**
  - Source: "Honda 2023 Civic Maintenance Guide"
  - Small info icon: "Intervals may vary based on driving conditions"

**Visual Emphasis:**
- Desktop-class data presentation
- Brand coverage visible and browsable
- Professional table design with clear hierarchy
- Color-coded status system
- Comprehensive information density
- Clean, spreadsheet-like layout (but beautiful)

---

### Screenshot 3: "Log Services in Seconds"
**Screen to Show:** Split view — service entry form (left) + live preview/timeline (right)

**Headline Text:** "Log Services in Seconds"
- **Position:** Bottom center, 140px from edge
- **Size:** 70px, Nunito Bold
- **Color:** #F1F5F9, "Seconds" in #3B82F6

**Subheadline:** "Photos, receipts, costs, and notes — beautifully organized"
- **Position:** Above headline, 20px gap
- **Size:** 34px, Nunito SemiBold
- **Color:** #94A3B8

**Background Treatment:**
- **Base:** #0A0E1A
- **Bottom:** Gentle #3B82F6 gradient (10% opacity) behind text

**Screen Details:**
- **Left Panel (45%):** Service entry form
  - Modal card with glassmorphism
  - Title: "Log Service"
  
  **Form fields (spacious, clean):**
  - Vehicle: Dropdown showing "2019 Toyota RAV4 • Daily Driver"
  - Service type: Dropdown with "Oil Change" selected (icon visible)
  - Date: Date picker showing "Today, March 4, 2026"
  - Mileage: Input "24,567 miles" with unit selector
  - Cost: Input "$52.99" with currency symbol
  - Vendor: Input "Quick Lube Station" with location icon
  - Notes: Text area "Synthetic 0W-20, replaced oil filter, checked tire pressure"
  
  **Photos section:**
  - Label: "Receipt Photos (2/5)"
  - 2 photo thumbnails (larger on iPad):
    - Thumb 1: Receipt showing "Quick Lube" header
    - Thumb 2: Windshield oil change sticker close-up
  - Large "+" button to add more
  - Photos displayed at ~150px square each
  
  **Bottom actions:**
  - "Save Service" button (large, electric blue, full-width)
  - "Cancel" text link below

- **Right Panel (55%):** Live timeline preview
  - Title: "Service History Preview"
  - Subtext: "Your new entry will appear here"
  
  **Preview entry (highlighted):**
  - "NEW" badge in electric blue
  - "Oil Change" with 🛢️ icon
  - Date: "Today, March 4"
  - Mileage: "24,567 mi"
  - Cost: "$52.99"
  - Vendor: "Quick Lube Station"
  - Photo thumbnails visible
  - Glow effect around card
  
  **Recent history below (last 4 entries, non-highlighted):**
  - Tire Rotation • Feb 18 • 23,890 mi • $35
  - Brake Inspection • Jan 5 • 22,100 mi • $0
  - Oil Change • Dec 12 • 19,450 mi • $48.50
  - Air Filter • Nov 3 • 18,200 mi • $28

- **Visual connector:** Dotted line from form to preview showing flow

**Visual Emphasis:**
- Desktop workflow aesthetic
- Live preview reassures user
- Spacious form design (not cramped)
- Clear photo capabilities
- Timeline context visible
- Professional data entry experience

---

### Screenshot 4: "Track Every Dollar"
**Screen to Show:** Advanced analytics dashboard with multiple charts and insights

**Headline Text:** "Track Every Dollar"
- **Position:** Top center, 120px from edge
- **Size:** 68px, Nunito Bold
- **Color:** #F1F5F9, "Every Dollar" in #3B82F6

**Subheadline:** "Powerful insights to save money and optimize maintenance"
- **Position:** Below headline, 20px gap
- **Size:** 34px, Nunito SemiBold
- **Color:** #94A3B8

**Background Treatment:**
- **Base:** #0A0E1A
- **Center:** Subtle #1A2236 radial behind dashboard

**Screen Details:**
- **Top Stats Bar:** 4 stat cards (equal width, horizontal row)
  
  **Card 1:**
  - Icon: 💰 in amber circle
  - Label: "Total Spent"
  - Value: "$1,247.50"
  - Badge: "2024 YTD"
  - Trend: "+12% vs 2023" with small arrow
  
  **Card 2:**
  - Icon: 📊 in blue circle
  - Label: "Cost per Mile"
  - Value: "$0.12"
  - Trend: "-8% optimized" with green down arrow
  
  **Card 3:**
  - Icon: 📅 in green circle
  - Label: "This Month"
  - Value: "$89.99"
  - Trend: "-23% vs Feb" with green down arrow
  
  **Card 4:**
  - Icon: 📈 in purple circle
  - Label: "Forecast (12mo)"
  - Value: "$1,580"
  - Badge: "🔒 Pro" (subtle lock icon)

- **Main Content (two columns):**

  **Left Panel (55%):** Large spending trend chart
  - Card title: "Spending Trend (12 months)"
  - Beautiful bar chart:
    - X-axis: Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar
    - Y-axis: $0, $200, $400, $600, $800
    - Bars in electric blue gradient (darker top, lighter bottom)
    - Values visible on top of each bar
    - Current month highlighted brighter
    - Smooth, professional visualization
    - Gridlines subtle and minimal
    - Responsive hover states (if interactive)
  
  **Right Panel (45%):** Breakdown widgets stack
  
  **Widget 1: Service Breakdown**
  - Title: "Top Services (2024)"
  - Horizontal bar chart:
    - Oil Changes: $320 (4×) — 40% bar
    - Tire Rotations: $180 (4×) — 22% bar
    - Brake Inspection: $145 (1×) — 18% bar
    - Air Filters: $112 (3×) — 14% bar
    - Other: $50 — 6% bar
  - Each bar has icon and color
  
  **Widget 2: Upcoming Costs**
  - Title: "Next 30 Days"
  - List of 3 upcoming services:
    - Oil Change • Mar 7 • $55 (est)
    - Tire Rotation • Mar 15 • $40 (est)
    - Brake Fluid • Mar 22 • $95 (est)
  - Total: "$190 estimated"
  
  **Widget 3: Optimization Tip**
  - Title: "💡 Cost Insight"
  - Card with light blue background
  - Text: "Your oil changes cost $15 less than average for 2019 RAV4 owners"
  - Subtext: "You're 12% below average — great work!"
  - "View Pro Analytics" link

- **Bottom:** Small "Pro" feature teaser
  - Blurred content with lock icon
  - "Unlock 12-month predictions and benchmarks"

**Visual Emphasis:**
- Desktop-class analytics dashboard
- Multiple simultaneous insights
- Professional financial tools
- Beautiful data visualization
- Color-coded trends
- Gentle Pro feature hints (not aggressive)
- Information density appropriate for large screen

---

### Screenshot 5: "All Your Documents, One Place"
**Screen to Show:** Documents gallery with sidebar categories + large thumbnails

**Headline Text:** "All Your Documents, One Place"
- **Position:** Top center, 120px from edge
- **Size:** 66px, Nunito Bold
- **Color:** #F1F5F9, "One Place" in #3B82F6

**Subheadline:** "Service receipts, insurance, registration, and warranties"
- **Position:** Below headline, 20px gap
- **Size:** 32px, Nunito SemiBold
- **Color:** #94A3B8

**Background Treatment:**
- **Base:** #0A0E1A
- **Right Edge:** Diagonal #3B82F6 accent (subtle, 12% opacity)

**Screen Details:**
- **Left Sidebar (25%):** Document categories
  - Search bar at top: "Search documents..."
  - Category list (file browser style):
    - 📁 All Documents (124)
    - 🛡️ Insurance (4) ← selected (highlighted)
    - 📋 Registration (3)
    - 📜 Title (2)
    - ✅ Inspection (8)
    - 🌱 Emissions (6)
    - 📄 Service Receipts (87)
    - 📖 Manuals (14)
  - Each category shows count
  - Selected category highlighted in electric blue
  - Clean, macOS Finder-like aesthetic

- **Right Panel (75%):** Document grid
  - **Top toolbar:**
    - Breadcrumb: "Documents > Insurance"
    - View options: Grid/List toggle
    - Sort: "Date Added ▼"
    - Filter: Vehicle dropdown
    - "Generate PDF Report" button (prominent, electric blue)
  
  **Grid layout:** 3 columns of document cards
  
  **Card 1 (Insurance):**
  - Large thumbnail: Insurance card preview (partially blurred for privacy)
  - Document icon: 🛡️ in blue circle overlay
  - Title: "State Farm Auto Policy"
  - Status badge: "Expires in 127d" (green)
  - Metadata: "2019 Toyota RAV4 • Updated Feb 15"
  - Hover actions: View, Share, Delete icons
  
  **Card 2 (Insurance):**
  - Thumbnail: Different insurance document
  - Icon: 🛡️
  - Title: "Comprehensive Coverage Certificate"
  - Status badge: "Expires in 127d" (green)
  - Metadata: "2019 Toyota RAV4 • Added Jan 3"
  
  **Card 3 (Insurance):**
  - Thumbnail: Roadside assistance card
  - Icon: 🛡️
  - Title: "Roadside Assistance Membership"
  - Status badge: "Expires in 89d" (green)
  - Metadata: "All Vehicles • Added Dec 10"
  
  **Card 4 (Insurance):**
  - Thumbnail: Older insurance card
  - Icon: 🛡️
  - Title: "State Farm Policy (2024)"
  - Status: "Expired" (gray)
  - Metadata: "2019 Toyota RAV4 • Expired Jan 15"
  
  **Cards 5-9:** (partially visible, scrollable)
  - Mix of other document types shown in grid
  - Consistent card design

- **Bottom status bar:**
  - "4 documents selected • 2.1 MB"
  - Batch actions: "Export Selected" | "Delete"

**Visual Emphasis:**
- Professional file manager aesthetic (macOS/Windows inspiration)
- Large, clear thumbnails (but privacy-respecting)
- Expiry tracking prominent with color-coded badges
- Desktop-class organization
- Spatial browsing (sidebar + grid)
- Export capability highlighted
- Clean, modern document management

---

### Screenshot 6: "Complete Peace of Mind"
**Screen to Show:** Full garage dashboard with 4-6 vehicles + health summary + insights panel

**Headline Text:** "Complete Peace of Mind"
- **Position:** Bottom center, 140px from edge
- **Size:** 72px, Nunito Bold
- **Color:** #F1F5F9, "Peace of Mind" in #10B981 (Emerald Green)

**Subheadline:** "Unlimited vehicles. Powerful insights. Forever free."
- **Position:** Above headline, 20px gap
- **Size:** 36px, Nunito SemiBold
- **Color:** #94A3B8

**Background Treatment:**
- **Base:** #0A0E1A
- **Bottom:** Wide #10B981 gradient (8% opacity) for positive conclusion

**Screen Details:**
- **Top Stats Bar:** 4 summary cards (horizontal row)
  
  **Card 1:**
  - Icon: 🚗 collection icon
  - Value: "6 Vehicles"
  - Label: "In Your Garage"
  
  **Card 2:**
  - Icon: 💰 dollar icon
  - Value: "$4,521"
  - Label: "Total Spent (2024)"
  
  **Card 3:**
  - Icon: 📊 health icon
  - Value: "94%"
  - Label: "Avg Health Score"
  
  **Card 4:**
  - Icon: ✅ checkmark icon
  - Value: "All Current"
  - Label: "Maintenance Status"
  - Green glow effect

- **Main Content (70%):** Vehicle grid (2×3 layout)
  
  **Each vehicle card (larger, more detailed than iPhone):**
  
  **Card 1: 2019 Toyota RAV4**
  - Large make icon (Toyota T in red circle)
  - Vehicle photo/illustration at top (optional)
  - Name: "2019 Toyota RAV4"
  - Nickname: "Daily Driver" (gray text)
  - Health score dial: 100% (large, prominent, green)
  - Status row:
    - ✅ "All services up to date"
    - Next: "Oil change in 42 days"
  - Stats row:
    - 24,567 mi
    - Last service: 3 days ago
    - $567 (2024 costs)
  - Quick action buttons: "Log Service" | "View Details"
  
  **Card 2: 2021 Tesla Model 3**
  - Tesla icon (charcoal T)
  - Health: 98% (green)
  - Status: "All current"
  - Next: "Tire rotation in 28d"
  - 12,340 mi • 2 weeks ago • $234 (2024)
  
  **Card 3: 2015 Honda Accord**
  - Honda icon (blue H)
  - Health: 89% (light green)
  - Status: "1 service upcoming"
  - Next: "Air filter in 18d"
  - 87,234 mi • 1 month ago • $892 (2024)
  
  **Card 4: 2018 Ford F-150**
  - Ford icon (blue F)
  - Health: 95% (green)
  - Status: "All current"
  - Next: "Oil change in 35d"
  - 65,100 mi • 12 days ago • $1,245 (2024)
  
  **Card 5: 2020 Subaru Outback**
  - Subaru icon (blue stars)
  - Health: 92% (green)
  - Status: "All current"
  - Next: "Tire rotation in 21d"
  - 32,890 mi • 3 weeks ago • $478 (2024)
  
  **Card 6: 2016 BMW 3 Series**
  - BMW icon (black/white)
  - Health: 88% (yellow-green)
  - Status: "1 service due soon"
  - Next: "Brake fluid in 9d"
  - 78,450 mi • 6 days ago • $1,105 (2024)

- **Right Insights Panel (30%):**
  
  **Widget 1: Upcoming Maintenance**
  - Title: "Next 2 Weeks"
  - Calendar-style list:
    - Mar 13: Air filter • Accord
    - Mar 15: Brake fluid • BMW  
    - Mar 18: Tire rotation • Outback
  - All items with checkboxes (not checked)
  
  **Widget 2: Recent Activity**
  - Title: "Latest Services"
  - Timeline of last 3 services across fleet:
    - 3 days ago: Oil change • RAV4 • $52.99
    - 6 days ago: Inspection • BMW • $0
    - 12 days ago: Oil change • F-150 • $68.50
  
  **Widget 3: Cost Summary**
  - Title: "2024 Overview"
  - Bar showing total: $4,521
  - Breakdown:
    - F-150: $1,245 (27%)
    - BMW: $1,105 (24%)
    - Accord: $892 (20%)
    - RAV4: $567 (13%)
    - Outback: $478 (11%)
    - Tesla: $234 (5%)
  - Small note: "12% below average"

- **Bottom Area:**
  - "Add Another Vehicle" button (transparent with electric blue border)
  - Small text: "Track unlimited vehicles • Forever free • No account required"

**Visual Emphasis:**
- Professional fleet management
- Comprehensive overview in one screen
- All positive/healthy states visible
- Desktop-class information density
- Reassuring conclusion to the story
- Emphasis on scale (6 vehicles manageable)
- No urgency, calm and organized
- "Forever free" messaging prominent

---

## Design Production Guidelines

### File Format Requirements
- **Format:** PNG with no alpha transparency in final export (solid background)
- **Color Space:** sRGB (IEC61966-2.1)
- **Resolution:** Exact pixel dimensions (no upscaling/downscaling)
- **Compression:** Optimized PNG (use ImageOptim, TinyPNG, or similar)
- **Max File Size:** 5MB per screenshot (typical: 500KB-2MB)

### Text Rendering Best Practices
- **Anti-aliasing:** Full (smooth rendering)
- **Font Loading:** Use exact Nunito font files from Google Fonts
- **Subpixel Rendering:** Disabled (use pixel-aligned positions)
- **Kerning:** Optical kerning for headlines, metric for body text
- **Color Accuracy:** Use exact hex codes, no approximations

### Device Frames
- **DO NOT** include device frames/bezels (Apple adds these automatically in App Store)
- **DO** design edge-to-edge to exact canvas dimensions
- **Status Bar:** Include realistic iOS status bar
  - Time: 9:41 (Apple's standard)
  - Signal: Full bars
  - WiFi: Connected
  - Battery: 100% charged
  - Icons: White (#FFFFFF)
- **Home Indicator:** Include on iPhone models
  - Black bar at bottom
  - Centered
  - 134px wide × 5px tall
  - Positioned 8px from bottom edge

### Screenshot Mockup Tools

**Recommended Tools:**

1. **Figma** (Preferred)
   - Create frames with exact dimensions (e.g., 1290×2796)
   - Use Auto Layout for responsive adjustments
   - Export as PNG @1x (no scaling)
   - Advantages: Web-based, collaborative, version history
   - Template: Create master components for reuse

2. **Sketch**
   - Artboards at exact pixel dimensions
   - Export as PNG @1x  
   - Advantages: Native macOS, fast performance
   - Plugins: Rename It, Automate, Anima

3. **Adobe Photoshop**
   - Create documents at exact pixel dimensions (72 DPI)
   - Use Smart Objects for reusable UI elements
   - Save for Web (PNG-24)
   - Advantages: Advanced photo editing, precise control

4. **Adobe XD**
   - Artboards at exact dimensions
   - Export for screens (PNG @1x)
   - Advantages: Fast prototyping, simple export

### Workflow Recommendations

**Option A: Design in Figma**
1. Create master components (cards, buttons, text styles)
2. Build 6 frames (one per screenshot) at exact dimensions
3. Populate with real app content (not Lorem Ipsum)
4. Export each frame as PNG
5. Optimize with ImageOptim
6. Upload to App Store Connect

**Option B: Screenshot Real App + Enhance**
1. Screenshot actual app on device/simulator
2. Import into Figma/Photoshop
3. Add headline/subheadline overlays
4. Adjust colors/contrast if needed
5. Export and optimize
6. Upload

**Option C: Hybrid (Recommended for Speed)**
1. Screenshot real app for UI accuracy
2. Use Figma to add text overlays and background treatments
3. Ensures UI matches actual app while allowing marketing polish
4. Export and optimize
5. Upload

### Asset Organization
```
/screenshots/
  /source/
    /figma/
      glovebox-screenshots.fig
    /fonts/
      Nunito-Bold.ttf
      Nunito-SemiBold.ttf
      Nunito-Regular.ttf
      Nunito-Medium.ttf
  /iphone-6.7/
    01-never-miss-oil-change.png
    02-instant-manufacturer-schedules.png
    03-log-services-seconds.png
    04-track-every-dollar.png
    05-documents-one-place.png
    06-peace-of-mind.png
  /iphone-6.5/
    01-never-miss-oil-change.png
    02-instant-manufacturer-schedules.png
    03-log-services-seconds.png
    04-track-every-dollar.png
    05-documents-one-place.png
    06-peace-of-mind.png
  /ipad-12.9/
    01-never-miss-oil-change.png
    02-instant-manufacturer-schedules.png
    03-log-services-seconds.png
    04-track-every-dollar.png
    05-documents-one-place.png
    06-peace-of-mind.png
  /exports/
    [dated exports for version history]
```

---

## Quality Checklist

### Before Export
- [ ] All text readable at 100% zoom on target device size
- [ ] Color contrast passes WCAG AA (4.5:1 minimum for body text)
- [ ] Headlines don't exceed safe area bounds (respect notch/island)
- [ ] App UI reflects actual current version (1.1.0 features)
- [ ] No placeholder or Lorem Ipsum text anywhere
- [ ] Status bar shows realistic time (9:41), battery (100%), signal
- [ ] Dark theme colors consistent across all screenshots (#0A0E1A background)
- [ ] Electric Blue accent (#3B82F6) used consistently
- [ ] No watermarks, "DRAFT" labels, or external branding
- [ ] Typography uses exact Nunito font (not system fallback)
- [ ] Icons match actual app (@expo/vector-icons)
- [ ] Glassmorphism effects rendered correctly
- [ ] Health score dials use correct color gradient

### Technical Validation
- [ ] Exact pixel dimensions match requirements (1290×2796, 1284×2778, 2048×2732)
- [ ] File size under 5MB per screenshot (ideally 500KB-2MB)
- [ ] sRGB color profile embedded (not Adobe RGB or P3)
- [ ] PNG format (not JPEG)
- [ ] No transparency/alpha channel in background
- [ ] No compression artifacts or banding
- [ ] No pixelation or blurriness
- [ ] Consistent quality across all 6 screenshots per size

### Content Validation
- [ ] Screenshot 1-6 order tells coherent story
- [ ] Each screenshot can stand alone if viewed independently
- [ ] Value proposition clear in first 2 screenshots
- [ ] Features shown match app description claims
- [ ] No features shown that don't exist in v1.1.0
- [ ] "Pro" features labeled appropriately (with 🔒 or "Pro" badge)
- [ ] No personal data visible (use generic names, fake addresses)
- [ ] Cost amounts look realistic ($50-250 range for services)
- [ ] Dates are current/near current (March 2026)
- [ ] Mileage numbers look realistic (10K-90K range)

### App Store Readiness
- [ ] Left-to-right story flows logically (Problem → Solution → Result)
- [ ] Screenshots meet Apple's content guidelines (no violence, profanity, etc.)
- [ ] UI elements are tappable-sized (44px minimum) in actual app
- [ ] No misleading features or false advertising
- [ ] Screenshots represent actual user experience
- [ ] All text localization-ready (if planning other languages)
- [ ] Filenames match required format (01-name.png, 02-name.png, etc.)

---

## Localization Notes (Future)

When creating localized screenshot versions:

### Text Expansion Planning
- **German:** +30% text length (headlines may need smaller font)
- **Spanish:** +20% text length
- **French:** +15% text length
- **Korean/Japanese:** -10% text length (but may need larger font size)
- **Arabic/Hebrew:** Right-to-left (RTL) — mirror layouts entirely

### Cultural Adaptation
- **Currency:** $ → €, £, ¥, ₩ based on region
- **Units:** Miles → Kilometers for most markets (except US/UK)
- **Date Format:** MM/DD/YYYY → DD/MM/YYYY or YYYY-MM-DD
- **Vehicle Examples:** Use locally popular models
  - US: Toyota RAV4, Honda Civic, Ford F-150
  - Europe: VW Golf, BMW 3-series, Mercedes C-Class
  - Asia: Toyota Camry, Honda Accord, Hyundai Sonata
- **Color Meanings:** Green = safe/good universally, but red = danger in most cultures except some Asian contexts

### Screenshot Order Flexibility
- May vary by market based on what resonates
- Test with local beta users before finalizing
- Some markets prefer feature-first, others prefer benefit-first

---

## A/B Testing Strategy (Post-Launch)

### Variants to Test (Once We Have Traffic)

**Test 1: Headline Emotion**
- **A (Current):** "Never Miss an Oil Change" (fear of missing)
- **B:** "Stay On Top of Maintenance" (control)
- **C:** "Take Control of Car Care" (empowerment)
- **Metric:** Product page → Download conversion rate

**Test 2: Screenshot Order**
- **A (Current):** Problem → Solution → Feature → Feature → Feature → Success
- **B:** Solution → Feature → Feature → Feature → Feature → Success (skip problem)
- **C:** Success → Feature → Feature → Feature → Feature → Solution (lead with result)
- **Metric:** Which screenshots get most engagement (tap-through rates)

**Test 3: Feature Emphasis**
- **A (Current):** Balanced (schedules, logging, analytics, documents)
- **B:** Analytics-heavy (emphasize cost savings more)
- **C:** Simplicity-focused (emphasize ease of use, no account)
- **Metric:** Free → Pro conversion rate

**Test 4: Color Temperature**
- **A (Current):** Electric Blue (#3B82F6) accent
- **B:** Warmer Orange (#F59E0B) accent
- **C:** Cooler Cyan (#06B6D4) accent
- **Metric:** Brand recall and conversion rate

### Metrics to Track
- **Product page views** (how many people see the listing)
- **Install rate** (views → downloads %)
- **Screenshot engagement** (which screenshots users tap/zoom)
- **Keyword ranking changes** after screenshot updates
- **Review sentiment** mentioning features shown in screenshots

### Testing Cadence
- **Launch (v1.1.0):** Use current strategy
- **Month 1:** Gather baseline metrics
- **Month 2:** Test variant A vs B if conversion is below 30%
- **Month 3:** Iterate based on data
- **v1.2.0 Launch:** Refresh screenshots to show new features

---

## App Preview Video (Future Enhancement)

**15-20 second storyboard for v1.2.0:**

**0-3s:** Device unlocks, app icon visible, launches to garage
- Show app icon animation (if we add one)
- Quick launch showing no loading screen

**4-7s:** Quick add vehicle interaction
- Tap "+" button
- Type "2023 Honda" in search
- Autocomplete appears instantly
- Select vehicle
- Manufacturer schedule appears

**8-11s:** Swipe through tabs showing key features
- Swipe left: Timeline (service history with photos)
- Swipe left: Insights (beautiful cost chart)
- Swipe left: Documents (organized files)
- Swipe left: Learn (articles)

**12-15s:** Log service with photo attachment
- Tap "+" FAB
- Quick form fill (time-lapse style)
- Add photo from camera roll
- Tap "Save"
- Success animation

**16-18s:** Reveal analytics dashboard
- Insights tab
- Cost chart animates in
- Health scores update

**19-20s:** End card
- "Car Story — Smart Car Maintenance"
- "No Account Required • 100% Private"
- Download prompt

**Technical Specs:**
- **Portrait orientation** (device held vertically)
- **30 FPS minimum** (60 FPS preferred)
- **Duration:** 15-30 seconds (App Store requirement)
- **Format:** H.264 or HEVC, .mov or .mp4
- **Resolution:** Match screenshot dimensions (1290×2796 for iPhone)
- **Audio:** Optional (but no voiceover needed)
- **Subtitles:** Recommended for accessibility

---

## Design System: Component Library

### Reusable Screenshot Components

**1. Status Bar**
- Time: 9:41
- Signal: 4 bars (white)
- WiFi: Connected (white)
- Battery: 100% (white)
- Background: Transparent over #0A0E1A

**2. Navigation Bar**
- Height: 44px
- Background: Transparent
- Title: lowercase, #F1F5F9, Nunito SemiBold 18px
- Back button: Chevron left icon
- Close button: X icon

**3. Tab Bar**
- Height: 83px (includes safe area)
- Background: #111827 with slight blur
- Icons: @expo/vector-icons
- Active: #3B82F6
- Inactive: #64748B
- Labels: lowercase, Caption typography

**4. Glassmorphism Card**
- Background: rgba(17, 24, 39, 0.8)
- Border: 1px rgba(255, 255, 255, 0.06)
- Border radius: 20px
- Shadow: 0px 8px 20px rgba(0,0,0,0.15)
- Padding: 20px

**5. Health Score Dial**
- Size: 120px diameter
- Border width: 8px
- Colors:
  - 0-49%: #EF4444 → #F59E0B (red to amber gradient)
  - 50-79%: #F59E0B → #10B981 (amber to green gradient)
  - 80-100%: #10B981 (pure green)
- Center text: Bold percentage
- Background: #111827

**6. Primary Button**
- Background: #3B82F6
- Height: 48px
- Border radius: 16px
- Text: #F1F5F9, Nunito SemiBold 16px
- Shadow: 0px 4px 8px rgba(59, 130, 246, 0.3)

**7. Status Badge**
- Padding: 6px 12px
- Border radius: 12px
- Border: 1px
- Typography: Caption (13px)
- Colors:
  - Success: Background #10B98120, Border #10B98140, Text #10B981
  - Warning: Background #F59E0B20, Border #F59E0B40, Text #F59E0B
  - Danger: Background #EF444420, Border #EF444440, Text #EF4444

---

## Final Pre-Export Checklist

### Screenshot Content
- [ ] All 6 iPhone 6.7" screenshots complete
- [ ] All 6 iPhone 6.5" screenshots complete (adjusted dimensions)
- [ ] All 6 iPad 12.9" screenshots complete (redesigned layouts)
- [ ] Story flows logically from screenshot 1 → 6
- [ ] All headlines spelled correctly and within character limits
- [ ] All subheadlines spelled correctly and within character limits
- [ ] No typos in any on-screen UI text
- [ ] Vehicle names/models are real and accurate (not made up)
- [ ] Cost amounts look realistic for actual services
- [ ] Dates are current (March 2026) and consistent

### Technical Quality
- [ ] All files exported at exact required dimensions
- [ ] All files under 5MB (optimized)
- [ ] All files in PNG format (not JPEG)
- [ ] All files in sRGB color space
- [ ] All files have solid background (no alpha transparency)
- [ ] All text is crisp and readable (no blur)
- [ ] All colors match theme.js specifications exactly
- [ ] All fonts are Nunito (no system font fallbacks)
- [ ] Status bars are consistent (9:41, full battery)
- [ ] No compression artifacts or banding

### Brand Consistency
- [ ] Electric Blue (#3B82F6) used for all accents
- [ ] Background is Deep Space (#0A0E1A) on all screenshots
- [ ] Glassmorphism cards use correct rgba values
- [ ] Typography hierarchy consistent (Hero/H1/H2/Body/Caption)
- [ ] Health score dials use correct color gradients
- [ ] All icons are from @expo/vector-icons (or emoji)
- [ ] Dark theme aesthetic maintained throughout
- [ ] No off-brand colors introduced

### App Store Compliance
- [ ] No device bezels/frames (Apple adds these)
- [ ] No false advertising (all features exist in v1.1.0)
- [ ] No personal data visible (use fake/generic data)
- [ ] No watermarks or "DRAFT" labels
- [ ] No copyrighted content (all original)
- [ ] Screenshots represent actual user experience
- [ ] No misleading claims or exaggerations

---

## Delivery Instructions

### File Naming Convention
```
iphone-6.7/
  01-never-miss-oil-change.png
  02-instant-manufacturer-schedules.png
  03-log-services-seconds.png
  04-track-every-dollar.png
  05-documents-one-place.png
  06-peace-of-mind.png

iphone-6.5/
  [same naming]

ipad-12.9/
  [same naming]
```

### Upload to App Store Connect
1. Log in to App Store Connect
2. Select Car Story app
3. Go to version 1.1.0 (or current version)
4. Scroll to "App Previews and Screenshots"
5. For each device size:
   - Upload 6 screenshots in order
   - Drag to reorder if needed
   - Preview how they look in the carousel
6. Save changes
7. Preview on actual device before submitting

### Backup & Version Control
- [ ] Source Figma/Sketch/PSD files saved to /source/
- [ ] Exported PNGs saved with version number
- [ ] Copy uploaded to App Store backed up locally
- [ ] Git commit with message: "v1.1.0 App Store screenshots"

---

## Success Metrics for Screenshots

### App Store Analytics (Monitor These)
- **Product Page Views:** How many people see the listing
- **Install Rate:** Views → Downloads conversion (target: 35%+)
- **Screenshot Engagement:**
  - How many users swipe through screenshots
  - Which screenshots are viewed most
  - Average number of screenshots viewed (target: 3-4 of 6)
- **Downloads vs Impressions:** Organic search → Download rate

### Iteration Triggers
**If conversion < 30%:**
- A/B test different headline emotions
- Try different screenshot order
- Emphasize different features

**If screenshot 5-6 not viewed:**
- Reconsider last 2 screenshots
- May be losing users' attention too early
- Front-load more compelling content

**If reviews mention "misleading":**
- Screenshots may overpromise
- Ensure UI shown matches actual app exactly

---

*Last Updated: March 4, 2026*  
*Version: 1.1.0 Screenshot Specifications*  
*Design System: Car Story Automotive-Tech Brand Language*  
*Ready for production!*
