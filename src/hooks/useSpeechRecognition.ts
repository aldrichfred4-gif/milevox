import { useCallback, useRef, useState } from "react";
import type { VoiceCommand } from "../types";

/**
 * Custom hook wrapping the Web Speech API (SpeechRecognition).
 * Provides a mic button toggle and parses voice commands into structured intents.
 */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  /** Parse raw transcript into a structured VoiceCommand */
  const parseCommand = useCallback((text: string): VoiceCommand => {
    const lower = text.toLowerCase().trim();

    // Match "start trip" or "begin trip"
    if (/^(start|begin)\s+trip/.test(lower)) {
      return { intent: "start_trip" };
    }

    // Match "end trip" or "stop trip"
    if (/^(end|stop|finish)\s+trip/.test(lower)) {
      return { intent: "end_trip" };
    }

    // Match "new oil change $65", "new oil change 65 dollars"
    // Or "bought tires $600", "bought tires 600 dollars"
    const maintenanceMatch = lower.match(
      /^(new|did|got|had)\s+(.+?)\s+\$?(\d+(?:\.\d{1,2})?)\s*(?:dollars)?$/i
    );
    if (maintenanceMatch) {
      return {
        intent: "add_maintenance",
        description: maintenanceMatch[2].trim(),
        cost: parseFloat(maintenanceMatch[3]),
      };
    }

    const partsMatch = lower.match(
      /^(bought|purchased|got|ordered|bought new)\s+(.+?)\s+\$?(\d+(?:\.\d{1,2})?)\s*(?:dollars)?$/i
    );
    if (partsMatch) {
      return {
        intent: "add_parts",
        description: partsMatch[2].trim(),
        cost: parseFloat(partsMatch[3]),
      };
    }

    return { intent: "unknown", transcript: text };
  }, []);

  /** Start listening for voice commands */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const command = parseCommand(text);
      setLastCommand(command);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, parseCommand]);

  /** Stop listening */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  /** Toggle mic on/off */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    lastCommand,
    error,
    isSupported,
    toggleListening,
    startListening,
    stopListening,
    clearCommand: () => setLastCommand(null),
  };
}