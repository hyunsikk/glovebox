# AutoLog - Smart Car Maintenance Tracker

AutoLog is a React Native app built with Expo that transforms car maintenance from guesswork into intelligent planning. Get instant access to manufacturer maintenance schedules, smart cost predictions, and proactive service reminders.

## 🚗 Features

### Core Screens (4 tabs):
1. **Garage** — Vehicle cards showing next upcoming service, vehicle health score, mileage
2. **Timeline** — Chronological service history across all vehicles with + button to log new service
3. **Insights** — Analytics dashboard with cost tracking, health scores, and predictions
4. **Learn** — Knowledge base about car maintenance

### Key Capabilities:
- **Manufacturer Database** — Pre-loaded maintenance schedules for 30+ popular vehicles
- **Smart Analytics** — Vehicle health scores, cost per mile, spending trends
- **Cost Predictions** — 12-month maintenance forecasts with estimated costs
- **Vehicle Search** — Autocomplete search with instant manufacturer schedule loading
- **Service Logging** — Quick entry for service type, date, mileage, cost, notes
- **Web Compatible** — Full responsive web version

## 🛠 Technical Stack

- **Framework:** Expo SDK 55 with React Native 0.83
- **Navigation:** expo-router with tabs layout
- **Font:** Nunito family via @expo-google-fonts/nunito
- **Icons:** @expo/vector-icons (Ionicons, MaterialCommunityIcons)
- **Animations:** react-native-reanimated with spring physics
- **Haptics:** expo-haptics for tactile feedback
- **Storage:** AsyncStorage for local data persistence
- **Styling:** Dark mode with Midnight Navy theme

## 🎨 Design System

### Colors
- **Midnight Navy** (#0D1B2A) - Primary background
- **Pearl White** (#F8FAFC) - Primary text
- **Charcoal Gray** (#2D3748) - Card backgrounds
- **Amber Alert** (#FF8C42) - Due maintenance
- **Forest Green** (#1A4B3A) - Success states
- **Steel Blue** (#4A6FA5) - Interactive elements

### Typography
- **Display:** Nunito Bold 32px - Large headers
- **H1:** Nunito Bold 24px - Section headers  
- **H2:** Nunito SemiBold 18px - Card titles
- **Body:** Nunito Regular 16px - Main content
- **Caption:** Nunito Medium 14px - Secondary info

## 📱 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Clone and navigate to project
cd autolog-app

# Install dependencies
npm install

# Start development server
npx expo start

# For web development
npx expo start --web
```

### Demo Data
The app includes a "Load Sample Data" button in the empty state that populates the app with:
- 2 sample vehicles (Toyota RAV4, Honda Civic)
- Multiple service records
- Realistic maintenance history

## 🌐 Web Export

The app is fully web-compatible and can be exported for web deployment:

```bash
# Export for web
npx expo export --platform web

# Serve locally
cd dist && python3 -m http.server 8080
```

Visit `http://localhost:8080` to see the web version.

## 📊 Manufacturer Database

The app includes a comprehensive database (`content/v1/vehicles.json`) with real maintenance schedules for:

- **Toyota:** Camry, RAV4, Corolla, Highlander, Tacoma
- **Honda:** Civic, Accord, CR-V, Pilot  
- **Ford:** F-150, Escape, Explorer, Mustang
- **Chevrolet:** Silverado, Equinox, Malibu
- **BMW:** 3 Series, 5 Series, X3, X5
- **Tesla:** Model 3, Model Y, Model S
- **Subaru:** Outback, Forester, Crosstrek
- **Nissan:** Altima, Rogue

Each vehicle includes:
- Service intervals (mileage and time-based)
- Estimated costs ranges
- Service categories (engine, brakes, tires, etc.)
- Manufacturer source attribution

## 🧮 Analytics Engine

The analytics system (`lib/analytics.js`) provides:

### Vehicle Health Score
- Percentage of recommended maintenance completed on time
- Based on manufacturer schedules and service history
- Color-coded indicators (90%+ green, 70-89% amber, <70% red)

### Cost Analytics
- Cost per mile calculations
- Monthly spending trends (rolling 12 months)
- 12-month cost predictions based on maintenance schedule
- Comparison to average costs by make/model

### Service Due Calculations
- Next due service with days until due
- Overdue service detection
- Upcoming services forecast (next 90 days)

## 💾 Data Storage

All data is stored locally using AsyncStorage:
- **Vehicles:** Make, model, year, mileage, maintenance history
- **Services:** Date, type, cost, vendor, notes, photos
- **Settings:** Notifications, units, preferences

## 🚀 Architecture

### Theme System (`theme.js`)
- Centralized color palette
- Typography styles (NO raw fontSize/fontFamily in components)
- Shared component styles
- Consistent spacing system

### Storage Layer (`lib/storage.js`)
- CRUD operations for vehicles and services
- Data export/import functionality
- Storage utility functions

### Analytics Layer (`lib/analytics.js`)
- Health score calculations
- Cost tracking and predictions
- Service due date calculations
- Fleet analytics for multiple vehicles

## 🎯 Key Design Principles

1. **Typography Consistency** - All text uses Typography.styles, no raw fontSize
2. **Dark Mode First** - Midnight Navy theme with automotive dashboard feel
3. **Spring Animations** - React Native Reanimated with spring physics (scale 0.96 on press)
4. **Haptic Feedback** - Meaningful haptics on important actions
5. **Automotive Voice** - Car-savvy friend tone, never chatbot language
6. **Instant Value** - No empty states, immediate manufacturer data access

## 📈 Current Status

✅ **Completed:**
- All 4 tab screens (Garage, Timeline, Insights, Learn)
- Manufacturer maintenance database (30+ vehicles)
- Analytics engine with health scores and cost tracking
- Web-compatible export
- Local data storage with AsyncStorage
- Theme system with consistent styling
- Sample data loading for demos

🚧 **Next Steps:**
- Vehicle add flow with autocomplete search
- Service logging form with photo upload
- Push notifications for due maintenance
- Data export (PDF reports, CSV)
- VIN scanning capability

## 📱 Platform Support

- **iOS:** Native app via Expo
- **Android:** Native app via Expo  
- **Web:** Responsive web version (Chrome, Safari, Firefox, Edge)
- **Desktop:** PWA capabilities for offline use

## 🤝 Contributing

This is a demo project built for TeamAM. The codebase demonstrates:
- Modern React Native development with Expo
- Comprehensive design system implementation
- Real-world data modeling for automotive maintenance
- Analytics and prediction algorithms
- Web-first development approach

---

**Built with ❤️ for car enthusiasts and everyday drivers.**