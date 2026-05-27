import { useCallback, useEffect, useRef, useState } from "react";

/** Position with latitude and longitude */
interface Position {
  lat: number;
  lng: number;
}

/**
 * Custom hook for Geolocation API tracking.
 * Tracks the user's current position and provides distance calculation.
 */
export function useGeolocation() {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const isSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  /** Get a single current position */
  const getCurrentPosition = useCallback((): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p: Position = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCurrentPosition(p);
          resolve(p);
        },
        (err) => {
          setError(err.message);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, [isSupported]);

  /** Start continuous position tracking */
  const startTracking = useCallback(() => {
    if (!isSupported) {
      setError("Geolocation not supported");
      return;
    }
    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [isSupported]);

  /** Stop continuous tracking */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    currentPosition,
    error,
    isTracking,
    isSupported,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
}