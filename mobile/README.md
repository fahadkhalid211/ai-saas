# Crescelo Android Mobile App

The official Android mobile companion app for **Crescelo AI**, built with **React Native (Expo)** and styled with the Crescelo luxury branding (Deep Obsidian `#08251a`, Electric Lime `#abff44`, and Warm Cream `#fffeeb`).

It provides real-time appointment management, lead notifications, customer communication tools, and live sync with your Crescelo web dashboard and user account.

---

## 🌟 Key Features

1. **Brand Geometry & Animated Logo**:
   - Faithful mobile rendition of the Crescelo animated "C" mark (`src/components/CresceloMark.tsx`), featuring the breathing seed and smooth pulse.
   - Deep Obsidian dark theme and Electric Lime accents matching the web application.

2. **Full Appointments Management**:
   - Real-time scheduled bookings list synced with `/api/appointments`.
   - Metrics summary: **Total**, **Upcoming**, **Today**, and **Completed** bookings.
   - Quick filters: **All**, **Upcoming**, **Today**, **Completed**, and **Cancelled**.
   - Instant search by client name, email, phone, or service.
   - Detailed sheet modal:
     - Date, time slot, duration, customer notes, cancellation reason.
     - **1-Tap Direct Call** (`tel:...`) and **1-Tap Email** (`mailto:...`).
     - Live status updater: Confirm, Mark Done, or Cancel with reason.

3. **Real-Time Notification Feed**:
   - Instant alerts for new appointment bookings, cancellations, lead captures, and takeover requests (`/api/notifications`).
   - Unread badges and glowing indicators.
   - Filter by **All**, **Unread**, **Bookings**, or **Leads**.
   - Mark individual or all notifications as read.
   - Bottom tab bar notification counter badge with periodic background polling.

4. **Multi-Bot & Workspace Sync**:
   - Easily switch between different AI assistants in your workspace from Settings.
   - View your subscription plan status, user role, and connected cloud endpoint.

5. **Flexible Backend Connectivity**:
   - Connects to local development (Android emulator at `http://10.0.2.2:3000` or local Wi-Fi IP for physical phones).
   - Connects to production cloud (`https://crescelo.com`).
   - In-app endpoint configuration switcher.

---

## 🚀 Quick Start (Testing on Android)

### 1. Install Dependencies
Inside the `mobile/` directory:
```bash
cd mobile
npm install
```

### 2. Start the Expo Dev Server
```bash
npx expo start
```

### 3. Open on Android Device
- **Physical Android Phone**:
  1. Install the free **Expo Go** app from the Google Play Store.
  2. Open Expo Go and scan the QR code displayed in your terminal.
  3. *Tip for local dev*: Ensure your phone is connected to the same Wi-Fi network as your computer, and in the app login screen set the Server URL to `http://<YOUR_PC_LOCAL_IP>:3000`.
- **Android Emulator**:
  - Press `a` in the terminal to launch on the connected Android emulator (uses `http://10.0.2.2:3000`).

---

## 📦 Building Standalone Android APK

To generate a standalone APK that can be installed on any Android phone without Expo Go:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to Expo**:
   ```bash
   eas login
   ```
3. **Configure Project**:
   ```bash
   eas build:configure
   ```
4. **Build APK for Testing**:
   ```bash
   eas build --platform android --profile preview
   ```
   EAS will build the APK in the cloud and provide a direct download link / QR code to install on any Android phone.

---

## 📂 Architecture

```
mobile/
├── App.tsx                     # Navigation container, bottom tabs, auth gate
├── app.json                    # Android package (com.crescelo.app), theme, icons
├── package.json                # React Native & Expo dependencies
├── tsconfig.json               # TypeScript configuration
├── assets/                     # Brand icons, adaptive icons, and splash screens
└── src/
    ├── components/
    │   └── CresceloMark.tsx    # Animated SVG Crescelo C-arc & breathing seed
    ├── context/
    │   └── AuthContext.tsx     # Session management, token persistence, active bot
    ├── screens/
    │   ├── LoginScreen.tsx     # Sign in with email/password & server URL toggle
    │   ├── AppointmentsScreen.tsx # Bookings list, metrics, search, call/email actions
    │   ├── NotificationsScreen.tsx # Alerts feed, unread indicators, mark-as-read
    │   └── SettingsScreen.tsx  # User info, assistant switcher, push preferences
    ├── services/
    │   └── api.ts              # Crescelo REST API client with Bearer auth
    ├── theme/
    │   └── colors.ts           # Crescelo brand tokens (Obsidian, Lime, Cream)
    └── types/
        └── index.ts            # Data models matching backend DatabaseState
```
