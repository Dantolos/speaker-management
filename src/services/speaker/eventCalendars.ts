import { unstable_cache } from "next/cache";
import { readItems } from "@directus/sdk";
import { getRecords } from "@/services/airtable";
import { directus } from "@/services/directus";

export type CalendarEvent = {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (inclusive)
  location: string | null;
  speakerCount: number;
  colorIndex: number;
  themeColor: string | null; // primary color aus Directus theme
  themeBackground: string | null; // leichter Hintergrund, abgeleitet
};

function toDateKey(input: unknown): string | null {
  if (!input) return null;
  if (typeof input !== "string" && !(input instanceof Date)) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pickField(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function firstString(v: unknown): string | null {
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : null;
  if (typeof v === "string") return v;
  return null;
}

// Konvertiert Hex-Farbe zu RGBA mit Alpha für Hintergrund-Tint
function hexToTint(hex: string, alpha = 0.15): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some(isNaN)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type DirectusEventWithTheme = {
  airtable_id: string;
  theme?: {
    primary_color?: string;
    secondary_color?: string;
  } | null;
};

async function fetchDirectusThemeMap(): Promise<Map<string, string>> {
  try {
    const items = (await directus.request(
      readItems("events", {
        fields: [
          "airtable_id",
          { theme: ["primary_color", "secondary_color"] },
        ],
        limit: -1,
      }),
    )) as DirectusEventWithTheme[];

    const map = new Map<string, string>();
    items.forEach((it) => {
      const color =
        it.theme?.primary_color ?? it.theme?.secondary_color ?? null;
      if (it.airtable_id && color) map.set(it.airtable_id, color);
    });
    return map;
  } catch (err) {
    console.warn("Directus theme fetch failed:", err);
    return new Map();
  }
}

async function _getCalendarEvents(): Promise<CalendarEvent[]> {
  const [records, themeMap] = await Promise.all([
    getRecords("Events") as Promise<unknown[]>,
    fetchDirectusThemeMap(),
  ]);

  const events: CalendarEvent[] = records
    .map((r): CalendarEvent | null => {
      const rec = r as Record<string, unknown>;
      const fields = (rec.fields as Record<string, unknown> | undefined) ?? rec;

      const id = (rec.id as string) ?? "";
      if (!id) return null;

      const start =
        toDateKey(pickField(fields, "Beginn", "Start", "Datum")) ?? null;
      const end = toDateKey(pickField(fields, "Ende", "End")) ?? start;

      if (!start || !end) return null;

      const name =
        (pickField(fields, "Name", "event_name", "Event Name") as string) ??
        "(ohne Titel)";

      const location =
        firstString(
          pickField(
            fields,
            "Location_Name (from Location)",
            "Location (from Location)",
            "Location Name",
          ),
        ) ?? firstString(pickField(fields, "Location", "Ort"));

      const speakerCountRaw = pickField(fields, "Speakers Bestätigt", "Anzahl");
      const speakerCount = Number(speakerCountRaw ?? 0) || 0;

      const themeColor = themeMap.get(id) ?? null;
      const themeBackground = themeColor ? hexToTint(themeColor, 0.18) : null;

      return {
        id,
        name,
        start,
        end,
        location: location ?? null,
        speakerCount,
        colorIndex: 0,
        themeColor,
        themeBackground,
      };
    })
    .filter((e): e is CalendarEvent => e !== null)
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((e, i) => ({ ...e, colorIndex: i }));

  return events;
}

export const getCalendarEvents = unstable_cache(
  _getCalendarEvents,
  ["calendar-events-v3"],
  { revalidate: 60, tags: ["events"] },
);
