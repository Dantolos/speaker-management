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
  // Scalar fields only — linked-record fields ("Mandate") must be omitted from
  // the fields[] filter or Airtable throws 422. Fetching without a filter returns
  // all columns including linked IDs automatically (see fetchOne call below).
  Kontakte: [
    "Speaker Name",
    "Last Name",
    "First Name",
    "Phone Number",
    "Sprachen",
  ],
  // "Organisation / Unternehmen" is a linked-record field → omit from filter.
  // "Position" is scalar → safe to include.
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
    "Sessionsprache",
    "Dauer in Minuten",
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

// ---------------------------------------------------------------------------
// Primitive fetchers
// ---------------------------------------------------------------------------

/**
 * Fetch one record by ID.
 * Pass `fields` to restrict returned columns (scalars only — Airtable throws
 * 422 if you include linked-record field names in the fields filter).
 * Omit `fields` to get every column including linked-record ID arrays.
 */
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

/**
 * Fetch multiple records in ONE query using an OR formula (avoids N+1).
 * Omit `fields` to return all columns (required for tables with linked records).
 */
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
    // No fields filter — "Mandate" is a linked-record field and would cause
    // a 422 if included in fields[]. Omitting the filter returns all columns.
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

    fetchMany("Sessions", root.Sessions ?? [], FIELDS.Sessions),
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
  const [mandates, location, platform, assistant] = await Promise.all([
    // No fields filter — "Organisation / Unternehmen" is a linked-record field
    person?.Mandate?.length
      ? fetchMany<RawMandateRecord>("Mandate", person.Mandate)
      : Promise.resolve([]),

    // Location and Plattformen are now typed as string[] on RawEventRecord — no cast needed
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
  ]);

  // ── Level 3: companies linked from Mandate records ────────────────────────
  const allOrgIds = mandates.flatMap(
    (m) => m["Organisation / Unternehmen"] ?? [],
  );

  // Explicitly typed so TypeScript knows the shape satisfies Organisation[]
  const companies = await fetchMany<{ Name: string }>(
    "Organisationen / Unternehmen",
    allOrgIds,
    FIELDS.Organisationen,
  );

  // Explicitly typed as Mandate[] so the assemble step type-checks correctly
  const mandatesWithCompanies: import("@/types/speaker").Mandate[] =
    mandates.map((mandate) => ({
      id: mandate.id,
      Position: mandate.Position,
      "Organisation / Unternehmen": companies.filter((c) =>
        mandate["Organisation / Unternehmen"]?.includes(c.id),
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
    Sessions: sessions,
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
