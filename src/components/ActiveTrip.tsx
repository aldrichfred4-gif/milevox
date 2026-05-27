import { useCallback, useEffect, useRef, useState } from "react";
import { MicButton } from "./MicButton";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useGeolocation } from "../hooks/useGeolocation";
import {
  addTrip,
  calculateDistance,
  formatDuration,
  getActiveTrip,
  saveActiveTrip,
  clearActiveTrip,
} from "../storage";
import type { Trip, VoiceCommand } from "../types";

/**
 * Active Trip view — start/stop trips with voice and live tracking display.
 */
export function ActiveTrip() {
  // Voice recognition
  const speech = useSpeechRecognition();
  // Geolocation
  const geo = useGeolocation();

  const [activeTrip, setActiveTrip] = useState<Trip | null>(getActiveTrip());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentDistance, setCurrentDistance] = useState(0);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const totalDistanceRef = useRef(0);
  const tripStartTimeRef = useRef<number | null>(null);

  // Timer for elapsed time display
  useEffect(() => {
    if (!activeTrip) {
      setElapsedSeconds(0);
      return;
    }
    const start = new Date(activeTrip.startTime).getTime();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrip]);

  // Track position updates during an active trip to measure incremental distance
  useEffect(() => {
    if (geo.currentPosition && activeTrip) {
      const pos = geo.currentPosition;
      if (lastPositionRef.current) {
        const dist = calculateDistance(
          lastPositionRef.current.lat,
          lastPositionRef.current.lng,
          pos.lat,
          pos.lng
        );
        // Only count distances > 10 meters to filter GPS noise
        if (dist > 0.006) {
          totalDistanceRef.current += dist;
          setCurrentDistance(totalDistanceRef.current);
        }
      }
      lastPositionRef.current = pos;
    }
  }, [geo.currentPosition, activeTrip]);

  /** Show a temporary status message */
  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  /** Start a new trip (from voice command or manual button) */
  const startTrip = useCallback(async () => {
    try {
      const pos = await geo.getCurrentPosition();
      const now = new Date().toISOString();
      const trip: Trip = {
        id: "active",
        startTime: now,
        endTime: "",
        startLat: pos.lat,
        startLng: pos.lng,
        endLat: 0,
        endLng: 0,
        distanceMiles: 0,
        durationSeconds: 0,
        label: "Active Trip",
      };
      saveActiveTrip(trip);
      setActiveTrip(trip);
      totalDistanceRef.current = 0;
      setCurrentDistance(0);
      lastPositionRef.current = pos;
      tripStartTimeRef.current = Date.now();
      geo.startTracking();
      showStatus("🚗 Trip started! Mileage tracking is active.");
    } catch (err) {
      showStatus("❌ Could not get your location. Please enable GPS.");
    }
  }, [geo, showStatus]);

  /** End the current trip (from voice command or manual button) */
  const endTrip = useCallback(async () => {
    if (!activeTrip) return;

    try {
      const pos = await geo.getCurrentPosition();
      const now = new Date().toISOString();
      const startTime = new Date(activeTrip.startTime).getTime();
      const durationSec = Math.floor((Date.now() - startTime) / 1000);
      const finalDistance = totalDistanceRef.current;

      // Save as a completed trip
      addTrip({
        startTime: activeTrip.startTime,
        endTime: now,
        startLat: activeTrip.startLat,
        startLng: activeTrip.startLng,
        endLat: pos.lat,
        endLng: pos.lng,
        distanceMiles: parseFloat(finalDistance.toFixed(2)),
        durationSeconds: durationSec,
      });

      // Clean up active state
      clearActiveTrip();
      setActiveTrip(null);
      setCurrentDistance(0);
      totalDistanceRef.current = 0;
      lastPositionRef.current = null;
      geo.stopTracking();
      showStatus(
        `✅ Trip completed! ${finalDistance.toFixed(2)} miles in ${formatDuration(durationSec)}.`
      );
    } catch (err) {
      // Even if location fails, save the trip with whatever we have
      const now = new Date().toISOString();
      const startTime = new Date(activeTrip.startTime).getTime();
      const durationSec = Math.floor((Date.now() - startTime) / 1000);
      const finalDistance = totalDistanceRef.current;

      addTrip({
        startTime: activeTrip.startTime,
        endTime: now,
        startLat: activeTrip.startLat,
        startLng: activeTrip.startLng,
        endLat: 0,
        endLng: 0,
        distanceMiles: parseFloat(finalDistance.toFixed(2)),
        durationSeconds: durationSec,
      });

      clearActiveTrip();
      setActiveTrip(null);
      setCurrentDistance(0);
      totalDistanceRef.current = 0;
      lastPositionRef.current = null;
      geo.stopTracking();
      showStatus(
        `✅ Trip saved! ${finalDistance.toFixed(2)} miles in ${formatDuration(durationSec)}.`
      );
    }
  }, [activeTrip, geo, showStatus]);

  // Handle voice commands
  useEffect(() => {
    if (!speech.lastCommand) return;
    const cmd: VoiceCommand = speech.lastCommand;

    if (cmd.intent === "start_trip") {
      if (activeTrip) {
        showStatus("⚠️ A trip is already active. End it first.");
      } else {
        startTrip();
      }
    } else if (cmd.intent === "end_trip") {
      if (!activeTrip) {
        showStatus("⚠️ No active trip to end.");
      } else {
        endTrip();
      }
    } else if (cmd.intent === "unknown" && cmd.transcript) {
      showStatus(`🤔 Didn't understand: "${cmd.transcript}"`);
    }

    speech.clearCommand();
  }, [speech.lastCommand, speech.clearCommand, activeTrip, startTrip, endTrip, showStatus]);

  return (
    <div className="space-y-6">
      {/* Status message banner */}
      {statusMessage && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-3 text-center text-sm animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* Voice command button */}
      <div className="flex justify-center py-4">
        <MicButton
          isListening={speech.isListening}
          isSupported={speech.isSupported}
          onToggle={speech.toggleListening}
        />
      </div>

      {/* Voice command hint */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Say: <span className="text-emerald-400 font-mono">"start trip"</span> or <span className="text-emerald-400 font-mono">"end trip"</span></p>
      </div>

      {/* Active trip display */}
      {activeTrip ? (
        <div className="bg-gray-900 border border-emerald-700/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            Active Trip
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {currentDistance.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Miles</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatDuration(elapsedSeconds)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Duration</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Started: {new Date(activeTrip.startTime).toLocaleTimeString()}
          </div>

          <button
            onClick={endTrip}
            className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            🛑 End Trip
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <div className="text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-gray-700">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2h-4v-3.07A7 7 0 0 0 19 10Z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">No active trip</p>
          <p className="text-xs text-gray-600">Tap the mic and say "start trip"</p>
          <button
            onClick={startTrip}
            className="mt-4 px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            🚗 Start Trip Manually
          </button>
        </div>
      )}

      {/* Location status */}
      <div className="text-center text-xs text-gray-600">
        {geo.isTracking ? (
          <span className="text-emerald-600">📍 GPS active</span>
        ) : (
          <span>📍 GPS standby</span>
        )}
        {geo.error && <span className="text-red-500 ml-2">⚠️ {geo.error}</span>}
      </div>
    </div>
  );
}