import { useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  enforceDevoteeSessionExpiry,
  subscribeToDevotee,
  type DevoteeSession,
} from "./firebase";

/** Current signed-in devotee (end user), or null. Sessions end automatically after 1 hour. */
export function useDevotee() {
  const [session, setSession] = useState<DevoteeSession | null>(null);
  useEffect(() => subscribeToDevotee(setSession), []);
  useEffect(() => {
    // Timers pause while the app is in the background, so re-check on resume.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void enforceDevoteeSessionExpiry();
    });
    return () => sub.remove();
  }, []);
  return session;
}
