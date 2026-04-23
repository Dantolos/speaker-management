"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CalendarEvent } from "@/services/speaker/eventCalendars";
import MonthView from "./MonthView";
import YearView from "./YearView";

type ViewMode = "month" | "year";

export default function CalendarView({
  events,
  locale,
}: {
  events: CalendarEvent[];
  locale: string;
}) {
  const t = useTranslations("EventsOverview");
  const today = new Date();
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex rounded-lg border border-[var(--color-border-tertiary,#e5e5e5)] p-0.5 text-sm">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-1.5 rounded-md transition ${
              view === "month"
                ? "bg-[var(--color-box-background)] font-medium shadow-sm"
                : "text-[var(--color-text-secondary,#666)]"
            }`}
          >
            {t("viewMonth")}
          </button>
          <button
            onClick={() => setView("year")}
            className={`px-4 py-1.5 rounded-md transition ${
              view === "year"
                ? "bg-[var(--color-box-background)] font-medium shadow-sm"
                : "text-[var(--color-text-secondary,#666)]"
            }`}
          >
            {t("viewYear")}
          </button>
        </div>
      </div>

      {view === "month" ? (
        <MonthView
          events={events}
          year={cursor.year}
          month={cursor.month}
          onNav={(y, m) => setCursor({ year: y, month: m })}
          onSwitchToYear={() => setView("year")}
          locale={locale}
        />
      ) : (
        <YearView
          events={events}
          year={cursor.year}
          onNav={(y) => setCursor({ year: y, month: cursor.month })}
          onPickMonth={(m) => {
            setCursor({ year: cursor.year, month: m });
            setView("month");
          }}
          locale={locale}
        />
      )}
    </div>
  );
}
