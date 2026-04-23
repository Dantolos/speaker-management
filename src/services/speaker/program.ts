import { unstable_cache } from "next/cache";
import { base, FIELDS } from "@/services/airtable";
import type { Session, ProgramData, SessionsByDay } from "@/types/session";

type RawSessionFields = {
  Sessiontitel?: string;
  session_start_timedate?: string[];
  session_end_timedate?: string[];
  Room?: string;
  Event?: string[];
};

function toLocalDateKey(iso: string): string {
  // YYYY-MM-DD basierend auf lokaler Zeit (Airtable liefert UTC)
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function _getEventProgram(eventId: string): Promise<ProgramData> {
  // Alle Sessions laden und serverseitig filtern — Link-Filter in filterByFormula
  // ist laut Projekt-Konventionen unzuverlässig.

  const records = await base("Sessions")
    .select({ fields: FIELDS.Sessions as unknown as string[] })
    .all();
  const sessions: Session[] = records
    .map((r) => {
      const f = r.fields as RawSessionFields;

      return {
        id: r.id,
        title: f.Sessiontitel ?? "",
        startTime: f["session_start_timedate"]
          ? f["session_start_timedate"][0]
          : "",
        endTime: f["session_end_timedate"] ? f["session_end_timedate"][0] : "",
        room: f.Room ?? null,
        eventId: f.Event?.[0] ?? null,
        eventName: null,
      };
    })
    .filter((s) => s.eventId === eventId && s.startTime && s.endTime);
  // Nach Tag gruppieren (lokale Zeit)
  const byDay = new Map<string, Session[]>();
  sessions.forEach((s) => {
    const key = toLocalDateKey(s.startTime);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s);
  });

  const days: SessionsByDay[] = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      sessions: list.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));

  // Räume (nur nicht-leere, unique, alphabetisch)
  const rooms = Array.from(
    new Set(
      sessions
        .map((s) => s.room)
        .filter((r): r is string => !!r && r.trim() !== ""),
    ),
  ).sort();

  // Zeitbereich ermitteln (min/max Stunden) — 1h Puffer oben/unten
  let minHour = 24;
  let maxHour = 0;
  sessions.forEach((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    minHour = Math.min(minHour, start.getHours());
    maxHour = Math.max(
      maxHour,
      end.getHours() + (end.getMinutes() > 0 ? 1 : 0),
    );
  });
  if (minHour === 24) minHour = 8;
  if (maxHour === 0) maxHour = 18;
  minHour = Math.max(0, minHour);
  maxHour = Math.min(24, maxHour);

  return { days, rooms, minHour, maxHour };
}

export const getEventProgram = (eventId: string) =>
  unstable_cache(
    () => _getEventProgram(eventId),
    ["event-program-v2", eventId],
    {
      revalidate: 60,
      tags: ["sessions", `event-${eventId}`],
    },
  )();
