"use server";

import { redirect } from "next/navigation";
import { getSpeakerSession } from "@/utils/auth";
import { directus } from "@/services/directus";
import { readItems } from "@directus/sdk";

export async function authSpeaker(formData: FormData) {
  const password = formData.get("password") as string;
  const redirectPath = (formData.get("redirect") as string) || "/";

  // Event-Name aus dem redirect-Pfad extrahieren (speaker/[id])
  // Passwort gegen alle Events prüfen
  const events = await directus.request(
    readItems("events", {
      fields: ["id", "event_name", "access_password"],
    }),
  );

  const matchingEvent = events.find((e) => e.access_password === password);

  if (matchingEvent) {
    const session = await getSpeakerSession();
    session.isAuthenticated = true;
    session.eventId = matchingEvent.id;
    await session.save();
    redirect(redirectPath.startsWith("/") ? redirectPath : "/");
  } else {
    redirect(
      `/speaker-access?error=1&redirect=${encodeURIComponent(redirectPath)}`,
    );
  }
}
