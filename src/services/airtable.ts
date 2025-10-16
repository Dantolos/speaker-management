import Airtable from "airtable";
import type { DeepPartialSpeaker } from "@/types/speaker";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!,
);

export async function getRecords(tableName: string, filterFormula?: string) {
  const queryOptions = filterFormula ? { filterByFormula: filterFormula } : {};
  const records = await base(tableName).select(queryOptions).all();
  return records.map((record) => ({
    id: record.id,
    ...record.fields,
  }));
}

export async function getRecordById(tableName: string, id: string) {
  const record = await base(tableName).find(id);
  return {
    id: record.id,
    ...record.fields,
  };
}

/**
 * Generic helper to fetch single Airtable record by ID with selected fields.
 */
async function fetchSingleRecord<T>(
  table: string,
  id: string,
  fields: (keyof T)[],
): Promise<(T & { id: string }) | null> {
  const records = await base(table)
    .select({
      filterByFormula: `RECORD_ID()='${id}'`,
      fields: fields as string[],
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return null;
  return { id: records[0].id, ...(records[0].fields as T) };
}

/**
 * Generic helper to fetch multiple Airtable records by IDs with selected fields.
 */
async function fetchMultipleRecords<T extends object>(
  table: string,
  ids: string[],
  fields: (keyof T)[],
): Promise<Array<T & { id: string }>> {
  // Map -> Promise<(T & {id: string}) | null>
  const recordPromises = ids.map((id) =>
    fetchSingleRecord<T>(table, id, fields),
  );
  // Await all Promises
  const resolved = await Promise.all(recordPromises);

  // Create a non-throwing custom type guard function
  function isNotNull<R>(value: R | null): value is R {
    return value !== null;
  }

  // Filter nulls with this guard
  return resolved.filter(isNotNull);
}

/**
 * Fetch detailed speaker data with all linked records resolved.
 */
export async function getMultipleRecordsById(
  tableName: string,
  id: string,
): Promise<DeepPartialSpeaker | null> {
  // Load main record with linking fields
  const mainRecord = await fetchSingleRecord<{
    Person?: string[];
    Sessions?: string[];
    Event?: string[];
    Hotel?: string[];
    Reisen?: string[];
    Transfers?: string[];
    "Backstage Timeslot"?: string[];
    Referentenbetreuer?: string[];
  }>(tableName, id, [
    "Person",
    "Sessions",
    "Event",
    "Hotel",
    "Reisen",
    "Transfers",
    "Backstage Timeslot",
    "Referentenbetreuer",
  ]);

  if (!mainRecord) return null;

  // Fetch Person
  const person =
    mainRecord.Person && mainRecord.Person.length > 0
      ? await fetchSingleRecord("Kontakte", mainRecord.Person[0], [
          "Speaker Name",
          "Last Name",
          "First Name",
          "Position",
          "Organisation / Unternehmen",
        ])
      : null;

  // Fetch Companies related to Person
  const companies =
    person?.["Organisation / Unternehmen"] &&
    person["Organisation / Unternehmen"].length > 0
      ? await fetchMultipleRecords(
          "Organisationen / Unternehmen",
          person["Organisation / Unternehmen"],
          ["Name"],
        )
      : [];

  // Fetch Event
  const event =
    mainRecord.Event && mainRecord.Event.length > 0
      ? await fetchSingleRecord("Events", mainRecord.Event[0], [
          "Name",
          "Datum",
          "Thema",
          "Beginn",
          "Ende",
          "Location",
          "Plattformen",
        ])
      : null;

  // Platform (from Event)
  const platform =
    event?.Plattformen && event.Plattformen.length > 0
      ? await fetchSingleRecord("Platforms", event.Plattformen[0], [
          "Conference Name",
        ])
      : null;

  // Location (from Event)
  const location =
    event?.Location && event.Location.length > 0
      ? await fetchSingleRecord("Orte", event.Location[0], [
          "Name",
          "Strasse",
          "Hausnummer",
          "PLZ",
          "Stadt",
          "Land",
        ])
      : null;

  // Hotel Details
  const hotel =
    mainRecord.Hotel && mainRecord.Hotel.length > 0
      ? await fetchSingleRecord("Orte", mainRecord.Hotel[0], [
          "Name",
          "Strasse",
          "Hausnummer",
          "PLZ",
          "Stadt",
          "Land",
        ])
      : null;

  // Sessions
  const sessions =
    mainRecord.Sessions && mainRecord.Sessions.length > 0
      ? await fetchMultipleRecords("Sessions", mainRecord.Sessions, [
          "Sessiontitel",
          "Sessionart",
          "Session-Untertitel",
          "Session Start Time",
          "Session End Time",
          "Room",
          "Sessionsprache",
          "Dauer in Minuten",
        ])
      : [];

  // Reisen (journey)
  const reisen =
    mainRecord.Reisen && mainRecord.Reisen.length > 0
      ? await fetchMultipleRecords("Reisen", mainRecord.Reisen, [
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
        ])
      : [];

  // Transfers
  const transfers =
    mainRecord.Transfers && mainRecord.Transfers.length > 0
      ? await fetchMultipleRecords("Transfers", mainRecord.Transfers, [
          "Pick Up Time",
          "Drop Off Time",
          "Bemerkung",
          "Adresse (from Drop Off)",
          "Adresse (from Pick Up)",
        ])
      : [];

  // Backstage Timeslots
  const backstageSlots =
    mainRecord["Backstage Timeslot"] &&
    mainRecord["Backstage Timeslot"].length > 0
      ? await fetchMultipleRecords(
          "Backstage Timeslots",
          mainRecord["Backstage Timeslot"],
          [
            "Title",
            "Type",
            "Startdate",
            "Enddate",
            "Notes",
            "Description",
            "Duration",
          ],
        )
      : [];

  // Referentenbetreuer (assistant)
  const referentenbetreuer =
    mainRecord.Referentenbetreuer && mainRecord.Referentenbetreuer.length > 0
      ? await fetchSingleRecord(
          "Referentenbetreuer",
          mainRecord.Referentenbetreuer[0],
          ["Kontakte"],
        )
      : undefined;
  const assistant =
    referentenbetreuer?.Kontakte && referentenbetreuer.Kontakte.length > 0
      ? await fetchSingleRecord("Kontakte", referentenbetreuer.Kontakte[0], [
          "Phone Number",
          "Last Name",
          "First Name",
          "Sprachen",
        ])
      : undefined;

  // Return combined data matching DeepPartialSpeaker
  return {
    ...mainRecord,
    Person: person
      ? {
          ...person,
          "Organisation / Unternehmen": companies,
        }
      : undefined,
    Event: event
      ? {
          ...event,
          Plattformen: platform ?? undefined,
          Location: location ?? undefined,
        }
      : undefined,
    Hotel: hotel ?? undefined,
    Referentenbetreuer: assistant
      ? {
          ...assistant,
        }
      : undefined,
    Sessions: sessions,
    Reisen: reisen,
    Transfers: transfers,
    Backstage: backstageSlots,
  };
}
