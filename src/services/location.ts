import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { TEMPLE_LOCATION } from "./sun";

const KEY = "deviceCoords";

export type Coords = { latitude: number; longitude: number; source: "device" | "cached" | "temple" };

/**
 * The devotee's current approximate location for sunrise/sunset.
 * Falls back to the last known location, then to the temple, if permission is denied or unavailable.
 */
export async function getSunLocation(ask = true): Promise<Coords> {
  try {
    let perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted && ask && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
    if (perm.granted) {
      const pos =
        (await Location.getLastKnownPositionAsync({ maxAge: 6 * 3_600_000 })) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      await AsyncStorage.setItem(KEY, JSON.stringify(coords));
      return { ...coords, source: "device" };
    }
  } catch {
    // fall through
  }
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return { ...(JSON.parse(raw) as { latitude: number; longitude: number }), source: "cached" };
  } catch {
    // ignore
  }
  return { latitude: TEMPLE_LOCATION.latitude, longitude: TEMPLE_LOCATION.longitude, source: "temple" };
}
