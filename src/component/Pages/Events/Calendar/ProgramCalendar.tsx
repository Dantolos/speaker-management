"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { SquareArrowOutUpRight } from "lucide-react";
import type { ProgramData, Session } from "@/types/session";
import { colorFor } from "@/utils/eventColors";
import SessionDrawer from "@/component/UI/SessionDrawer";

const SLOT_HEIGHT = 60;
const HEADER_HEIGHT = 36;
const TIME_COL_WIDTH = 56;
const ROOM_MIN_WIDTH = 160;
const SCROLL_MAX_HEIGHT = 640;

type Props = {
  program: ProgramData;
  eventId: string;
  themeColor?: string | null;
  themeBackground?: string | null;
};

export default function ProgramCalendar({
  program,
  eventId,
  themeColor = null,
  themeBackground = null,
}: Props) {
  const t = useTranslations("EventDetail");
  const tSD = useTranslations("SessionDetail");
  const locale = useLocale();
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [drawerSessionId, setDrawerSessionId] = useState<string | null>(null);

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = program.minHour; h <= program.maxHour; h++) arr.push(h);
    return arr;
  }, [program.minHour, program.maxHour]);

  if (program.days.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[var(--color-text-secondary,#666)]">
        {t("noSessions")}
      </div>
    );
  }

  const day = program.days[activeDayIdx];
  const activeRooms = program.rooms.filter((r) =>
    day.sessions.some((s) => s.room === r),
  );
  const hasUnassigned = day.sessions.some((s) => !s.room);
  const columns = [
    ...activeRooms,
    ...(hasUnassigned ? ["__unassigned__"] : []),
  ];

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString(
      locale === "de" ? "de-DE" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  function fmtDayLabel(dateKey: string, idx: number) {
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = date.toLocaleDateString(
      locale === "de" ? "de-DE" : "en-US",
      {
        weekday: "short",
      },
    );
    const short = date.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "short",
    });
    return `${t("day")} ${idx + 1} — ${weekday}, ${short}`;
  }

  function positionFor(session: Session) {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const startH = start.getHours() + start.getMinutes() / 60;
    const endH = end.getHours() + end.getMinutes() / 60;
    const top = (startH - program.minHour) * SLOT_HEIGHT;
    const height = Math.max(28, (endH - startH) * SLOT_HEIGHT - 2);
    return { top, height };
  }

  const gridHeight = (program.maxHour - program.minHour) * SLOT_HEIGHT;

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Tages-Tabs */}
      <div className="flex border-b border-[var(--color-border-tertiary,#e5e5e5)] mb-4 overflow-x-auto">
        {program.days.map((d, i) => {
          const active = i === activeDayIdx;
          return (
            <button
              key={d.date}
              onClick={() => setActiveDayIdx(i)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition cursor-pointer ${
                active
                  ? "border-[var(--color-font-primary)] font-medium text-[var(--color-font-primary)]"
                  : "border-transparent text-[var(--color-text-secondary,#666)] hover:text-[var(--color-font-primary)]"
              }`}
            >
              {fmtDayLabel(d.date, i)}
            </button>
          );
        })}
      </div>

      {columns.length === 0 ? (
        <div className="border border-[var(--color-border-tertiary,#e5e5e5)] rounded-lg py-12 text-center text-sm text-[var(--color-text-secondary,#666)] bg-[var(--color-box-background)]">
          {t("noSessions")}
        </div>
      ) : (
        <div
          className="border border-[var(--color-border-tertiary,#e5e5e5)] rounded-lg overflow-auto bg-[var(--color-box-background)] relative"
          style={{ maxHeight: SCROLL_MAX_HEIGHT }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${columns.length}, minmax(${ROOM_MIN_WIDTH}px, 1fr))`,
              gridTemplateRows: `${HEADER_HEIGHT}px ${gridHeight}px`,
              minWidth: "min-content",
            }}
          >
            <div className="sticky top-0 left-0 z-30 border-b border-r border-[var(--color-border-tertiary,#e5e5e5)] bg-[var(--color-background-secondary,#fafafa)]" />

            {columns.map((room, i) => (
              <div
                key={`head-${room}`}
                className={`sticky top-0 z-20 flex items-center justify-center px-2 text-xs font-medium border-b border-[var(--color-border-tertiary,#e5e5e5)] bg-[var(--color-background-secondary,#fafafa)] text-[var(--color-font-primary)] truncate ${
                  i < columns.length - 1 ? "border-r" : ""
                }`}
              >
                {room === "__unassigned__" ? t("noRoom") : room}
              </div>
            ))}

            <div
              className="sticky left-0 z-10 border-r border-[var(--color-border-tertiary,#e5e5e5)] bg-[var(--color-box-background)]"
              style={{ gridRow: 2, gridColumn: 1, height: gridHeight }}
            >
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute right-2 text-[11px] text-[var(--color-text-tertiary,#888)] whitespace-nowrap"
                  style={{
                    top: i * SLOT_HEIGHT,
                    transform: i === 0 ? "translateY(0)" : "translateY(-50%)",
                  }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {columns.map((room, colIdx) => {
              const roomSessions = day.sessions.filter((s) =>
                room === "__unassigned__" ? !s.room : s.room === room,
              );

              return (
                <div
                  key={`col-${room}`}
                  className={`relative ${
                    colIdx < columns.length - 1
                      ? "border-r border-[var(--color-border-tertiary,#e5e5e5)]"
                      : ""
                  }`}
                  style={{
                    gridRow: 2,
                    gridColumn: colIdx + 2,
                    height: gridHeight,
                  }}
                >
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-x-0 border-t border-[var(--color-border-tertiary,#eee)] opacity-60 pointer-events-none"
                      style={{ top: i * SLOT_HEIGHT }}
                    />
                  ))}

                  {roomSessions.map((session) => {
                    const pos = positionFor(session);
                    const roomIdx = program.rooms.indexOf(session.room ?? "");
                    const fallback = colorFor(roomIdx >= 0 ? roomIdx : 8);
                    const primary = themeColor ?? fallback.fg;
                    const background = themeBackground ?? fallback.bg;

                    return (
                      <div
                        key={session.id}
                        className="absolute left-1 right-1 group"
                        style={{ top: pos.top, height: pos.height }}
                      >
                        <button
                          onClick={() => setDrawerSessionId(session.id)}
                          className="w-full h-full text-left p-1.5 rounded overflow-hidden cursor-pointer flex flex-col gap-0.5 hover:opacity-80 transition"
                          style={{
                            backgroundColor: background,
                            color: primary,
                            borderLeft: `3px solid ${primary}`,
                          }}
                        >
                          <div className="text-xs font-medium leading-tight truncate w-full pr-5">
                            {session.title || t("untitled")}
                          </div>
                          {pos.height > 36 && (
                            <div className="text-[10px] opacity-75">
                              {fmtTime(session.startTime)} –{" "}
                              {fmtTime(session.endTime)}
                            </div>
                          )}
                        </button>
                        <Link
                          href={`/${locale}/events/${eventId}/sessions/${session.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition"
                          style={{ color: primary }}
                          title={tSD("openFullPage")}
                          aria-label={tSD("openFullPage")}
                        >
                          <SquareArrowOutUpRight size={12} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SessionDrawer
        sessionId={drawerSessionId}
        eventId={eventId}
        onClose={() => setDrawerSessionId(null)}
      />
    </div>
  );
}
