// Define the base ScheduleType representing one entry of the array
export interface ScheduleItem {
  Reisetyp?: string;
  Abreiseort?: string;
  Ankunftsort?: string;
  end?: string;
  "Zugnummer / -verbindung"?: string;
  start?: string;
  via?: string;
  "An/Abreise"?: string;
  programtype?: string;
  Flugnummer?: string; // optional generic flight number - you may add exact keys if needed
  "Flugnummer (1. Flug)"?: string;
  "Flugnummer (2. Flug)"?: string;
  "Flug Confirmation No"?: string;
  Bemerkung?: string;
  "Adresse (from Drop Off)"?: string;
  "Adresse (from Pick Up)"?: string;
  id?: number;
  Title?: string;
  Type?: string;
  Notes?: string;
  Description?: string;
  "Confirmed Contributions"?: string[];
  Duration?: number;
  Event?: string[];
  Person?: string[];
  Sessiontitel?: string;
  Sessionart?: string;
  "Session-Untertitel"?: string;

  Room?: string;
  Sessionsprache?: string;
}

// Then define ScheduleType as array of partial ScheduleItem
export type ScheduleType = ScheduleItem[];

// Alternatively, to make sure everything deeply optional, you could apply a DeepPartial utility like:

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepPartialScheduleItemType = DeepPartial<ScheduleItem>;
export type DeepPartialScheduleType = DeepPartial<ScheduleItem>[];
