// types/speaker.ts

// DeepPartial utility type to recursively make fields optional
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Speaker {
  id?: string;
  Name?: string;
  Person?: {
    "Speaker Name": string;
    "Last Name": string;
    "First Name": string;
    Position: string;
    "Organisation / Unternehmen": Array<{
      Name: string;
    }>;
  };
  Event?:
    | {
        Name: string | undefined;
        Plattformen:
          | {
              "Conference Name": string | undefined;
            }
          | undefined;
        Datum: string;
        Thema: string;
        Ende: string;
        Beginn: string;
        Location:
          | {
              Name?: string;
              Strasse?: string;
              Hausnummer?: number;
              PLZ?: number;
              Stadt?: string;
              Land?: string;
            }
          | undefined;
      }
    | undefined;
  "Anmerkung zum Aufenthalt"?: string;
  Hotel?: {
    Name: string;
    Strasse: string;
    Hausnummer: number;
    PLZ: number;
    Stadt: string;
    Land: string;
  };
  "Hotel Check-In"?: string;
  "Hotel Check-Out"?: string;
  "Hotel Confirmation Number"?: string;
  Referentenbetreuer?: {
    "Phone Number": string;
    Sprachen?: string[];
    "Last Name": string;
    "First Name": string;
  };
  Sessions?: Array<{
    Room: string;
    "Session Start Time": string;
    "Session End Time": string;
    "Dauer in Minuten": number;
    Sessiontitel?: string;
    "Session-Untertitel"?: string;
    Sessionart?: string[];
    Sessionsprache?: string;
  }>;
  Reisen?: Array<{
    Reisetyp: string;
    Abreiseort: string;
    Ankunftsort: string;
    "Flugnummer (1. Flug)"?: string;
    Ankunftszeit: string;
    "Flug Confirmation No"?: string;
    Abreisezeit: string;
    via?: string;
    "An/Abreise": string;
    "Flugnummer (2. Flug)"?: string;
    "Zugnummer / -verbindung"?: string;
  }>;
  Transfers?: Array<{
    "Pick Up Time": string;
    "Drop Off Time": string;
    Bemerkung?: string;
    "Adresse (from Drop Off)"?: string[] | string;
    "Adresse (from Pick Up)"?: string[] | string;
  }>;
  "Backstage Timeslot"?: string[];
  Backstage?: Array<{
    id: string | number;
    Title: string;
    Type: string;
    Startdate: string;
    Enddate: string;
    Notes?: string;
    Description?: string;
    "Confirmed Contributions"?: string[];
    Duration: number;
    Event?: string[];
    Person?: string[];
  }>;
}

// Export DeepPartialSpeaker for convenience
export type DeepPartialSpeaker = DeepPartial<Speaker>;
