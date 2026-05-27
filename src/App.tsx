import { useState } from "react";
import { ActiveTrip } from "./components/ActiveTrip";
import { TripHistory } from "./components/TripHistory";
import { MaintenanceLog } from "./components/MaintenanceLog";
import type { TabView } from "./types";

/**
 * MileVox — Voice-Activated Mileage & Maintenance Tracker
 *
 * Main app component with tab navigation:
 * 1. Active Trip — start/stop trips with voice, live GPS tracking
 * 2. Trip History — view all completed trips
 * 3. Maintenance Log — log maintenance & expenses via voice or form
 */
function App() {
  const [activeTab, setActiveTab] = useState<TabView>("active");

  /** Tab configuration */
  const tabs: { id: TabView; label: string; icon: string }[] = [
    { id: "active", label: "Active Trip", icon: "🚗" },
    { id: "history", label: "Trip History", icon: "📋" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* App logo */}
            <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-lg font-bold text-white">
              MV
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                MileVox
              </h1>
              <p className="text-[10px] text-gray-500 leading-tight">
                Voice-Activated Tracker
              </p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="max-w-lg mx-auto px-4">
          <div className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                  }
                `}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === "active" && <ActiveTrip />}
        {activeTab === "history" && <TripHistory />}
        {activeTab === "maintenance" && <MaintenanceLog />}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 py-4 text-center text-[10px] text-gray-700">
        MileVox — All data stored locally in your browser. Nothing is sent to any server.
      </footer>
    </div>
  );
}

export default App;
