"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
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

const ZOOM_LEVELS = [1, 3, 6, 12] as const;
type ZoomLevel = (typeof ZOOM_LEVELS)[number];
const DEFAULT_ZOOM: ZoomLevel = 3;

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

  const [zoom, setZoom] = useState<ZoomLevel>(DEFAULT_ZOOM);
  const [viewportWidth, setViewportWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Viewport-Breite messen für Zoom-Berechnung
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Initiale Messung
    setViewportWidth(el.clientWidth);
    const ro = new ResizeObserver(() => {
      if (scrollRef.current) {
        setViewportWidth(scrollRef.current.clientWidth);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Logische Timeline-Breite: zeigt `zoom` Monate im Viewport.
  // Daher: totalWidth / 12 * zoom = viewportWidth → totalWidth = viewportWidth * 12 / zoom
  const timelineWidth = viewportWidth > 0 ? (viewportWidth * 12) / zoom : 0;

  // Monats-Spalten-Positionen (in px innerhalb der Timeline)
  const monthOffsets: number[] = [];
  let acc = 0;
  for (let m = 0; m < 12; m++) {
    monthOffsets.push((acc / totalDays) * timelineWidth);
    acc += daysInMonth(year, m);
  }
  monthOffsets.push(timelineWidth); // Ende des Jahres

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
  const timelineBarHeight = (maxLane + 1) * 26;

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  const todayYear = today.getFullYear();
  const todayDoy = todayYear === year ? dayOfYear(today) - 1 : -1;

  // Initial-Scroll zum heutigen Tag (oder Januar wenn kein "heute" im Jahr)
  useEffect(() => {
    if (!scrollRef.current || timelineWidth === 0) return;
    let scrollTo = 0;
    if (todayDoy >= 0) {
      const todayPos = (todayDoy / totalDays) * timelineWidth;
      // Heute zentriert im Viewport
      scrollTo = Math.max(0, todayPos - viewportWidth / 2);
    }
    scrollRef.current.scrollLeft = scrollTo;
    // Nur einmal beim Mount oder bei Year-Change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, viewportWidth, zoom]);

  function changeZoom(delta: number) {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    const next =
      ZOOM_LEVELS[Math.max(0, Math.min(ZOOM_LEVELS.length - 1, idx + delta))];
    if (next !== zoom) setZoom(next);
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNav(year - 1)}
            className="p-1.5 rounded-md border border-[var(--color-border-tertiary,#e5e5e5)] hover:bg-[var(--color-background-secondary,#f5f5f5)] cursor-pointer"
            aria-label="Vorheriges Jahr"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-lg font-medium min-w-[80px] text-center">
            {year}
          </span>
          <button
            onClick={() => onNav(year + 1)}
            className="p-1.5 rounded-md border border-[var(--color-border-tertiary,#e5e5e5)] hover:bg-[var(--color-background-secondary,#f5f5f5)] cursor-pointer"
            aria-label="Nächstes Jahr"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNav(new Date().getFullYear())}
            className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border-tertiary,#e5e5e5)] hover:bg-[var(--color-background-secondary,#f5f5f5)] cursor-pointer"
          >
            {t("today")}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-[var(--color-border-tertiary,#e5e5e5)] rounded-lg p-4 bg-[var(--color-box-background)] mb-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-secondary,#666)]">
            {t("timeline")}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--color-text-secondary,#666)] mr-2">
              {zoom} {zoom === 1 ? t("monthSingular") : t("monthPlural")}
            </span>
            <button
              onClick={() => changeZoom(-1)}
              disabled={zoom === ZOOM_LEVELS[0]}
              className="p-1.5 rounded-md border border-[var(--color-border-tertiary,#e5e5e5)] hover:bg-[var(--color-background-secondary,#f5f5f5)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Reinzoomen"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => changeZoom(1)}
              disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className="p-1.5 rounded-md border border-[var(--color-border-tertiary,#e5e5e5)] hover:bg-[var(--color-background-secondary,#f5f5f5)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Rauszoomen"
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>

        {/* Viewport + Scroll-Container in einem */}
        <div
          ref={(el) => {
            scrollRef.current = el;
            viewportRef.current = el;
          }}
          className="relative overflow-x-auto overflow-y-hidden w-full"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Timeline-Inhalt mit voller logischer Breite */}
          <div
            style={{
              width: timelineWidth > 0 ? `${timelineWidth}px` : "100%",
            }}
          >
            {/* Monats-Header */}
            <div
              className="relative border-b border-[var(--color-border-tertiary,#e5e5e5)]"
              style={{ height: 28 }}
            >
              {MONTHS.map((m, i) => {
                const left = monthOffsets[i];
                const width = monthOffsets[i + 1] - monthOffsets[i];
                return (
                  <button
                    key={m}
                    onClick={() => onPickMonth(i)}
                    className="absolute top-0 text-left px-2 py-1.5 text-xs text-[var(--color-text-secondary,#666)] hover:bg-[var(--color-background-secondary,#f5f5f5)] cursor-pointer truncate"
                    style={{
                      left,
                      width,
                      borderRight:
                        i < 11
                          ? "1px solid var(--color-border-tertiary, #e5e5e5)"
                          : "none",
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {/* Event-Balken */}
            <div
              className="relative"
              style={{
                height: Math.max(48, timelineBarHeight + 16),
                marginTop: 8,
              }}
            >
              {/* Monats-Trennlinien */}
              {MONTHS.map(
                (_, i) =>
                  i > 0 && (
                    <div
                      key={`sep-${i}`}
                      className="absolute top-0 bottom-0 border-l border-[var(--color-border-tertiary,#eee)] pointer-events-none"
                      style={{ left: monthOffsets[i] }}
                    />
                  ),
              )}

              {/* Heute-Linie */}
              {todayDoy >= 0 && timelineWidth > 0 && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-[var(--color-primary)] opacity-60 pointer-events-none"
                  style={{ left: (todayDoy / totalDays) * timelineWidth }}
                />
              )}

              {/* Event-Balken */}
              {timelineWidth > 0 &&
                lanes.map((l, i) => {
                  const fallback = colorFor(l.event.colorIndex);
                  const primary = l.event.themeColor ?? fallback.fg;
                  const background = l.event.themeBackground ?? fallback.bg;
                  const left = (l.startDoy / totalDays) * timelineWidth;
                  const width =
                    ((l.endDoy - l.startDoy + 1) / totalDays) * timelineWidth -
                    2;

                  return (
                    <Link
                      key={`${l.event.id}-${i}`}
                      href={`/${locale}/events/${l.event.id}`}
                      className="absolute text-[11px] px-2 rounded flex items-center truncate hover:opacity-80 transition"
                      style={{
                        top: l.lane * 26,
                        left,
                        width: Math.max(6, width),
                        height: 22,
                        backgroundColor: background,
                        color: primary,
                        borderLeft: `3px solid ${primary}`,
                      }}
                      title={`${l.event.name} · ${l.event.start} – ${l.event.end}`}
                    >
                      {l.event.name}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* 12 Mini-Monate */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      className="text-left border border-[var(--color-border-tertiary,#e5e5e5)] rounded-lg p-3 bg-[var(--color-box-background)] hover:border-[var(--color-border-secondary,#ccc)] transition cursor-pointer"
    >
      <div className="text-sm font-medium mb-2 text-[var(--color-font-primary)]">
        {monthName}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[10px] text-[var(--color-text-secondary,#888)] mb-1">
        {DAYS_MINI.map((d, i) => (
          <div key={i} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="h-6" />;
          const dayEvents = eventsByDate.get(`${month}-${d}`) ?? [];
          const isToday = isCurrentMonth && d === todayDate;
          return (
            <div
              key={i}
              className="relative h-6 flex flex-col items-center justify-start pt-0.5"
            >
              <div
                className={`text-[10px] w-4 h-4 flex items-center justify-center ${
                  isToday
                    ? "bg-[var(--color-primary)] text-white rounded-full font-medium"
                    : "text-[var(--color-font-primary)]"
                }`}
              >
                {d}
              </div>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev, idx) => {
                    const fallback = colorFor(ev.colorIndex);
                    const dot = ev.themeColor ?? fallback.dot;
                    return (
                      <div
                        key={idx}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: dot }}
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
