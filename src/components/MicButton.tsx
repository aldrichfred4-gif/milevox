import { useState } from "react";

interface MicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onToggle: () => void;
}

/**
 * Microphone button component.
 * Shows a pulsing animation while listening, and visual feedback via the icon.
 */
export function MicButton({ isListening, isSupported, onToggle }: MicButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isSupported) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-sm">
          ⚠️ Speech recognition is not supported in this browser. Try Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${
            isListening
              ? "bg-red-600 shadow-lg shadow-red-600/50 animate-pulse"
              : isHovered
              ? "bg-emerald-600 shadow-lg shadow-emerald-600/30 scale-105"
              : "bg-emerald-700 hover:bg-emerald-600 shadow-md"
          }
        `}
        aria-label={isListening ? "Stop listening" : "Start voice command"}
        title={isListening ? "Click to stop" : "Click and speak a command"}
      >
        {/* Mic icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10 text-white"
        >
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2h-4v-3.07A7 7 0 0 0 19 10Z" />
        </svg>

        {/* Sound wave rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
            <span className="absolute inset-2 rounded-full border border-red-300 animate-ping animation-delay-150" />
          </>
        )}
      </button>

      <span
        className={`text-sm font-medium transition-colors ${
          isListening ? "text-red-400" : "text-gray-400"
        }`}
      >
        {isListening ? "Listening..." : "Tap to speak"}
      </span>
    </div>
  );
}