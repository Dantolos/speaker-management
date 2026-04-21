import type { getFormatter } from "next-intl/server";

type Formatter = Awaited<ReturnType<typeof getFormatter>>;

/**
 * Formatiert ein Airtable-Datum ("2026-04-23" oder ISO-Datetime)
 * zeitzonenunabhängig.
 */
export function formatEventDate(
  format: Formatter,
  isoDate: string | undefined,
): string {
  if (!isoDate) return "—";

  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);

  // Lokale Konstruktion statt UTC-Parsing → keine Timezone-Shifts
  const date = new Date(year, month - 1, day, 12, 0, 0);
  //const now = new Date();
  //const sameYear = date.getFullYear() === now.getFullYear();

  return format.dateTime(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
