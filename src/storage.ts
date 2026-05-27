import type { Trip, MaintenanceRecord } from "./types";

// Storage keys
const TRIPS_KEY = "milevox_trips";
const MAINTENANCE_KEY = "milevox_maintenance";
const ACTIVE_TRIP_KEY = "milevox_active_trip";

/** Generate a short unique ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ─────────────────────── Trips ───────────────────────

/** Get all completed trips from localStorage */
export function getTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save all completed trips to localStorage */
export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

/** Add a completed trip to storage */
export function addTrip(trip: Omit<Trip, "id" | "label">): Trip {
  const trips = getTrips();
  const newTrip: Trip = {
    ...trip,
    id: generateId(),
    label: `Trip ${trips.length + 1} — ${formatDate(trip.startTime)}`,
  };
  trips.push(newTrip);
  saveTrips(trips);
  return newTrip;
}

/** Get the currently active (in-progress) trip, if any */
export function getActiveTrip(): Trip | null {
  try {
    const raw = localStorage.getItem(ACTIVE_TRIP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Save the active trip */
export function saveActiveTrip(trip: Trip): void {
  localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(trip));
}

/** Clear the active trip (after completing it) */
export function clearActiveTrip(): void {
  localStorage.removeItem(ACTIVE_TRIP_KEY);
}

// ─────────────────── Maintenance ───────────────────

/** Get all maintenance/expense records */
export function getMaintenanceRecords(): MaintenanceRecord[] {
  try {
    const raw = localStorage.getItem(MAINTENANCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save all maintenance records */
export function saveMaintenanceRecords(records: MaintenanceRecord[]): void {
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(records));
}

/** Add a new maintenance/expense record */
export function addMaintenanceRecord(
  record: Omit<MaintenanceRecord, "id">
): MaintenanceRecord {
  const records = getMaintenanceRecords();
  const newRecord: MaintenanceRecord = {
    ...record,
    id: generateId(),
  };
  records.push(newRecord);
  saveMaintenanceRecords(records);
  return newRecord;
}

/** Delete a maintenance record by ID */
export function deleteMaintenanceRecord(id: string): void {
  const records = getMaintenanceRecords().filter((r) => r.id !== id);
  saveMaintenanceRecords(records);
}

// ─────────────────── Helpers ───────────────────

/** Format an ISO date string to a human-readable format */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Calculate distance in miles between two lat/lng points using the Haversine formula */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Format seconds into a human-readable duration string */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}