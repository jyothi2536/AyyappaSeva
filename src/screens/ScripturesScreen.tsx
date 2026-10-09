import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScriptureAudioScreen from "../../ScriptureAudioScreen";
import { LyricsLanguagePicker } from "../components/LyricsLanguagePicker";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";

export default function ScripturesScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Scriptures">) {
  const { lyricsLanguage } = useApp();
  return (
    <ScriptureAudioScreen
      language={lyricsLanguage}
      languagePicker={<LyricsLanguagePicker />}
      onBack={() => navigation.goBack()}
    />
  );
}
