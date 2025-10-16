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
 * Speaker Briefing Data
 * Fetching formatting all needed data for the Briefing page
 * @param tableName  is airtable table name
 * @param id         id of the speaker
 * @returns object   clean object with all needed data
 */

export async function getMultipleRecordsById(
  tableName: string,
  id: string,
): Promise<DeepPartialSpeaker> {
  const filterFormula = `RECORD_ID()='${id}'`;
  const records = await base(tableName)
    .select({
      fields: [
        "Person",
        "Sessions",
        "Event",
        "Hotel",
        "Hotel Check-In",
        "Hotel Check-Out",
        "Anmerkung zum Aufenthalt",
        "Reisen",
        "Transfers",
        "Backstage Timeslot",
        "Referentenbetreuer",
      ],
      filterByFormula: filterFormula,
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return [];

  const record = records[0];

  // Loading Person Detailes
  const personId = record.get("Person")[0] as string | undefined;

  const person = await base("Kontakte")
    .select({
      fields: [
        "Speaker Name",
        "Last Name",
        "First Name",
        "Position",
        "Organisation / Unternehmen",
      ],
      filterByFormula: `RECORD_ID()='${personId}'`,
      maxRecords: 1,
    })
    .firstPage();

  // Loading Companies of Person
  const companyIds = person[0].fields["Organisation / Unternehmen"] as
    | string[]
    | undefined;
  let companies = [];

  if (Array.isArray(companyIds) && companyIds.length > 0) {
    companies = await Promise.all(
      companyIds.map((companyId) =>
        base("Organisationen / Unternehmen")
          .select({
            fields: ["Name"],
            filterByFormula: `RECORD_ID()='${companyId}'`,
            maxRecords: 1,
          })
          .firstPage(),
      ),
    );
  }

  // Loading Event Detailes
  const eventId = record.get("Event")[0] as string[] | undefined;
  let event = {};

  if (eventId) {
    event = await base("Events")
      .select({
        fields: [
          "Name",
          "Datum",
          "Thema",
          "Beginn",
          "Ende",
          "Location",
          "Thema",
          "Plattformen",
        ],
        filterByFormula: `RECORD_ID()='${eventId}'`,
        maxRecords: 1,
      })
      .firstPage();
  }

  const platformId = event[0].get("Plattformen") as string | undefined;

  let platform = {};

  if (platformId) {
    platform = await base("Platforms")
      .select({
        fields: ["Conference Name"],
        filterByFormula: `RECORD_ID()='${platformId}'`,
        maxRecords: 1,
      })
      .firstPage();
  }

  const locationId = event[0].get("Location") as string | undefined;

  let location = {};

  if (locationId) {
    location = await base("Orte")
      .select({
        fields: ["Name", "Strasse", "Hausnummer", "PLZ", "Stadt", "Land"],
        filterByFormula: `RECORD_ID()='${locationId}'`,
        maxRecords: 1,
      })
      .firstPage();
  }

  // Loading Hotel Detailes
  const hotelId = record.get("Hotel")
    ? (record.get("Hotel")[0] as string | undefined)
    : undefined;
  let hotel = {};

  if (hotelId) {
    hotel = await base("Orte")
      .select({
        fields: ["Name", "Strasse", "Hausnummer", "PLZ", "Stadt", "Land"],
        filterByFormula: `RECORD_ID()='${hotelId}'`,
        maxRecords: 1,
      })
      .firstPage();
  }

  // Loading Session Detailes
  const sessionIds = record.get("Sessions") as string[] | undefined;
  let sessions = [];

  if (Array.isArray(sessionIds) && sessionIds.length > 0) {
    sessions = await Promise.all(
      sessionIds.map((sessionId) =>
        base("Sessions")
          .select({
            fields: [
              "Sessiontitel",
              "Sessionart",
              "Session-Untertitel",
              "Session Start Time",
              "Session End Time",
              "Room",
              "Sessionsprache",
              "Dauer in Minuten",
            ],
            filterByFormula: `RECORD_ID()='${sessionId}'`,
            maxRecords: 1,
          })
          .firstPage(),
      ),
    );
  }

  // Loading Reisen Detailes
  const journeyIds = record.get("Reisen") as string[] | undefined;
  let journey = [];

  if (Array.isArray(journeyIds) && journeyIds.length > 0) {
    journey = await Promise.all(
      journeyIds.map((journeyId) =>
        base("Reisen")
          .select({
            fields: [
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
            filterByFormula: `RECORD_ID()='${journeyId}'`,
            maxRecords: 1,
          })
          .firstPage(),
      ),
    );
  }

  // Loading Transfers Detailes
  const transferIds = record.get("Transfers") as string[] | undefined;
  let transfers = [];

  if (Array.isArray(transferIds) && transferIds.length > 0) {
    transfers = await Promise.all(
      transferIds.map((transferId) =>
        base("Transfers")
          .select({
            fields: [
              "Pick Up Time",
              "Drop Off Time",
              "Bemerkung",
              "Adresse (from Drop Off)",
              "Adresse (from Pick Up)",
            ],
            filterByFormula: `RECORD_ID()='${transferId}'`,
            maxRecords: 1,
          })
          .firstPage(),
      ),
    );
  }

  // Loading Backstage Details
  const backstageIds = record.get("Backstage Timeslot") as string[] | undefined;
  let backstageSlots = [];

  if (Array.isArray(backstageIds) && backstageIds.length > 0) {
    backstageSlots = await Promise.all(
      backstageIds.map((backstageId) =>
        base("Backstage Timeslots")
          .select({
            fields: [],
            filterByFormula: `RECORD_ID()='${backstageId}'`,
            maxRecords: 1,
          })
          .firstPage(),
      ),
    );
  }

  // Loading Referentenbetreuer
  const assistantId = record.get("Referentenbetreuer")
    ? (record.get("Referentenbetreuer")[0] as string | undefined)
    : undefined;
  let assistant = {};

  if (assistantId) {
    const assistantcontact = await base("Referentenbetreuer")
      .select({
        fields: [],
        filterByFormula: `RECORD_ID()='${assistantId}'`,
        maxRecords: 1,
      })
      .firstPage();
    assistant = await base("Kontakte")
      .select({
        fields: ["Phone Number", "Sprachen", "First Name", "Last Name"],
        filterByFormula: `RECORD_ID()='${assistantcontact[0].fields.Kontakte[0]}'`,
        maxRecords: 1,
      })
      .firstPage();
  }

  return {
    id: record.id,
    ...record.fields,
    Person: {
      id: person.id,
      ...person[0].fields,
      "Organisation / Unternehmen": companies.map((e) => ({
        id: e.id,
        ...e[0].fields,
      })),
    },
    Event: {
      id: event.id,
      ...event[0].fields,
      Plattformen: {
        id: platform.id,
        ...platform[0].fields,
      },
      Location: {
        id: location.id,
        ...location[0].fields,
      },
    },
    Hotel: {
      id: hotel.id,
      ...hotel[0]?.fields,
    },
    Referentenbetreuer: {
      id: assistant.id,
      ...assistant[0]?.fields,
    },
    Sessions: sessions.map((e) => ({ id: e.id, ...e[0].fields })),
    Reisen: journey.map((e) => ({ id: e.id, ...e[0].fields })),
    Transfers: transfers.map((e) => ({ id: e.id, ...e[0].fields })),
    Backstage: backstageSlots.map((e, index) => ({
      id: index,
      ...e[0].fields,
    })),
  };
}
