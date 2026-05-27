import { useCallback, useEffect, useRef, useState } from "react";
import { MicButton } from "./MicButton";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
  addMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceRecords,
} from "../storage";
import type { MaintenanceRecord, VoiceCommand } from "../types";

/**
 * Maintenance / Expense Log view.
 * Shows all maintenance and part purchase records.
 * Supports adding via voice ("new oil change $65", "bought tires $600") or manual form.
 */
export function MaintenanceLog() {
  const speech = useSpeechRecognition();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Manual form state
  const [formType, setFormType] = useState<"maintenance" | "parts">(
    "maintenance"
  );
  const [formDescription, setFormDescription] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const loadRecords = () => {
    setRecords(getMaintenanceRecords().reverse());
  };

  useEffect(() => {
    loadRecords();
    const handleStorage = () => loadRecords();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Refresh periodically
  useEffect(() => {
    const interval = setInterval(loadRecords, 5000);
    return () => clearInterval(interval);
  }, []);

  /** Show a temporary status message */
  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  /** Add a record programmatically */
  const addRecord = useCallback(
    (
      type: "maintenance" | "parts",
      description: string,
      cost: number,
      notes: string = ""
    ) => {
      const result = addMaintenanceRecord({
        date: new Date().toISOString(),
        type,
        description,
        cost,
        notes,
      });
      loadRecords();
      showStatus(
        `✅ Added: ${type === "maintenance" ? "🔧" : "🛞"} ${description} — $${cost.toFixed(2)}`
      );
      return result;
    },
    [showStatus]
  );

  /** Handle manual form submission */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(formCost);
    if (!formDescription.trim() || isNaN(cost) || cost <= 0) {
      showStatus("⚠️ Please enter a valid description and cost.");
      return;
    }
    addRecord(formType, formDescription.trim(), cost, formNotes.trim());
    setFormDescription("");
    setFormCost("");
    setFormNotes("");
  };

  /** Handle deleting a record */
  const handleDelete = (id: string, description: string) => {
    deleteMaintenanceRecord(id);
    loadRecords();
    showStatus(`🗑️ Deleted: ${description}`);
  };

  /** Handle voice commands */
  useEffect(() => {
    if (!speech.lastCommand) return;
    const cmd: VoiceCommand = speech.lastCommand;

    if (cmd.intent === "add_maintenance") {
      addRecord("maintenance", cmd.description, cmd.cost);
    } else if (cmd.intent === "add_parts") {
      addRecord("parts", cmd.description, cmd.cost);
    } else if (cmd.intent === "unknown" && cmd.transcript) {
      showStatus(`🤔 Didn't understand: "${cmd.transcript}"`);
    }

    speech.clearCommand();
  }, [speech.lastCommand, speech.clearCommand, addRecord, showStatus]);

  /** Total spending */
  const totalSpent = records.reduce((sum, r) => sum + r.cost, 0);
  const maintenanceTotal = records
    .filter((r) => r.type === "maintenance")
    .reduce((sum, r) => sum + r.cost, 0);
  const partsTotal = records
    .filter((r) => r.type === "parts")
    .reduce((sum, r) => sum + r.cost, 0);

  /** Format date nicely */
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Status message */}
      {statusMessage && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-3 text-center text-sm animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* Voice command section */}
      <div className="flex flex-col items-center gap-2 py-2">
        <MicButton
          isListening={speech.isListening}
          isSupported={speech.isSupported}
          onToggle={speech.toggleListening}
        />
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>
            Say:{" "}
            <span className="text-emerald-400 font-mono">
              "new oil change $65"
            </span>
          </p>
          <p>
            Or:{" "}
            <span className="text-emerald-400 font-mono">
              "bought tires $600"
            </span>
          </p>
        </div>
      </div>

      {/* Manual add form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          ✏️ Add Manually
        </h4>
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormType("maintenance")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formType === "maintenance"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              🔧 Maintenance
            </button>
            <button
              type="button"
              onClick={() => setFormType("parts")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formType === "parts"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              🛞 Parts / Purchase
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Description (e.g. oil change)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Cost ($)"
              value={formCost}
              onChange={(e) => setFormCost(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            + Add Record
          </button>
        </form>
      </div>

      {/* Summary cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-bold text-white font-mono">
              ${totalSpent.toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <div className="text-xs text-gray-500">Maintenance</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              ${maintenanceTotal.toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <div className="text-xs text-gray-500">Parts</div>
            <div className="text-lg font-bold text-blue-400 font-mono">
              ${partsTotal.toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* Records list */}
      {records.length === 0 ? (
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mx-auto text-gray-700 mb-4"
          >
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
          </svg>
          <p className="text-gray-400">No maintenance records yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Tap the mic and say "new oil change $65" or use the form above
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {record.type === "maintenance" ? "🔧" : "🛞"}
                  </span>
                  <span className="font-medium text-white truncate">
                    {record.description}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      record.type === "maintenance"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-blue-900/50 text-blue-400"
                    }`}
                  >
                    {record.type}
                  </span>
                </div>
                {record.notes && (
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    {record.notes}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1 ml-7">
                  {formatDate(record.date)}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-lg font-bold text-white font-mono">
                  ${record.cost.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(record.id, record.description)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm"
                  title="Delete record"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}