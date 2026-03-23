// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export interface Address {
  Name?: string;
  Strasse?: string;
  Hausnummer?: string;
  PLZ?: string;
  Stadt?: string;
  Land?: string;
}

// ---------------------------------------------------------------------------
// Linked record shapes
// ---------------------------------------------------------------------------

export interface Organisation {
  id: string;
  Name: string;
}

/** A single mandate entry: one role at one organisation. */
export interface Mandate {
  id: string;
  Position?: string;
  "Organisation / Unternehmen"?: Organisation[];
}

export interface Person {
  id: string;
  "Speaker Name"?: string;
  "First Name"?: string;
  "Last Name"?: string;
  "Phone Number"?: string;
  Sprachen?: string[];
  /** Replaces the old flat Position + Organisation fields. */
  Mandate?: Mandate[];
}

export interface Platform {
  id: string;
  "Conference Name"?: string;
}

export interface Event {
  id: string;
  Name?: string;
  Datum?: string;
  Thema?: string;
  Beginn?: string;
  Ende?: string;
  Location?: Address;
  Plattformen?: Platform;
}

export interface Session {
  id: string;
  Sessiontitel?: string;
  "Session-Untertitel"?: string;
  Sessiontypus?: string[];
  Sessionsprache?: string;
  "Session Start Time"?: string;
  "Session End Time"?: string;
  "Start (from Sessions NEW)"?: string;
  "End (from Sessions NEW)"?: string;
  Room?: string;
  "Dauer in Minuten"?: number;
  Speaker?: Person[] | string[];
}

export interface Reise {
  id: string;
  Reisetyp?: string;
  "An/Abreise"?: string;
  Abreisezeit?: string;
  Abreiseort?: string;
  Ankunftszeit?: string;
  Ankunftsort?: string;
  "Flugnummer (1. Flug)"?: string;
  "Flugnummer (2. Flug)"?: string;
  "Flug Confirmation No"?: string;
  "Zugnummer / -verbindung"?: string;
  via?: string;
}

export interface Transfer {
  id: string;
  "Pick Up Time"?: string;
  "Drop Off Time"?: string;
  Bemerkung?: string;
  "Adresse (from Pick Up)"?: string | string[];
  "Adresse (from Drop Off)"?: string | string[];
}

export interface BackstageSlot {
  id: string;
  Title?: string;
  Type?: string;
  Startdate?: string;
  Enddate?: string;
  Duration?: number;
  Notes?: string;
  Description?: string;
}

export interface Referentenbetreuer {
  id: string;
  "First Name"?: string;
  "Last Name"?: string;
  "Phone Number"?: string;
  Sprachen?: string[];
}

// ---------------------------------------------------------------------------
// Root record
// ---------------------------------------------------------------------------

export interface Speaker {
  id: string;
  Person?: Person;
  Name: string;
  Event?: Event;
  Hotel?: Address;
  "Hotel Check-In"?: string;
  "Hotel Check-Out"?: string;
  "Hotel Confirmation Number"?: string;
  "Anmerkung zum Aufenthalt"?: string;
  Sessions?: Session[];
  Reisen?: Reise[];
  Transfers?: Transfer[];
  Backstage?: BackstageSlot[];
  Referentenbetreuer?: Referentenbetreuer;
  // Lookup field added directly in Airtable — returns an array of strings
  "Event Name"?: string[];
  "Speaker Name"?: string;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Recursively makes all fields optional — used for partial API responses. */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export type DeepPartialSpeaker = DeepPartial<Speaker>;
