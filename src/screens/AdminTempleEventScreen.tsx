import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminEventForm } from "../components/AdminEventForm";
import { BackButton, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";

export default function AdminTempleEventScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminTempleEvent">) {
  const { eventT } = useApp();
  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow={eventT.templeEvent}
        title={eventT.createTempleEvent}
        subtitle={eventT.translationHelp}
      />
      <AdminEventForm
        kind="temple"
        onSaved={() => navigation.replace("AdminCalendar")}
      />
    </Page>
  );
}
