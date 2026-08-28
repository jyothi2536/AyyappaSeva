import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminEventForm } from "../components/AdminEventForm";
import { BackButton, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";

export default function AdminPadiPujaScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "AdminPadiPuja">) {
  const { eventT, events } = useApp();
  const initialEvent = events.find(
    (event) => event.id === route.params?.eventId && event.kind === "padiPuja",
  );
  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow={eventT.padiPuja}
        title={initialEvent ? eventT.editEvent : eventT.createPadiPuja}
        subtitle={eventT.translationHelp}
      />
      <AdminEventForm
        kind="padiPuja"
        initialEvent={initialEvent}
        onSaved={() => navigation.replace("AdminCalendar")}
      />
    </Page>
  );
}
