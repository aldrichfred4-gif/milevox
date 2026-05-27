# 🚗 MileVox — Voice-Activated Mileage & Maintenance Tracker

> Talk to your car logbook. Track trips, expenses, and maintenance — hands-free.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

MileVox is a single-page web app that uses voice commands to track vehicle mileage, trip duration, and expenses. Perfect for rideshare drivers, delivery drivers, sales reps, field service techs — anyone who needs to log trips and vehicle costs without typing.

---

## ✨ Features

### 🎤 Voice Commands (Web Speech API)
Tap the mic and speak naturally:

| Command | Example | Action |
|---|---|---|
| `"start trip"` / `"begin trip"` | "start trip" | Begins a new trip, starts GPS tracking & timer |
| `"end trip"` / `"stop trip"` | "end trip" | Stops tracking, saves distance & duration |
| `"new <service> $<cost>"` | "new oil change $65" | Logs a maintenance entry |
| `"bought <item> $<cost>"` | "bought tires $600" | Logs a parts purchase |

### 📍 GPS Trip Tracking
- Grabs your current location when a trip starts
- Tracks position changes in real time
- Calculates distance using the **Haversine formula** (accurate to ~10m)
- Shows live distance (miles) and elapsed time (h/m/s)

### 📋 Trip History
- Sortable table of all completed trips (by date, distance, or duration)
- Shows start time, miles driven, duration, and route coordinates
- Footer with total miles and total driving time

### 🔧 Maintenance & Expense Log
- Log maintenance (oil changes, repairs, service) and parts purchases
- Voice or manual form entry
- Summary cards: total spent, maintenance total, parts total
- Delete individual records

### 💾 All Data Stored Locally
- Uses **localStorage** — nothing sent to any server
- Privacy-first: your data stays in your browser

---

## 🖥️ App Preview

```
┌──────────────────────────────────────┐
│  🚗 MileVox                          │
│  ┌──────┬──────┬────────┐            │
│  │ Trip │History│Maint.  │  ← tabs   │
│  └──────┴──────┴────────┘            │
│                                      │
│          🎤 [Tap to Speak]           │
│                                      │
│   ┌───────────┐  ┌───────────┐      │
│   │   0.00    │  │  0m 0s    │      │
│   │   Miles   │  │ Duration  │      │
│   └───────────┘  └───────────┘      │
│                                      │
│   [🚗 Start Trip Manually]          │
│                                      │
│   📍 GPS standby                     │
└──────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **[Vite](https://vite.dev/)** | Build tool & dev server |
| **[React 19](https://react.dev/)** | UI framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Type safety |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Utility-first styling |
| **Web Speech API** | Voice recognition |
| **Geolocation API** | GPS position tracking |
| **localStorage** | Client-side persistence |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm

### One-line start
```bash
npx degit your-username/milevox milevox
cd milevox
npm install
npm run dev -- --host
```

### Manual setup
```bash
# 1. Clone or download the project
git clone <repo-url> milevox
cd milevox

# 2. Install dependencies
npm install

# 3. Start dev server (with HMR)
npm run dev -- --host

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview -- --host
```

### Quick start script
```bash
chmod +x start.sh
./start.sh
```

Open http://localhost:5173 in Chrome or Edge (for best SpeechRecognition support).

---

## 📦 Project Structure

```
milevox/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ActiveTrip.tsx      # Trip tracking view
│   │   ├── MaintenanceLog.tsx  # Maintenance/expense log
│   │   ├── MicButton.tsx       # Animated mic button
│   │   └── TripHistory.tsx     # Trip history table
│   ├── hooks/
│   │   ├── useGeolocation.ts   # GPS tracking hook
│   │   └── useSpeechRecognition.ts  # Voice recognition hook
│   ├── App.tsx                 # Main app with tab nav
│   ├── index.css               # Tailwind import
│   ├── main.tsx                # React entry point
│   ├── speech.d.ts             # SpeechRecognition type declarations
│   ├── storage.ts              # localStorage CRUD + helpers
│   └── types.ts                # TypeScript type definitions
├── index.html
├── vite.config.ts
├── start.sh
├── LICENSE
└── package.json
```

---

## 🌐 Browser Support

| Browser | Speech Recognition | Geolocation |
|---|---|---|
| Chrome / Edge | ✅ Full support | ✅ Full support |
| Firefox | ❌ Not supported | ✅ Full support |
| Safari | ⚠️ Limited (iOS) | ✅ Full support |

For the best experience, use **Chrome** or **Edge**.

---

## 📄 License

[MIT](LICENSE) — free for personal and commercial use.

---

## 🙌 Contributing

Pull requests, issues, and feature requests are welcome! This is an open-source project built for the driver community.