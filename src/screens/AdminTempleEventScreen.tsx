import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminEventForm } from "../components/AdminEventForm";
import { BackButton, Page, ScreenHeader } from "../components/UI";
import { useApp } from "../state/AppContext";
import type { RootStackParamList } from "../types";

export default function AdminTempleEventScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "AdminTempleEvent">) {
  const { eventT, events } = useApp();
  const initialEvent = events.find(
    (event) => event.id === route.params?.eventId && event.kind === "temple",
  );
  return (
    <Page>
      <BackButton navigation={navigation} />
      <ScreenHeader
        eyebrow={eventT.templeEvent}
        title={initialEvent ? eventT.editEvent : eventT.createTempleEvent}
        subtitle={eventT.translationHelp}
      />
      <AdminEventForm
        kind="temple"
        initialEvent={initialEvent}
        onSaved={() => navigation.replace("AdminCalendar")}
      />
    </Page>
  );
}
