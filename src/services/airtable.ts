import Airtable from "airtable";
import { unstable_cache } from "next/cache";
import type { DeepPartialSpeaker } from "@/types/speaker";

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!,
);

// ---------------------------------------------------------------------------
// Field schema – single source of truth for every table's fields
// ---------------------------------------------------------------------------

const FIELDS = {
  Contributions: [
    "Person",
    "Sessions",
    "Event",
    "Hotel",
    "Reisen",
    "Transfers",
    "Hotel Confirmation Number",
    "Hotel Check-In",
    "Hotel Check-Out",
    "Backstage Timeslot",
    "Referentenbetreuer",
    "Anmerkung zum Aufenthalt",
  ],
  Kontakte: [
    "Speaker Name",
    "Last Name",
    "First Name",
    "Phone Number",
    "Sprachen",
  ],
  Mandate: ["Position"],
  Organisationen: ["Name"],
  Events: [
    "Name",
    "Datum",
    "Thema",
    "Beginn",
    "Ende",
    "Location",
    "Plattformen",
  ],
  Platforms: ["Conference Name"],
  Orte: ["Name", "Strasse", "Hausnummer", "PLZ", "Stadt", "Land"],
  Sessions: [
    "Sessiontypus",
    "Sessiontitel",
    "Session-Untertitel",
    "Session Description",
    "Session Start Time",
    "Session End Time",
    "Start (from Sessions NEW)",
    "End (from Sessions NEW)",
    "Room",
    "Raum (from Sessions NEW)",
    "Sessionsprache",
    "Dauer in Minuten",
    "Speaker",
  ],
  Reisen: [
    "Reisetyp",
    "Abreisezeit",
    "Abreiseort",
    "Ankunftsort",
    "Flugnummer (1. Flug)",
    "Ankunftszeit",
    "Flug Confirmation No",
    "via",
    "An/Abreise",
    "Flugnummer (2. Flug)",
    "Zugnummer / -verbindung",
  ],
  Transfers: [
    "Pick Up Time",
    "Drop Off Time",
    "Bemerkung",
    "Adresse (from Drop Off)",
    "Adresse (from Pick Up)",
  ],
  BackstageTimeslots: [
    "Title",
    "Type",
    "Startdate",
    "Enddate",
    "Notes",
    "Description",
    "Duration",
  ],
  Referentenbetreuer: ["Kontakte"],
} as const;

// ---------------------------------------------------------------------------
// Raw fetch-time types (linked fields are still string[] IDs at this stage)
// ---------------------------------------------------------------------------

type RawPersonRecord = {
  id: string;
  "Speaker Name"?: string;
  "Last Name"?: string;
  "First Name"?: string;
  "Phone Number"?: string;
  Sprachen?: string[];
  /** Linked record IDs — resolved in level 2 */
  Mandate?: string[];
};

type RawEventRecord = {
  id: string;
  Name?: string;
  Datum?: string;
  Thema?: string;
  Beginn?: string;
  Ende?: string;
  /** Linked record IDs — resolved in level 2 */
  Location?: string[];
  /** Linked record IDs — resolved in level 2 */
  Plattformen?: string[];
};

type RawMandateRecord = {
  id: string;
  Position?: string;
  /** Linked record IDs — resolved in level 3 */
  "Organisation / Unternehmen"?: string[];
};

type RawReferentRecord = {
  id: string;
  /** Linked record IDs — resolved in level 2 */
  Kontakte?: string[];
};

// 👇 neu: expliziter Typ für Session-Records mit Speaker-IDs
type RawSessionRecord = {
  id: string;
  Sessiontypus?: string[];
  Sessiontitel?: string;
  "Session-Untertitel"?: string;
  "Session Description"?: string;
  "Session Start Time"?: string;
  "Session End Time"?: string;
  "Start (from Sessions NEW)"?: string;
  "End (from Sessions NEW)"?: string;
  Room?: string;
  "Raum (from Sessions NEW)"?: string[];
  Sessionsprache?: string;
  "Dauer in Minuten"?: number;
  Speaker?: string[]; // linked record IDs — resolved in level 2
};

// 👇 neu: Kontakt-Record wie er aus Airtable kommt
type RawKontaktRecord = {
  id: string;
  "Speaker Name"?: string;
  "Last Name"?: string;
  "First Name"?: string;
  "Phone Number"?: string;
  Sprachen?: string[];
};

// ---------------------------------------------------------------------------
// Primitive fetchers
// ---------------------------------------------------------------------------

async function fetchOne<T extends object>(
  table: string,
  id: string,
  fields?: readonly string[],
): Promise<(T & { id: string }) | null> {
  const options: Record<string, unknown> = {
    filterByFormula: `RECORD_ID()='${id}'`,
    maxRecords: 1,
  };
  if (fields && fields.length > 0) {
    options.fields = fields as string[];
  }

  const records = await base(table).select(options).firstPage();
  if (!records.length) return null;
  return { id: records[0].id, ...(records[0].fields as T) };
}

async function fetchMany<T extends object>(
  table: string,
  ids: string[],
  fields?: readonly string[],
): Promise<Array<T & { id: string }>> {
  if (!ids.length) return [];

  const formula =
    ids.length === 1
      ? `RECORD_ID()='${ids[0]}'`
      : `OR(${ids.map((id) => `RECORD_ID()='${id}'`).join(",")})`;

  const options: Record<string, unknown> = { filterByFormula: formula };
  if (fields && fields.length > 0) {
    options.fields = fields as string[];
  }

  const records = await base(table).select(options).all();
  return records.map((r) => ({ id: r.id, ...(r.fields as T) }));
}

// ---------------------------------------------------------------------------
// Public generic helpers (kept for other use-cases in the app)
// ---------------------------------------------------------------------------

export async function getRecords(tableName: string, filterFormula?: string) {
  const records = await base(tableName)
    .select(filterFormula ? { filterByFormula: filterFormula } : {})
    .all();
  return records.map((r) => ({ id: r.id, ...r.fields }));
}

export async function getRecordById(tableName: string, id: string) {
  const record = await base(tableName).find(id);
  return { id: record.id, ...record.fields };
}

// ---------------------------------------------------------------------------
// Speaker dossier – fully resolved, cached
// ---------------------------------------------------------------------------

async function _getSpeaker(id: string): Promise<DeepPartialSpeaker | null> {
  // ── Level 0: root record ──────────────────────────────────────────────────
  const root = await fetchOne<{
    Person?: string[];
    Sessions?: string[];
    Event?: string[];
    Hotel?: string[];
    Reisen?: string[];
    Transfers?: string[];
    "Hotel Confirmation Number"?: string;
    "Hotel Check-In"?: string;
    "Hotel Check-Out"?: string;
    "Backstage Timeslot"?: string[];
    Referentenbetreuer?: string[];
    "Anmerkung zum Aufenthalt"?: string;
  }>("Confirmed Contributions", id, FIELDS.Contributions);

  if (!root) return null;

  // ── Level 1: all linked records fetched in parallel ───────────────────────
  const [
    person,
    event,
    hotel,
    sessions,
    reisen,
    transfers,
    backstageSlots,
    referentenbetreuer,
  ] = await Promise.all([
    root.Person?.[0]
      ? fetchOne<RawPersonRecord>("Kontakte", root.Person[0])
      : Promise.resolve(null),

    root.Event?.[0]
      ? fetchOne<RawEventRecord>("Events", root.Event[0], FIELDS.Events)
      : Promise.resolve(null),

    root.Hotel?.[0]
      ? fetchOne<import("@/types/speaker").Address>(
          "Orte",
          root.Hotel[0],
          FIELDS.Orte,
        )
      : Promise.resolve(null),

    // 👇 explizit als RawSessionRecord typisiert — kein any mehr nötig
    fetchMany<RawSessionRecord>(
      "Sessions",
      root.Sessions ?? [],
      FIELDS.Sessions,
    ),
    fetchMany("Reisen", root.Reisen ?? [], FIELDS.Reisen),
    fetchMany("Transfers", root.Transfers ?? [], FIELDS.Transfers),
    fetchMany(
      "Backstage Timeslots",
      root["Backstage Timeslot"] ?? [],
      FIELDS.BackstageTimeslots,
    ),

    root.Referentenbetreuer?.[0]
      ? fetchOne<RawReferentRecord>(
          "Referentenbetreuer",
          root.Referentenbetreuer[0],
          FIELDS.Referentenbetreuer,
        )
      : Promise.resolve(null),
  ]);

  // ── Level 2: records that depend on level-1 results ───────────────────────

  // Alle einzigartigen Speaker-IDs aus allen Sessions sammeln — kein any nötig
  // da sessions jetzt RawSessionRecord[] ist
  const allSpeakerIds: string[] = [
    ...new Set(sessions.flatMap((s: RawSessionRecord) => s.Speaker ?? [])),
  ];

  const [mandates, location, platform, assistant, sessionSpeakers] =
    await Promise.all([
      person?.Mandate?.length
        ? fetchMany<RawMandateRecord>("Mandate", person.Mandate)
        : Promise.resolve([]),

      event?.Location?.[0]
        ? fetchOne<import("@/types/speaker").Address>(
            "Orte",
            event.Location[0],
            FIELDS.Orte,
          )
        : Promise.resolve(null),

      event?.Plattformen?.[0]
        ? fetchOne<import("@/types/speaker").Platform>(
            "Platforms",
            event.Plattformen[0],
            FIELDS.Platforms,
          )
        : Promise.resolve(null),

      referentenbetreuer?.Kontakte?.[0]
        ? fetchOne("Kontakte", referentenbetreuer.Kontakte[0], FIELDS.Kontakte)
        : Promise.resolve(null),

      // 👇 explizit als RawKontaktRecord typisiert
      allSpeakerIds.length
        ? fetchMany<RawKontaktRecord>(
            "Kontakte",
            allSpeakerIds,
            FIELDS.Kontakte,
          )
        : Promise.resolve([]),
    ]);

  // ── Level 3: companies linked from Mandate records ────────────────────────
  const allOrgIds = mandates.flatMap(
    (m) => m["Organisation / Unternehmen"] ?? [],
  );

  const companies = await fetchMany<{ Name: string }>(
    "Organisationen / Unternehmen",
    allOrgIds,
    FIELDS.Organisationen,
  );

  const mandatesWithCompanies: import("@/types/speaker").Mandate[] =
    mandates.map((mandate) => ({
      id: mandate.id,
      Position: mandate.Position,
      "Organisation / Unternehmen": companies.filter((c) =>
        mandate["Organisation / Unternehmen"]?.includes(c.id),
      ),
    }));

  // Speaker-Objekte den jeweiligen Sessions zuordnen — kein any nötig
  // da session jetzt RawSessionRecord ist
  const sessionsWithSpeakers = sessions.map((session: RawSessionRecord) => ({
    ...session,
    Speaker: sessionSpeakers.filter((kontakt: RawKontaktRecord) =>
      session.Speaker?.includes(kontakt.id),
    ),
  }));

  // ── Assemble ──────────────────────────────────────────────────────────────
  return {
    ...root,
    Person: person ? { ...person, Mandate: mandatesWithCompanies } : undefined,
    Event: event
      ? ({
          id: event.id,
          Name: event.Name,
          Datum: event.Datum,
          Thema: event.Thema,
          Beginn: event.Beginn,
          Ende: event.Ende,
          Location: location ?? undefined,
          Plattformen: platform ?? undefined,
        } satisfies import("@/types/speaker").Event)
      : undefined,
    Hotel: hotel ?? undefined,
    Sessions: sessionsWithSpeakers,
    Reisen: reisen,
    Transfers: transfers,
    Backstage: backstageSlots,
    Referentenbetreuer: assistant ?? undefined,
  };
}

/** Cached version – revalidates every 60 seconds. */
export const getSpeaker = (id: string) =>
  unstable_cache(() => _getSpeaker(id), [`speaker-${id}`], {
    revalidate: 60,
  })();

/** Backward-compatible alias so existing imports don't break. */
export const getMultipleRecordsById = (_table: string, id: string) =>
  getSpeaker(id);
