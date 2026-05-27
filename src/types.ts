/** Represents a single tracked trip */
export interface Trip {
  id: string;
  /** ISO timestamp when the trip started */
  startTime: string;
  /** ISO timestamp when the trip ended (empty string if still active) */
  endTime: string;
  /** Starting latitude of the trip */
  startLat: number;
  /** Starting longitude of the trip */
  startLng: number;
  /** Ending latitude (0 if trip still active) */
  endLat: number;
  /** Ending longitude (0 if trip still active) */
  endLng: number;
  /** Total distance in miles */
  distanceMiles: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Human-readable label (auto-generated) */
  label: string;
}

/** Represents a maintenance or expense record */
export interface MaintenanceRecord {
  id: string;
  /** ISO timestamp when the record was created */
  date: string;
  /** Type: "maintenance" for service, "parts" for purchases */
  type: "maintenance" | "parts";
  /** Description of what was done or bought */
  description: string;
  /** Cost in dollars */
  cost: number;
  /** Optional notes */
  notes: string;
}

/** Voice command types the app recognizes */
export type VoiceCommand =
  | { intent: "start_trip" }
  | { intent: "end_trip" }
  | { intent: "add_maintenance"; description: string; cost: number }
  | { intent: "add_parts"; description: string; cost: number }
  | { intent: "unknown"; transcript: string };

/** Tab views */
export type TabView = "active" | "history" | "maintenance";