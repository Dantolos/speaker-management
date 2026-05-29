"use server";
import { redirect } from "next/navigation";
import { getSpeakerSession } from "@/utils/auth";
import { directus } from "@/services/directus";
import { readItems } from "@directus/sdk";

export async function authSpeaker(formData: FormData) {
  const password = (formData.get("password") as string)?.trim();
  const redirectPath = (formData.get("redirect") as string) || "/";

  if (!password) {
    redirect(
      `/speaker-access?error=1&redirect=${encodeURIComponent(redirectPath)}`,
    );
  }

  const events = await directus.request(
    readItems("events", {
      filter: { access_password: { _eq: password } },
      fields: ["id"],
      limit: 1,
    }),
  );
  const matchingEvent = events[0];

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
