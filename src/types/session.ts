export type Session = {
  id: string;
  title: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  room: string | null;
  eventId: string | null;
  eventName: string | null;
};

export type SessionsByDay = {
  date: string; // YYYY-MM-DD
  sessions: Session[];
};

export type ProgramData = {
  days: SessionsByDay[];
  rooms: string[]; // unique, sortiert
  minHour: number; // früheste Stunde im Programm (z.B. 8)
  maxHour: number; // späteste Stunde (z.B. 18)
};
