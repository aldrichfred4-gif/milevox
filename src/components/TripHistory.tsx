import { useEffect, useState } from "react";
import { formatDuration, getTrips } from "../storage";
import type { Trip } from "../types";

/**
 * Trip History view — shows all completed trips in a sortable table.
 */
export function TripHistory() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [sortField, setSortField] = useState<"date" | "distance" | "duration">(
    "date"
  );
  const [sortAsc, setSortAsc] = useState(false);

  // Load trips on mount and when window is focused (for cross-tab updates)
  const loadTrips = () => {
    setTrips(getTrips().reverse()); // newest first
  };

  useEffect(() => {
    loadTrips();
    // Refresh when localStorage changes (user might have completed a trip)
    const handleStorage = () => loadTrips();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Manual refresh every 5 seconds while the tab is active
  useEffect(() => {
    const interval = setInterval(loadTrips, 5000);
    return () => clearInterval(interval);
  }, []);

  /** Sort trips by the selected field */
  const sortedTrips = [...trips].sort((a, b) => {
    let cmp = 0;
    if (sortField === "date") {
      cmp = a.startTime.localeCompare(b.startTime);
    } else if (sortField === "distance") {
      cmp = a.distanceMiles - b.distanceMiles;
    } else if (sortField === "duration") {
      cmp = a.durationSeconds - b.durationSeconds;
    }
    return sortAsc ? cmp : -cmp;
  });

  /** Toggle sort direction or change field */
  const handleSort = (field: "date" | "distance" | "duration") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  /** Format the start date nicely */
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-16 h-16 mx-auto text-gray-700 mb-4"
        >
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
        <p className="text-gray-400">No trips recorded yet</p>
        <p className="text-xs text-gray-600 mt-1">
          Go to the Active Trip tab and start tracking!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200">
          Trip History ({trips.length})
        </h3>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => handleSort("date")}
            className={`px-2 py-1 rounded ${
              sortField === "date"
                ? "bg-emerald-800 text-emerald-300"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Date {sortField === "date" && (sortAsc ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("distance")}
            className={`px-2 py-1 rounded ${
              sortField === "distance"
                ? "bg-emerald-800 text-emerald-300"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Miles {sortField === "distance" && (sortAsc ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("duration")}
            className={`px-2 py-1 rounded ${
              sortField === "duration"
                ? "bg-emerald-800 text-emerald-300"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Duration {sortField === "duration" && (sortAsc ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {/* Trip table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-2 font-medium">Date</th>
              <th className="text-left py-3 px-2 font-medium">Time</th>
              <th className="text-right py-3 px-2 font-medium">Miles</th>
              <th className="text-right py-3 px-2 font-medium">Duration</th>
              <th className="text-right py-3 px-2 font-medium">Route</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrips.map((trip) => (
              <tr
                key={trip.id}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3 px-2 text-gray-300 whitespace-nowrap">
                  {formatDate(trip.startTime)}
                </td>
                <td className="py-3 px-2 text-gray-400 whitespace-nowrap">
                  {formatTime(trip.startTime)}
                </td>
                <td className="py-3 px-2 text-right text-white font-mono">
                  {trip.distanceMiles.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right text-gray-300 font-mono">
                  {formatDuration(trip.durationSeconds)}
                </td>
                <td className="py-3 px-2 text-right text-gray-500 text-xs">
                  {trip.endLat !== 0 && trip.endLng !== 0
                    ? `${trip.startLat.toFixed(4)}, ${trip.startLng.toFixed(4)} → ${trip.endLat.toFixed(4)}, ${trip.endLng.toFixed(4)}`
                    : "Incomplete"}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer with totals */}
          <tfoot>
            <tr className="border-t border-gray-700 text-sm font-semibold">
              <td className="py-3 px-2 text-gray-400" colSpan={2}>
                Total
              </td>
              <td className="py-3 px-2 text-right text-emerald-400 font-mono">
                {trips
                  .reduce((sum, t) => sum + t.distanceMiles, 0)
                  .toFixed(2)}
              </td>
              <td className="py-3 px-2 text-right text-emerald-400 font-mono">
                {formatDuration(
                  trips.reduce((sum, t) => sum + t.durationSeconds, 0)
                )}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}