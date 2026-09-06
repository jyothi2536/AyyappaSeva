import { Alert, Linking, Platform } from "react-native";
import type { Copy } from "../data/content";

type Destination = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};
type MapAction = "place" | "directions";
type MapProvider = "apple" | "google";
type MapCopy = Pick<Copy, "openMap" | "cancel" | "mapErrorTitle" | "mapErrorMessage">;

export function getMapUrl(
  provider: MapProvider,
  destination: Destination,
  action: MapAction,
): string {
  const coordinates = encodeURIComponent(
    `${destination.latitude},${destination.longitude}`,
  );
  if (provider === "apple") {
    // Apple's documented map links launch Maps on iOS without another maps app.
    return action === "directions"
      ? `https://maps.apple.com/?daddr=${coordinates}&dirflg=d`
      : `https://maps.apple.com/?ll=${coordinates}&q=${encodeURIComponent(destination.name)}`;
  }
  // Universal Google Maps links also work when its app isn't installed.
  return action === "directions"
    ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
}

export function openDestinationMap(
  destination: Destination,
  action: MapAction,
  copy: MapCopy,
): void {
  const open = async (provider: MapProvider) => {
    try {
      await Linking.openURL(getMapUrl(provider, destination, action));
    } catch {
      Alert.alert(
        copy.mapErrorTitle,
        `${copy.mapErrorMessage}\n\n${destination.name}\n${destination.address}`,
      );
    }
  };

  if (Platform.OS === "ios") {
    // A native alert works on both iPhone and iPad without a popover anchor.
    Alert.alert(copy.openMap, destination.name, [
      { text: "Apple Maps", onPress: () => void open("apple") },
      { text: "Google Maps", onPress: () => void open("google") },
      { text: copy.cancel, style: "cancel" },
    ]);
    return;
  }
  void open("google");
}
