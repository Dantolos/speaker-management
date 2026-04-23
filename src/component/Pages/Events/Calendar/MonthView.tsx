"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colorFor } from "@/utils/eventColors";
import type { CalendarEvent } from "@/services/speaker/eventCalendars";

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Segment = {
  event: CalendarEvent;
  col: number;
  span: number;
  weekIdx: number;
  isStart: boolean;
  isEnd: boolean;
  lane: number;
};

function parseLocal(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const ROW_MIN_HEIGHT = 100;
const LANE_HEIGHT = 22;
const LANE_TOP_OFFSET = 28;

export default function MonthView({
  events,
  year,
  month,
  onNav,
  locale,
}: {
  events: CalendarEvent[];
  year: number;
  month: number;
  onNav: (y: number, m: number) => void;
  onSwitchToYear: () => void;
  locale: string;
}) {
  const t = useTranslations("EventsOverview");
  const MONTHS = locale === "de" ? MONTHS_DE : MONTHS_EN;
  const DAYS = locale === "de" ? DAYS_DE : DAYS_EN;

  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -startDow);

  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(addDays(gridStart, w * 7 + d));
    }
    weeks.push(row);
  }

  const segmentsPerWeek: Segment[][] = weeks.map((week, weekIdx) => {
    const weekStart = week[0];
    const weekEnd = week[6];
    const weekSegs: Segment[] = [];

    events.forEach((ev) => {
      const s = parseLocal(ev.start);
      const e = parseLocal(ev.end);
      if (e < weekStart || s > weekEnd) return;

      const segStart = s < weekStart ? weekStart : s;
      const segEnd = e > weekEnd ? weekEnd : e;
      const col = Math.round(
        (segStart.getTime() - weekStart.getTime()) / 86400000,
      );
      const span =
        Math.round((segEnd.getTime() - segStart.getTime()) / 86400000) + 1;

      weekSegs.push({
        event: ev,
        col,
        span,
        weekIdx,
        isStart: toKey(segStart) === ev.start,
        isEnd: toKey(segEnd) === ev.end,
        lane: 0,
      });
    });

    weekSegs.sort((a, b) => a.col - b.col || a.span - b.span);
    const lanes: Array<number> = [];
    weekSegs.forEach((seg) => {
      let assigned = -1;
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] <= seg.col) {
          assigned = i;
          lanes[i] = seg.col + seg.span;
          break;
        }
      }
      if (assigned === -1) {
        lanes.push(seg.col + seg.span);
        assigned = lanes.length - 1;
      }
      seg.lane = assigned;
    });

    return weekSegs;
  });

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    onNav(y, m);
  }
  function goToday() {
    const today = new Date();
    onNav(today.getFullYear(), today.getMonth());
  }

  const todayKey = toKey(new Date());

  const gridCols7: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => changeMonth(-1)}
            style={btnIcon}
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 18, fontWeight: 500, minWidth: 180 }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            style={btnIcon}
            aria-label="Nächster Monat"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={goToday} style={btnText}>
          {t("today")}
        </button>
      </div>

      <div
        style={{
          border: "1px solid var(--color-border-tertiary, #e5e5e5)",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "var(--color-box-background)",
        }}
      >
        {/* Wochentage-Header */}
        <div
          style={{
            ...gridCols7,
            borderBottom: "1px solid var(--color-border-tertiary, #e5e5e5)",
            backgroundColor: "var(--color-background-secondary, #fafafa)",
          }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center",
                padding: "8px 0",
                color: "var(--color-text-secondary, #666)",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wIdx) => {
          const segs = segmentsPerWeek[wIdx];
          const maxLane = segs.reduce((m, s) => Math.max(m, s.lane), -1);
          const rowHeight = Math.max(
            ROW_MIN_HEIGHT,
            LANE_TOP_OFFSET + (maxLane + 1) * LANE_HEIGHT + 8,
          );

          return (
            <div
              key={wIdx}
              style={{
                ...gridCols7,
                position: "relative",
                borderBottom:
                  wIdx < weeks.length - 1
                    ? "1px solid var(--color-border-tertiary, #e5e5e5)"
                    : "none",
                minHeight: rowHeight,
              }}
            >
              {week.map((date, dIdx) => {
                const inMonth = date.getMonth() === month;
                const isToday = toKey(date) === todayKey;
                return (
                  <div
                    key={date.toISOString()}
                    style={{
                      borderRight:
                        dIdx < 6
                          ? "1px solid var(--color-border-tertiary, #e5e5e5)"
                          : "none",
                      padding: 6,
                      backgroundColor: inMonth
                        ? "transparent"
                        : "var(--color-background-secondary, #fafafa)",
                      opacity: inMonth ? 1 : 0.6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...(isToday
                          ? {
                              backgroundColor: "var(--color-primary)",
                              color: "#fff",
                              borderRadius: "50%",
                              fontWeight: 500,
                            }
                          : inMonth
                            ? { color: "var(--color-font-primary)" }
                            : { color: "var(--color-text-tertiary, #aaa)" }),
                      }}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}

              {/* Event-Balken */}
              {segs.map((seg, i) => {
                const fallback = colorFor(seg.event.colorIndex);
                const primary = seg.event.themeColor ?? fallback.fg;
                const background = seg.event.themeBackground ?? fallback.bg;
                const top = LANE_TOP_OFFSET + seg.lane * LANE_HEIGHT;
                const leftPct = (seg.col / 7) * 100;
                const widthPct = (seg.span / 7) * 100;

                return (
                  <Link
                    key={`${seg.event.id}-${i}`}
                    href={`/${locale}/events/${seg.event.id}`}
                    style={{
                      position: "absolute",
                      top,
                      left: `calc(${leftPct}% + 4px)`,
                      width: `calc(${widthPct}% - 8px)`,
                      height: 20,
                      fontSize: 11,
                      padding: "2px 8px",
                      backgroundColor: background,
                      color: primary,
                      borderLeft: seg.isStart ? `3px solid ${primary}` : "none",
                      borderRadius:
                        seg.isStart && seg.isEnd
                          ? 4
                          : seg.isStart
                            ? "4px 0 0 4px"
                            : seg.isEnd
                              ? "0 4px 4px 0"
                              : 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title={`${seg.event.name}${seg.event.location ? " · " + seg.event.location : ""}`}
                  >
                    {seg.event.name}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
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
