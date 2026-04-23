"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colorFor } from "@/utils/eventColors";
import type { CalendarEvent } from "@/services/speaker/eventCalendars";

const MONTHS_DE = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];
const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseLocal(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.round((d.getTime() - start.getTime()) / 86400000);
}

export default function YearView({
  events,
  year,
  onNav,
  onPickMonth,
  locale,
}: {
  events: CalendarEvent[];
  year: number;
  onNav: (y: number) => void;
  onPickMonth: (m: number) => void;
  locale: string;
}) {
  const t = useTranslations("EventsOverview");
  const MONTHS = locale === "de" ? MONTHS_DE : MONTHS_EN;

  const yearEvents = events.filter((ev) => {
    const s = parseLocal(ev.start);
    const e = parseLocal(ev.end);
    return s.getFullYear() === year || e.getFullYear() === year;
  });

  const eventsByDate = new Map<string, CalendarEvent[]>();
  yearEvents.forEach((ev) => {
    const s = parseLocal(ev.start);
    const e = parseLocal(ev.end);
    const cur = new Date(s);
    while (cur <= e) {
      if (cur.getFullYear() === year) {
        const key = `${cur.getMonth()}-${cur.getDate()}`;
        if (!eventsByDate.has(key)) eventsByDate.set(key, []);
        eventsByDate.get(key)!.push(ev);
      }
      cur.setDate(cur.getDate() + 1);
    }
  });

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap ? 366 : 365;

  type Lane = {
    event: CalendarEvent;
    startDoy: number;
    endDoy: number;
    lane: number;
  };
  const lanes: Lane[] = yearEvents
    .map((ev) => {
      const s = parseLocal(ev.start);
      const e = parseLocal(ev.end);
      const startDoy = s.getFullYear() === year ? dayOfYear(s) - 1 : 0;
      const endDoy =
        e.getFullYear() === year ? dayOfYear(e) - 1 : totalDays - 1;
      return { event: ev, startDoy, endDoy, lane: 0 };
    })
    .sort((a, b) => a.startDoy - b.startDoy);

  const laneEnds: number[] = [];
  lanes.forEach((l) => {
    let assigned = -1;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] < l.startDoy) {
        assigned = i;
        laneEnds[i] = l.endDoy;
        break;
      }
    }
    if (assigned === -1) {
      laneEnds.push(l.endDoy);
      assigned = laneEnds.length - 1;
    }
    l.lane = assigned;
  });

  const maxLane = Math.max(0, ...lanes.map((l) => l.lane));
  const timelineBarHeight = (maxLane + 1) * 24;

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  const todayYear = today.getFullYear();

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => onNav(year - 1)}
            style={btnIcon}
            aria-label="Vorheriges Jahr"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {year}
          </span>
          <button
            onClick={() => onNav(year + 1)}
            style={btnIcon}
            aria-label="Nächstes Jahr"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={() => onNav(new Date().getFullYear())} style={btnText}>
          {t("today")}
        </button>
      </div>

      {/* Timeline */}
      <div
        style={{
          border: "1px solid var(--color-border-tertiary, #e5e5e5)",
          borderRadius: 8,
          padding: 16,
          backgroundColor: "var(--color-box-background)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-text-secondary, #666)",
            marginBottom: 12,
          }}
        >
          {t("timeline")}
        </div>

        {/* Monats-Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            borderBottom: "1px solid var(--color-border-tertiary, #e5e5e5)",
          }}
        >
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => onPickMonth(i)}
              style={{
                textAlign: "left",
                padding: "6px 8px",
                fontSize: 11,
                color: "var(--color-text-secondary, #666)",
                borderRight:
                  i < 11
                    ? "1px solid var(--color-border-tertiary, #e5e5e5)"
                    : "none",
                background: "transparent",
                border: "none",
                borderBottom: "none",
                cursor: "pointer",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Event-Balken */}
        <div
          style={{
            position: "relative",
            height: Math.max(48, timelineBarHeight + 8),
            marginTop: 8,
          }}
        >
          {todayYear === year && (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: "var(--color-primary)",
                opacity: 0.6,
                left: `${((dayOfYear(today) - 1) / totalDays) * 100}%`,
                pointerEvents: "none",
              }}
            />
          )}
          {lanes.map((l, i) => {
            const fallback = colorFor(l.event.colorIndex);
            const primary = l.event.themeColor ?? fallback.fg;
            const background = l.event.themeBackground ?? fallback.bg;
            const leftPct = (l.startDoy / totalDays) * 100;
            const widthPct = ((l.endDoy - l.startDoy + 1) / totalDays) * 100;

            return (
              <Link
                key={`${l.event.id}-${i}`}
                href={`/${locale}/events/${l.event.id}`}
                style={{
                  position: "absolute",
                  top: l.lane * 24,
                  left: `${leftPct}%`,
                  width: `calc(${widthPct}% - 2px)`,
                  minWidth: 6,
                  height: 20,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: background,
                  color: primary,
                  borderLeft: `3px solid ${primary}`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                title={`${l.event.name} · ${l.event.start} – ${l.event.end}`}
              >
                {l.event.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 12 Mini-Monate */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {Array.from({ length: 12 }, (_, m) => (
          <MiniMonth
            key={m}
            year={year}
            month={m}
            monthName={MONTHS[m]}
            eventsByDate={eventsByDate}
            isCurrentMonth={todayYear === year && todayMonth === m}
            todayDate={todayDate}
            onClick={() => onPickMonth(m)}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  month,
  monthName,
  eventsByDate,
  isCurrentMonth,
  todayDate,
  onClick,
  locale,
}: {
  year: number;
  month: number;
  monthName: string;
  eventsByDate: Map<string, CalendarEvent[]>;
  isCurrentMonth: boolean;
  todayDate: number;
  onClick: () => void;
  locale: string;
}) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const dim = daysInMonth(year, month);
  const DAYS_MINI =
    locale === "de"
      ? ["M", "D", "M", "D", "F", "S", "S"]
      : ["M", "T", "W", "T", "F", "S", "S"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        border: "1px solid var(--color-border-tertiary, #e5e5e5)",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "var(--color-box-background)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 8,
          color: "var(--color-font-primary)",
        }}
      >
        {monthName}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 2,
          fontSize: 10,
          color: "var(--color-text-secondary, #888)",
          marginBottom: 4,
        }}
      >
        {DAYS_MINI.map((d, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 2,
        }}
      >
        {cells.map((d, i) => {
          if (d === null) return <div key={i} style={{ height: 24 }} />;
          const dayEvents = eventsByDate.get(`${month}-${d}`) ?? [];
          const isToday = isCurrentMonth && d === todayDate;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                height: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: 2,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isToday ? "#fff" : "var(--color-font-primary)",
                  ...(isToday
                    ? {
                        backgroundColor: "var(--color-primary)",
                        borderRadius: "50%",
                        fontWeight: 500,
                      }
                    : {}),
                }}
              >
                {d}
              </div>
              {dayEvents.length > 0 && (
                <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                  {dayEvents.slice(0, 3).map((ev, idx) => {
                    const fallback = colorFor(ev.colorIndex);
                    const dot = ev.themeColor ?? fallback.dot;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          backgroundColor: dot,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
}

const btnIcon: React.CSSProperties = {
  padding: 6,
  borderRadius: 6,
  border: "1px solid var(--color-border-tertiary, #e5e5e5)",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-font-primary)",
};

const btnText: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid var(--color-border-tertiary, #e5e5e5)",
  background: "transparent",
  cursor: "pointer",
  fontSize: 13,
  color: "var(--color-font-primary)",
};
