import React from "react";
import { Page, ScreenHeader } from "../components/UI";
import { TEMPLE } from "../data/content";

// About page — content will be added later.
export default function TempleScreen() {
  return (
    <Page>
      <ScreenHeader eyebrow="About" title={TEMPLE.name} />
    </Page>
  );
}
