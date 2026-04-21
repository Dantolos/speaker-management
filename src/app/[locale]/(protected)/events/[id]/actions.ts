"use server";

import { revalidatePath } from "next/cache";
import { createItem, updateItem } from "@directus/sdk";
import { directus } from "@/services/directus";
import { getInternalSession } from "@/utils/auth";

export async function createEventConfig(airtableId: string) {
  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    return { success: false, error: "unauthenticated" };
  }

  try {
    await directus.request(
      createItem("events", {
        airtable_id: airtableId,
      }),
    );
    revalidatePath(`/events/${airtableId}`);
    return { success: true };
  } catch (err) {
    console.error("createEventConfig failed", err);
    return { success: false, error: "create_failed" };
  }
}

export type UpdateEventConfigInput = {
  directusId: string;
  airtableId: string;
  themeId: string | null;
  contentDisplay: string[];
  accessPassword: string | null;
};

export async function updateEventConfig(input: UpdateEventConfigInput) {
  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    return { success: false, error: "unauthenticated" };
  }

  try {
    await directus.request(
      updateItem("events", input.directusId, {
        theme: input.themeId,
        content_display: input.contentDisplay,
        access_password: input.accessPassword,
      }),
    );
    revalidatePath(`/events/${input.airtableId}`);
    return { success: true };
  } catch (err) {
    console.error("updateEventConfig failed", err);
    return { success: false, error: "update_failed" };
  }
}
