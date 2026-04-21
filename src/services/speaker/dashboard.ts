import { unstable_cache } from "next/cache";
import { base, getRecords } from "../airtable";
import { directus } from "../directus";
import { readField, readItems } from "@directus/sdk";
import type { Address } from "@/types/speaker";

export type UpcomingEvent = {
  id: string;

  name: string;
  date: string | undefined; // ISO-String, unverändert aus Airtable
  speakerCount: number;
};

async function _getUpcomingEvents(limit: number = 3): Promise<UpcomingEvent[]> {
  const events = await base("Events")
    .select({
      filterByFormula: "IS_AFTER({Datum}, DATEADD(TODAY(), -1, 'days'))",
      sort: [{ field: "Datum", direction: "asc" }],
      maxRecords: limit,
      fields: ["Name", "Datum", "Anzahl (Speakers Bestätigt)"],
    })
    .all();

  return events.map((e) => ({
    id: e.id,
    name: e.fields["Name"] as string,
    date: e.fields["Datum"] as string | undefined,
    speakerCount:
      (e.fields["Anzahl (Speakers Bestätigt)"] as number | undefined) ?? 0,
  }));
}

/** Cached version – revalidates every 60 seconds. */
export const getUpcomingEvents = (limit: number = 3) =>
  unstable_cache(
    () => _getUpcomingEvents(limit),
    [`dashboard-upcoming-events-${limit}`],
    { revalidate: 60 },
  )();

// ───────────────────────────────────────────────────────────────
// alle Events mit Directus-Verknüpfungs-Info
// ───────────────────────────────────────────────────────────────

export type EventListItem = {
  id: string;
  name: string;
  date: string | undefined; // ← geändert (war: string)
  speakerCount: number;
  platformName: string | undefined;
  hasDirectusConfig: boolean;
};

async function _getAllEvents(): Promise<EventListItem[]> {
  const [airtableEvents, directusEvents] = await Promise.all([
    base("Events")
      .select({
        sort: [{ field: "Datum", direction: "desc" }],
        fields: [
          "Name",
          "Datum",
          "Anzahl (Speakers Bestätigt)",
          "platform_name", // ← neu
        ],
      })
      .all(),
    directus.request(
      readItems("events", {
        fields: ["airtable_id"],
        limit: -1,
      }),
    ),
  ]);

  const directusIds = new Set(
    directusEvents
      .map((e) => e.airtable_id)
      .filter((id): id is string => Boolean(id)),
  );

  return airtableEvents.map((e) => {
    // platform_name ist ein Lookup — kommt als string[] zurück
    const platformLookup = e.fields["platform_name"] as string[] | undefined;
    const platformName = platformLookup?.[0];

    return {
      id: e.id,
      name: e.fields["Name"] as string,
      date: e.fields["Datum"] as string | undefined,
      speakerCount:
        (e.fields["Anzahl (Speakers Bestätigt)"] as number | undefined) ?? 0,
      platformName,
      hasDirectusConfig: directusIds.has(e.id),
    };
  });
}

export const getAllEvents = () =>
  unstable_cache(_getAllEvents, ["dashboard-all-events"], {
    revalidate: 60,
  })();

export type EventConfig = {
  directusId: string;
  themeId: string | null;
  contentDisplay: string[];
  accessPassword: string | null;
};

export type EventDetail = {
  id: string;
  name: string;
  date: string | undefined;
  endDate: string | undefined;
  theme: string | undefined;
  platformName: string | undefined;
  location: Address | null;
  speakerCount: number;
  config: EventConfig | null;
};

export type ThemeOption = {
  id: string;
  name: string | undefined;
  primaryColor: string | undefined;
  secondaryColor: string | undefined;
  background: string | undefined; // ← neu
  foreground: string | undefined; // ← neu
};

export type ContentDisplayOption = {
  value: string;
  label: string;
};

async function _getEvent(id: string): Promise<EventDetail | null> {
  const records = await base("Events")
    .select({
      filterByFormula: `RECORD_ID()='${id}'`,
      maxRecords: 1,
      fields: [
        "Name",
        "Datum",
        "Ende",
        "Thema",
        "platform_name",
        "Location",
        "Anzahl (Speakers Bestätigt)",
      ],
    })
    .firstPage();

  if (!records.length) return null;
  const root = records[0];

  const locationId = (root.fields["Location"] as string[] | undefined)?.[0];

  const [location, directusEvents] = await Promise.all([
    locationId
      ? base("Orte")
          .select({
            filterByFormula: `RECORD_ID()='${locationId}'`,
            maxRecords: 1,
            fields: ["Name", "Strasse", "Hausnummer", "PLZ", "Stadt", "Land"],
          })
          .firstPage()
          .then((r) =>
            r[0] ? ({ id: r[0].id, ...r[0].fields } as Address) : null,
          )
      : Promise.resolve(null),
    directus.request(
      readItems("events", {
        filter: { airtable_id: { _eq: id } },
        fields: ["id", "theme", "content_display", "access_password"],
        limit: 1,
      }),
    ),
  ]);

  const directusRecord = directusEvents[0];
  const config: EventConfig | null = directusRecord
    ? {
        directusId: String(directusRecord.id),
        themeId: directusRecord.theme ? String(directusRecord.theme) : null,
        contentDisplay: Array.isArray(directusRecord.content_display)
          ? directusRecord.content_display
          : [],
        accessPassword: directusRecord.access_password ?? null,
      }
    : null;

  const platformLookup = root.fields["platform_name"] as string[] | undefined;

  return {
    id: root.id,
    name: root.fields["Name"] as string,
    date: root.fields["Datum"] as string | undefined,
    endDate: root.fields["Ende"] as string | undefined,
    theme: root.fields["Thema"] as string | undefined,
    platformName: platformLookup?.[0],
    location,
    speakerCount:
      (root.fields["Anzahl (Speakers Bestätigt)"] as number | undefined) ?? 0,
    config,
  };
}

export const getEvent = (id: string) =>
  unstable_cache(() => _getEvent(id), [`event-detail-${id}`], {
    revalidate: 60,
  })();

async function _getAllThemes(): Promise<ThemeOption[]> {
  const themes = await directus.request(
    readItems("themes", {
      fields: [
        "id",
        "theme_name",
        "primary_color",
        "secondary_color",
        "background",
        "foreground",
      ],
      limit: -1,
    }),
  );

  return themes.map((t) => ({
    id: String(t.id),
    name: t.theme_name as string | undefined,
    primaryColor: t.primary_color as string | undefined,
    secondaryColor: t.secondary_color as string | undefined,
    background: t.background as string | undefined,
    foreground: t.foreground as string | undefined,
  }));
}

export const getAllThemes = () =>
  unstable_cache(_getAllThemes, ["all-themes"], {
    revalidate: 60,
  })();

async function _getContentDisplayOptions(): Promise<ContentDisplayOption[]> {
  const field = await directus.request(readField("events", "content_display"));

  //console.log("DEBUG content_display field:", JSON.stringify(field, null, 2));

  const choices =
    (field?.meta?.options?.choices as
      | { text: string; value: string }[]
      | undefined) ?? [];

  return choices.map((c) => ({
    value: c.value,
    label: c.text,
  }));
}
export const getContentDisplayOptions = () =>
  unstable_cache(_getContentDisplayOptions, ["content-display-options"], {
    revalidate: 3600,
  })();

export type GlobalDashboardData = {
  totalSpeakers: number;
  upcomingEvents: number;
  nextEvents: {
    id: string;
    name: string;
    date: string | undefined;
    speakerCount: number;
    daysUntil: number;
  }[];
};

async function _getGlobalDashboard(): Promise<GlobalDashboardData> {
  const allEvents = await _getAllEvents();

  const upcoming = allEvents.filter((e) => {
    if (!e.date) return false;
    const [year, month, day] = e.date.slice(0, 10).split("-").map(Number);
    const eventDate = new Date(year, month - 1, day, 12, 0, 0);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(0, 0, 0, 0);
    return eventDate >= cutoff;
  });

  const sorted = [...upcoming].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? ""),
  );

  const nextThree = sorted.slice(0, 3).map((event) => {
    let daysUntil = 0;
    if (event.date) {
      const [y, m, d] = event.date.slice(0, 10).split("-").map(Number);
      const eventDate = new Date(y, m - 1, d, 12, 0, 0);
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      daysUntil = Math.max(
        0,
        Math.round((eventDate.getTime() - now.getTime()) / 86400000),
      );
    }
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      speakerCount: event.speakerCount,
      daysUntil,
    };
  });

  // Speaker gesamt: alle Contributions zählen
  const allContributions = await base("Confirmed Contributions")
    .select({ fields: [] })
    .all();

  return {
    totalSpeakers: allContributions.length,
    upcomingEvents: upcoming.length,
    nextEvents: nextThree,
  };
}

export const getGlobalDashboard = () =>
  unstable_cache(_getGlobalDashboard, ["global-dashboard"], {
    revalidate: 60,
  })();

export type MetricBucket = {
  label: string;
  count: number;
};

export type EventMetrics = {
  totalSpeakers: number;
  gender: MetricBucket[];
  country: MetricBucket[];
  category: MetricBucket[];
  language: MetricBucket[];
};

async function _getEventMetrics(airtableId: string): Promise<EventMetrics> {
  // Contributions aus Airtable (robust, wie in der Speaker-Liste)
  const allContributions = (await getRecords(
    "Confirmed Contributions",
  )) as (Record<string, unknown> & {
    id: string;
    Event?: string[];
    Person?: string[];
  })[];

  // Filter: nur Contributions, die auf dieses Event verweisen
  const forEvent = allContributions.filter((c) =>
    (c.Event ?? []).includes(airtableId),
  );

  const personIds = forEvent.flatMap((c) => c.Person ?? []).filter(Boolean);

  if (personIds.length === 0) {
    return {
      totalSpeakers: 0,
      gender: [],
      country: [],
      category: [],
      language: [],
    };
  }

  const uniqueIds = Array.from(new Set(personIds));
  const kontakte = await fetchKontakteInBatches(uniqueIds);

  const gender = countSingleValues(kontakte, "Geschlecht");
  const category = countArrayValues(kontakte, "Speakerkategorie");
  const country = countArrayValues(kontakte, "Land");
  const language = countArrayValues(kontakte, "Sprachen");

  return {
    totalSpeakers: uniqueIds.length,
    gender,
    country,
    category,
    language,
  };
}

async function fetchKontakteInBatches(
  ids: string[],
): Promise<Record<string, unknown>[]> {
  const BATCH = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    chunks.push(ids.slice(i, i + BATCH));
  }

  const results = await Promise.all(
    chunks.map((chunk) => {
      const formula = `OR(${chunk.map((id) => `RECORD_ID()='${id}'`).join(",")})`;
      return base("Kontakte")
        .select({
          filterByFormula: formula,
          fields: ["Geschlecht", "Speakerkategorie", "Land", "Sprachen"],
        })
        .all();
    }),
  );

  return results.flat().map((r) => r.fields);
}

function countSingleValues(
  records: Record<string, unknown>[],
  field: string,
): MetricBucket[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const value = r[field] as string | undefined;
    if (value) {
      map.set(value, (map.get(value) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countArrayValues(
  records: Record<string, unknown>[],
  field: string,
): MetricBucket[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const values = r[field] as string[] | undefined;
    if (Array.isArray(values)) {
      for (const v of values) {
        if (v) map.set(v, (map.get(v) ?? 0) + 1);
      }
    }
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export const getEventMetrics = (airtableId: string) =>
  unstable_cache(
    () => _getEventMetrics(airtableId),
    [`event-metrics-v2-${airtableId}`],
    { revalidate: 60 },
  )();
