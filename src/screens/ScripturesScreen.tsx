import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScriptureAudioScreen from "../../ScriptureAudioScreen";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";

export default function ScripturesScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Scriptures">) {
  const { language } = useApp();
  return (
    <ScriptureAudioScreen
      language={language}
      onBack={() => navigation.goBack()}
    />
  );
}
