import { Alert } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";

export async function signOutToHome(
  leaveAdmin: () => Promise<void>,
  navigation: Pick<NativeStackNavigationProp<RootStackParamList>, "reset">,
) {
  try {
    await leaveAdmin();
    // Remove all admin routes, so Back cannot reopen a signed-out admin screen.
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Home" } }],
    });
  } catch (reason) {
    Alert.alert(
      "Unable to sign out",
      reason instanceof Error ? reason.message : "Please try again.",
    );
  }
}
