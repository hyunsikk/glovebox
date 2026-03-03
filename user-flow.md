# AutoLog User Flow Design

## Dual-Persona Core Experience: Adaptive Depth

**Philosophy:** 3 screens for essential functions, progressive depth for enthusiasts. The interface should intelligently adapt to user behavior - simple for everyday drivers, detailed for car lovers.

**Best-in-Class Journey Principle:** Every touchpoint must feel premium and effortless, respecting both the casual user's time and the enthusiast's passion.

---

## Screen 1: Vehicle Entry (0-15 seconds)

### **Purpose:** Instant car recognition with zero setup friction

### **Layout:**
```
┌─────────────────────────────────────┐
│                🚗                  │
│           What car do you drive?    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔍  2023 Toyota RAV4...        ││  ← Auto-complete search
│  └─────────────────────────────────┘│
│                                     │
│  ✨ Popular models:                │
│  🔘 2023 Toyota RAV4               │
│  🔘 2022 Honda CR-V                │  
│  🔘 2024 Tesla Model Y              │
│  🔘 2021 Ford F-150                 │
│                                     │
│  📸 Scan VIN                       │
│  ⌨️ Enter manually                  │
└─────────────────────────────────────┘
```

### **Key Interactions:**
- **Type-ahead search:** Instant results as user types
- **Popular shortcuts:** Most common cars for quick access
- **VIN scanning:** Advanced option for perfect accuracy  
- **Manual entry:** Year/Make/Model dropdowns for edge cases

### **Success Criteria:**
- User finds their car in <15 seconds
- No confusion about which option to choose
- 90%+ of users use search or popular models (not manual)

---

## Screen 2: Maintenance Dashboard (15-45 seconds)

### **Purpose:** Immediate value delivery - show their specific car's maintenance needs

### **Layout:**
```
┌─────────────────────────────────────┐
│ ← 2023 Toyota RAV4              ⚙️ │
│                                     │
│ 🛢️ Next Service Due               │
│ Oil Change + Multi-Point Inspection │
│ Every 10,000 miles or 12 months     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 When was your last oil change? │ │
│ │                                   │ │
│ │ [    Select Date    ]            │ │
│ │                                   │ │
│ │ 🤷‍♂️ Not sure? We can estimate     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📋 Full Schedule ▼                 │
│ • Tire Rotation (20K miles)         │
│ • Cabin Air Filter (30K miles)      │
│ • Brake Inspection (40K miles)      │
│ • Coolant Flush (60K miles)         │
│                                     │
│ 💡 Based on Toyota's factory specs  │
└─────────────────────────────────────┘
```

### **Key Interactions:**
- **Date picker:** Quick last-service entry
- **Smart estimation:** Algorithm calculates based on car age/mileage if unknown
- **Expandable schedule:** Full manufacturer timeline accessible but not overwhelming
- **Manufacturer attribution:** Builds trust with source citation

### **Success Criteria:**  
- User immediately sees their car's specific maintenance data
- Clear next action (enter last service date)
- Understands this is real manufacturer data, not generic advice

---

## Screen 3A: Everyday Driver Timeline (45-60 seconds)

### **Purpose:** Transform into ongoing maintenance tool with intelligence

### **Layout:**
```
┌─────────────────────────────────────┐
│ ← 2023 Toyota RAV4              +  │
│                                     │
│ 🛢️ Oil Change                      │
│ 📅 Due March 15 (2 weeks)          │
│ 💰 $45-65 expected                  │
│ 🔔 Remind me 1 week before ✓       │
│ [        Find Service Centers       ] │
│                                     │
│ 📅 Upcoming Maintenance             │
│ ┌─────────────────────────────────┐ │
│ │ 🔄 Tire Rotation                │ │
│ │ Due: May 2024 (~$35)            │ │
│ │                                 │ │
│ │ 🌬️ Cabin Filter                 │ │
│ │ Due: August 2024 (~$25)         │ │
│ │                                 │ │
│ │ 🚗 40K Service                   │ │
│ │ Due: December 2024 (~$350)      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 👥 Add another vehicle              │
│ 📊 View cost history                │
└─────────────────────────────────────┘
```

### **Key Interactions:**
- **Reminder toggle:** Smart notifications (default ON)
- **Service finder:** Integrated local service center discovery
- **Timeline view:** Scroll to see months ahead
- **Multi-vehicle:** Gateway to premium feature
- **Cost tracking:** Path to analytics and insights

### **Success Criteria:**
- User sets up their first reminder
- Clear understanding of upcoming costs and timing
- Obvious path to expand usage (multiple cars, cost tracking)

---

## Screen 3B: Enthusiast Garage Dashboard (45-60 seconds)

### **Purpose:** Showcase vehicle collection with deep analytics and modification tracking

### **Layout:**
```
┌─────────────────────────────────────┐
│ 🏠 My Garage                    📊  │
│                                     │
│ 📈 Portfolio Health: 94%           │
│ 💰 Total Value: $127,500           │
│ 🔧 Active Projects: 2              │
│                                     │
│ 🚗 2023 BMW M3 Competition          │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️  Track pads due soon          │ │
│ │ 💰  $2.45/mile last month       │ │
│ │ 🏁  3 track days logged          │ │
│ │ 🔧  Cold air intake installed    │ │ 
│ └─────────────────────────────────┘ │
│                                     │
│ 🚙 1997 Honda Civic (Project)       │
│ ┌─────────────────────────────────┐ │
│ │ 🔧  Engine build in progress     │ │
│ │ 💰  $8,500 invested so far       │ │
│ │ 📊  Cost vs similar builds       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ + Add Vehicle  📈 Analytics         │
└─────────────────────────────────────┘
```

### **Key Interactions:**
- **Portfolio Overview:** Health scores and financial overview across all vehicles
- **Vehicle Cards:** Rich information including modifications and performance data
- **Project Tracking:** In-progress builds with cost analysis
- **Community Comparison:** Benchmarking against similar enthusiast setups

### **Enthusiast Success Criteria:**
- User immediately sees their collection as a managed portfolio
- Advanced metrics (cost-per-mile, project progress) are prominent
- Clear path to dive deeper into analytics and community features
- Modification tracking feels natural and valuable

---

## Alternative Flow: Returning User (3 seconds)

### **Layout:**
```
┌─────────────────────────────────────┐
│                                  ⚙️ │
│ 🚗 2023 Toyota RAV4                │
│                                     │
│ 🛢️ Oil Change                      │
│ ⏰ Due in 5 days                    │
│ [       Mark Complete       ]       │
│                                     │
│ 📋 All Vehicles                     │
│ 🚗 2023 Toyota RAV4 (due soon)     │
│ 🚙 2019 Honda Pilot (good)          │
│                                     │
│ 📊 This Month                       │
│ • Oil change completed (RAV4)       │
│ • $52 - Quick Lube Station          │
│                                     │
│ 📈 Cost Insights                    │
│ You're saving $120/year vs dealer   │
└─────────────────────────────────────┘
```

**Goal:** Instant status check for existing users

---

## Flow States & Error Handling

### **Empty State (New User):**
- Screen 1: Vehicle entry with popular models highlighted
- No "empty dashboard" - immediate manufacturer data once car selected

### **Offline State:**  
- Core manufacturer schedules work offline (static data)
- Service center finder gracefully degrades
- Cost estimates use cached local data

### **Error States:**
- Car not found: "Can't find your specific trim? Try [Year] [Make] [Model]"
- No service history: "No worries - we'll estimate based on your car's age"
- API failure: Core experience continues with static data

---

## Navigation Philosophy

### **Depth Limits:**
- **Level 1:** Main dashboard (where users live)
- **Level 2:** Detail views (specific maintenance item, settings)  
- **Level 3:** Maximum depth (cost history, service center details)

### **Back Button Behavior:**
- Always present and functional
- Preserves context (don't lose entered data)
- Never traps user in flow

### **Bottom Navigation:**
```
🏠 Dashboard  |  🚗 Vehicles  |  📊 Insights  |  ⚙️ Settings
```
- **Dashboard:** Main timeline view
- **Vehicles:** Multi-car management (premium feature)
- **Insights:** Cost analytics and predictions (premium)
- **Settings:** Notifications, account, export

---

## Success Metrics by Screen

### **Screen 1 (Vehicle Entry):**
- 90%+ completion rate
- <15 second average completion time
- <5% use manual entry (autocomplete working)

### **Screen 2 (Dashboard):**  
- 80%+ enter last service date
- <30 seconds viewing manufacturer schedule
- High engagement with "remind me" toggle

### **Screen 3 (Timeline):**
- 70%+ enable first notification
- 40%+ explore upcoming maintenance  
- 20%+ consider adding second vehicle

---

## Premium Upgrade Triggers

### **Natural Upgrade Moments:**
1. **Adding second vehicle** (multi-car management)
2. **Viewing cost predictions** (advanced analytics)
3. **Exporting service records** (resale documentation)
4. **Advanced notifications** (mileage-based reminders)

### **Upgrade Call-to-Actions:**
- Never block core experience
- Present value proposition at natural moments
- "Upgrade to track unlimited vehicles" vs generic "Go premium"

---

## Mobile-First Constraints

### **Thumb-Friendly Design:**
- Primary actions in thumb reach zone (bottom 60% of screen)
- Tap targets minimum 44px
- Swipe gestures for secondary actions

### **One-Hand Operation:**
- Core flow completable with thumb only
- No precision interactions required
- Forgiving touch zones

### **Performance Requirements:**
- <100ms response to typing
- Smooth 60fps animations throughout
- Works well on older devices (iPhone XR minimum)