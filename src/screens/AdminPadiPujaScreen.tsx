import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminEventForm } from "../components/AdminEventForm";
import { BackButton, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";

export default function AdminPadiPujaScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminPadiPuja">) {
  const { eventT } = useApp();
  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow={eventT.padiPuja}
        title={eventT.createPadiPuja}
        subtitle={eventT.translationHelp}
      />
      <AdminEventForm
        kind="padiPuja"
        onSaved={() => navigation.replace("AdminCalendar")}
      />
    </Page>
  );
}
