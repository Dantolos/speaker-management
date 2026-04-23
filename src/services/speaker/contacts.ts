import { unstable_cache } from "next/cache";
import { base, getRecords } from "../airtable";

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

export type ContactProfilePhoto = {
  url: string;
  thumbnailUrl: string | undefined;
};

export type ContactMandate = {
  id: string;
  position: string | undefined;
  organizationNames: string[];
  organizationCategories: string[];
  organizationWebsites: string[];
};

export type ContactDetail = {
  id: string;
  speakerName: string;
  firstName: string | undefined;
  lastName: string | undefined;
  title: string | undefined;
  position: string | undefined;
  organizations: string[];
  email: string | undefined;
  phone: string | undefined;
  linkedin: string | undefined;
  website: string | undefined;
  profilePhoto: ContactProfilePhoto | null;
  gender: string | undefined;
  languages: string[];
  kontaktart: string[];
  speakerkategorie: string[];
  notes: string | undefined;
  mandates: ContactMandate[];
};

export type ContactContribution = {
  id: string; // Confirmed-Contributions Record-ID (für Dossier-URL)
  eventId: string | undefined;
  eventName: string | undefined;
  eventDate: string | undefined; // ISO
  briefingStatus: string | undefined;
};

// ───────────────────────────────────────────────────────────────
// getContact
// ───────────────────────────────────────────────────────────────

async function _getContact(id: string): Promise<ContactDetail | null> {
  const records = await base("Kontakte")
    .select({
      filterByFormula: `RECORD_ID()='${id}'`,
      maxRecords: 1,
      fields: [
        "Speaker Name",
        "First Name",
        "Last Name",
        "Titel",
        "Position",
        "Organisationen / Unternehmen",
        "Email direkt",
        "Phone Number",
        "Linkedin",
        "Persönliche Webseite",
        "Profile Photo",
        "Geschlecht",
        "Sprachen",
        "Kontaktart",
        "Speakerkategorie",
        "Interne Notizen",
        "Mandate",
      ],
    })
    .firstPage();

  if (!records.length) return null;
  const r = records[0];
  const f = r.fields;

  // Profile Photo (Attachment-Array)
  const photoArr = f["Profile Photo"] as
    | { url: string; thumbnails?: { large?: { url: string } } }[]
    | undefined;
  const first = photoArr?.[0];
  const profilePhoto: ContactProfilePhoto | null = first
    ? {
        url: first.url,
        thumbnailUrl: first.thumbnails?.large?.url,
      }
    : null;

  const mandateIds = (f["Mandate"] as string[] | undefined) ?? [];
  const mandates = mandateIds.length ? await fetchMandates(mandateIds) : [];

  return {
    id: r.id,
    speakerName: (f["Speaker Name"] as string) ?? "",
    firstName: f["First Name"] as string | undefined,
    lastName: f["Last Name"] as string | undefined,
    title: f["Titel"] as string | undefined,
    position: ((f["Position"] as string[] | undefined) ?? [])[0],
    organizations:
      (f["Organisationen / Unternehmen"] as string[] | undefined) ?? [],
    email: f["Email direkt"] as string | undefined,
    phone: f["Phone Number"] as string | undefined,
    linkedin: f["Linkedin"] as string | undefined,
    website: f["Persönliche Webseite"] as string | undefined,
    profilePhoto,
    gender: f["Geschlecht"] as string | undefined,
    languages: (f["Sprachen"] as string[] | undefined) ?? [],
    kontaktart: (f["Kontaktart"] as string[] | undefined) ?? [],
    speakerkategorie: (f["Speakerkategorie"] as string[] | undefined) ?? [],
    notes: f["Interne Notizen"] as string | undefined,
    mandates,
  };
}

export const getContact = (id: string) =>
  unstable_cache(() => _getContact(id), ["contact-detail-v2", id], {
    revalidate: 60,
  })();

// ───────────────────────────────────────────────────────────────
// getContactContributions
// ───────────────────────────────────────────────────────────────

async function _getContactContributions(
  contactId: string,
): Promise<ContactContribution[]> {
  // Alle Contributions über getRecords (ggf. gecached)
  const all = (await getRecords("Confirmed Contributions")) as (Record<
    string,
    unknown
  > & {
    id: string;
    Event?: string[];
    Person?: string[];
    Briefing_Status?: string;
  })[];

  // Nach contactId filtern
  const forContact = all.filter((c) => (c.Person ?? []).includes(contactId));

  if (forContact.length === 0) return [];

  // Alle beteiligten Event-IDs sammeln
  const eventIds = Array.from(
    new Set(
      forContact
        .map((c) => c.Event?.[0])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  // Events batch-weise laden
  const eventMap = new Map<
    string,
    { name: string; date: string | undefined }
  >();

  if (eventIds.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < eventIds.length; i += BATCH) {
      const chunk = eventIds.slice(i, i + BATCH);
      const formula = `OR(${chunk.map((id) => `RECORD_ID()='${id}'`).join(",")})`;
      const events = await base("Events")
        .select({ filterByFormula: formula, fields: ["Name", "Datum"] })
        .all();
      for (const ev of events) {
        eventMap.set(ev.id, {
          name: (ev.fields["Name"] as string) ?? "",
          date: ev.fields["Datum"] as string | undefined,
        });
      }
    }
  }

  return forContact.map((c) => {
    const eventId = c.Event?.[0];
    const event = eventId ? eventMap.get(eventId) : undefined;
    return {
      id: c.id,
      eventId,
      eventName: event?.name,
      eventDate: event?.date,
      briefingStatus: c.Briefing_Status,
    };
  });
}

export const getContactContributions = (contactId: string) =>
  unstable_cache(
    () => _getContactContributions(contactId),
    ["contact-contributions", contactId],
    { revalidate: 60 },
  )();

async function fetchMandates(ids: string[]): Promise<ContactMandate[]> {
  const BATCH = 100;
  const results: ContactMandate[] = [];

  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const formula = `OR(${chunk.map((id) => `RECORD_ID()='${id}'`).join(",")})`;

    const records = await base("Mandate")
      .select({
        filterByFormula: formula,
        fields: [
          "Position",
          "organisation_name",
          "organisation_categories",
          "organisation_website",
        ],
      })
      .all();

    for (const r of records) {
      const f = r.fields;
      results.push({
        id: r.id,
        position: f["Position"] as string | undefined,
        organizationNames:
          (f["organisation_name"] as string[] | undefined) ?? [],
        organizationCategories:
          (f["organisation_categories"] as string[] | undefined) ?? [],
        organizationWebsites:
          (f["organisation_website"] as string[] | undefined) ?? [],
      });
    }
  }

  return results;
}
