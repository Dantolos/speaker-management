import { unstable_cache } from "next/cache";
import { base, FIELDS } from "@/services/airtable";
import type { Session, ProgramData, SessionsByDay } from "@/types/session";

type RawSessionFields = {
  Sessiontitel?: string;
  "Session-Untertitel"?: string;
  "Session Description"?: string;
  Sessiontypus?: string[];
  Sessionsprache?: string;
  session_start_timedate?: string[]; // Lookup
  session_end_timedate?: string[]; // Lookup
  Room?: string;
  "Raum (from Sessions NEW)"?: string[];
  "Dauer in Minuten"?: number;
  Speaker?: string[];
  Event?: string[];
};

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function firstLookup(arr: string[] | undefined): string {
  return arr?.[0] ?? "";
}

function pickRoom(
  primary: string | undefined,
  lookup: string[] | undefined,
): string | null {
  if (primary && primary.trim() !== "") return primary;
  if (lookup && lookup.length > 0 && lookup[0]) return lookup[0];
  return null;
}

function mapRecordToSession(r: {
  id: string;
  fields: RawSessionFields;
}): Session {
  const f = r.fields;
  return {
    id: r.id,
    title: f.Sessiontitel ?? "",
    startTime: firstLookup(f.session_start_timedate),
    endTime: firstLookup(f.session_end_timedate),
    room: pickRoom(f.Room, f["Raum (from Sessions NEW)"]),
    eventId: f.Event?.[0] ?? null,
    eventName: null,
  };
}

async function _getEventProgram(eventId: string): Promise<ProgramData> {
  const records = await base("Sessions")
    .select({ pageSize: 100, fields: FIELDS.Sessions as unknown as string[] })
    .all();

  const allSessions = records.map((r) =>
    mapRecordToSession({ id: r.id, fields: r.fields as RawSessionFields }),
  );

  const sessions: Session[] = allSessions.filter(
    (s) => s.eventId === eventId && s.startTime && s.endTime,
  );

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

  const rooms = Array.from(
    new Set(
      sessions
        .map((s) => s.room)
        .filter((r): r is string => !!r && r.trim() !== ""),
    ),
  ).sort();

  let minHour = 24;
  let maxHour = 0;
  sessions.forEach((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    minHour = Math.min(minHour, start.getHours());
    maxHour = Math.max(
      maxHour,
      end.getHours() + (end.getMinutes() > 0 ? 1 : 0),
    );
  });
  if (minHour === 24) {
    minHour = 8;
    maxHour = 18;
  } else {
    minHour = Math.max(0, minHour - 1);
    maxHour = Math.min(24, maxHour + 1);
  }

  return { days, rooms, minHour, maxHour };
}

export const getEventProgram = (eventId: string) =>
  unstable_cache(
    () => _getEventProgram(eventId),
    ["event-program-v5", eventId],
    {
      revalidate: 60,
      tags: ["sessions", `event-${eventId}`],
    },
  )();

// =============================================================================
// Einzelne Session-Details (für Drawer + Full-Page)
// =============================================================================

export type SessionDetail = Session & {
  subtitle: string | null;
  description: string | null;
  language: string | null;
  durationMinutes: number | null;
  speakerIds: string[];
  speakerNames: string[];
};

type RawKontaktFields = {
  "Speaker Name"?: string;
  "First Name"?: string;
  "Last Name"?: string;
};

async function fetchSpeakerNames(ids: string[]): Promise<string[]> {
  if (!ids.length) return [];
  try {
    const formula =
      ids.length === 1
        ? `RECORD_ID()='${ids[0]}'`
        : `OR(${ids.map((i) => `RECORD_ID()='${i}'`).join(",")})`;
    const records = await base("Kontakte")
      .select({
        filterByFormula: formula,
        fields: ["Speaker Name", "First Name", "Last Name"],
      })
      .all();
    const map = new Map<string, string>();
    records.forEach((r) => {
      const f = r.fields as RawKontaktFields;
      const name =
        f["Speaker Name"] ??
        [f["First Name"], f["Last Name"]].filter(Boolean).join(" ") ??
        "";
      map.set(r.id, name);
    });
    return ids.map((id) => map.get(id) ?? id);
  } catch (err) {
    console.warn("fetchSpeakerNames failed:", err);
    return ids;
  }
}

async function _getSession(id: string): Promise<SessionDetail | null> {
  try {
    const record = await base("Sessions").find(id);
    const f = record.fields as RawSessionFields & Record<string, unknown>;

    const startTime = firstLookup(f.session_start_timedate);
    const endTime = firstLookup(f.session_end_timedate);

    if (!startTime || !endTime) {
      console.warn(
        `getSession: ${id} hat keine Start/End Time. Verfügbare Felder:`,
        Object.keys(f),
      );
      return null;
    }

    const speakerIds = f.Speaker ?? [];
    const speakerNames = speakerIds.length
      ? await fetchSpeakerNames(speakerIds)
      : [];

    return {
      id: record.id,
      title: f.Sessiontitel ?? "",
      subtitle: f["Session-Untertitel"] ?? null,
      description: f["Session Description"] ?? null,
      language: f.Sessionsprache ?? null,
      durationMinutes: f["Dauer in Minuten"] ?? null,
      startTime,
      endTime,
      room: pickRoom(f.Room, f["Raum (from Sessions NEW)"]),
      eventId: f.Event?.[0] ?? null,
      eventName: null,
      speakerIds,
      speakerNames,
    };
  } catch (err) {
    console.error("getSession failed for id", id, err);
    return null;
  }
}

export const getSession = (id: string) =>
  unstable_cache(() => _getSession(id), ["session-detail-v3", id], {
    revalidate: 60,
    tags: ["sessions", `session-${id}`],
  })();
