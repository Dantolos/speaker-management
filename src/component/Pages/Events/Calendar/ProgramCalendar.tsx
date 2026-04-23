"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ProgramData, Session } from "@/types/session";
import { colorFor } from "@/utils/eventColors";

const SLOT_HEIGHT = 60; // px pro Stunde

type Props = {
  program: ProgramData;
  locale: string;
  themeColor?: string | null; // Directus primary_color des Events
  themeBackground?: string | null; // abgeleiteter Tint
};

export default function ProgramCalendar({
  program,
  locale,
  themeColor = null,
  themeBackground = null,
}: Props) {
  const t = useTranslations("EventDetail");
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selected, setSelected] = useState<Session | null>(null);

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = program.minHour; h <= program.maxHour; h++) arr.push(h);
    return arr;
  }, [program.minHour, program.maxHour]);

  if (program.days.length === 0) {
    return (
      <div
        style={{
          padding: "48px 16px",
          textAlign: "center",
          color: "var(--color-text-secondary, #666)",
          fontSize: 14,
        }}
      >
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
    const d = new Date(iso);
    return d.toLocaleTimeString(locale === "de" ? "de-DE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const HEADER_HEIGHT = 36;
  const TIME_COL_WIDTH = 56;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Tages-Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border-tertiary, #e5e5e5)",
          marginBottom: 16,
          overflowX: "auto",
        }}
      >
        {program.days.map((d, i) => (
          <button
            key={d.date}
            onClick={() => setActiveDayIdx(i)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              whiteSpace: "nowrap",
              borderBottom: "2px solid",
              borderBottomColor:
                i === activeDayIdx
                  ? "var(--color-font-primary)"
                  : "transparent",
              marginBottom: -1,
              color:
                i === activeDayIdx
                  ? "var(--color-font-primary)"
                  : "var(--color-text-secondary, #666)",
              fontWeight: i === activeDayIdx ? 500 : 400,
              background: "transparent",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              cursor: "pointer",
            }}
          >
            {fmtDayLabel(d.date, i)}
          </button>
        ))}
      </div>

      {/* Kalender-Grid */}
      <div
        style={{
          border: "1px solid var(--color-border-tertiary, #e5e5e5)",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "var(--color-box-background)",
        }}
      >
        {columns.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--color-text-secondary, #666)",
              fontSize: 14,
            }}
          >
            {t("noSessions")}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${columns.length}, minmax(140px, 1fr))`,
            }}
          >
            {/* Ecke oben links */}
            <div
              style={{
                height: HEADER_HEIGHT,
                borderBottom: "1px solid var(--color-border-tertiary, #e5e5e5)",
                borderRight: "1px solid var(--color-border-tertiary, #e5e5e5)",
                backgroundColor: "var(--color-background-secondary, #fafafa)",
              }}
            />

            {/* Raum-Header */}
            {columns.map((room, i) => (
              <div
                key={room}
                style={{
                  height: HEADER_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 8px",
                  fontSize: 12,
                  fontWeight: 500,
                  borderBottom:
                    "1px solid var(--color-border-tertiary, #e5e5e5)",
                  borderRight:
                    i < columns.length - 1
                      ? "1px solid var(--color-border-tertiary, #e5e5e5)"
                      : "none",
                  backgroundColor: "var(--color-background-secondary, #fafafa)",
                  color: "var(--color-font-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {room === "__unassigned__" ? t("noRoom") : room}
              </div>
            ))}

            {/* Zeit-Spalte */}
            <div
              style={{
                position: "relative",
                height: gridHeight,
                borderRight: "1px solid var(--color-border-tertiary, #e5e5e5)",
              }}
            >
              {hours.map((h, i) => (
                <div
                  key={h}
                  style={{
                    position: "absolute",
                    top: i * SLOT_HEIGHT,
                    right: 8,
                    fontSize: 11,
                    color: "var(--color-text-tertiary, #888)",
                    transform: i === 0 ? "translateY(0)" : "translateY(-50%)",
                  }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Raum-Spalten */}
            {columns.map((room, colIdx) => {
              const roomSessions = day.sessions.filter((s) =>
                room === "__unassigned__" ? !s.room : s.room === room,
              );

              return (
                <div
                  key={room}
                  style={{
                    position: "relative",
                    height: gridHeight,
                    borderRight:
                      colIdx < columns.length - 1
                        ? "1px solid var(--color-border-tertiary, #e5e5e5)"
                        : "none",
                  }}
                >
                  {/* Horizontale Gitterlinien */}
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: i * SLOT_HEIGHT,
                        left: 0,
                        right: 0,
                        borderTop:
                          "1px solid var(--color-border-tertiary, #eee)",
                        opacity: 0.6,
                      }}
                    />
                  ))}

                  {/* Sessions */}
                  {roomSessions.map((session) => {
                    const pos = positionFor(session);
                    const roomIdx = program.rooms.indexOf(session.room ?? "");
                    const fallback = colorFor(roomIdx >= 0 ? roomIdx : 8);
                    // Priorität: Directus-Theme > Raum-Farbe aus Palette
                    const primary = themeColor ?? fallback.fg;
                    const background = themeBackground ?? fallback.bg;

                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelected(session)}
                        style={{
                          position: "absolute",
                          top: pos.top,
                          left: 4,
                          right: 4,
                          height: pos.height,
                          textAlign: "left",
                          padding: "6px 8px",
                          borderRadius: 4,
                          overflow: "hidden",
                          backgroundColor: background,
                          color: primary,
                          borderLeft: `3px solid ${primary}`,
                          border: "none",
                          borderLeftWidth: 3,
                          borderLeftStyle: "solid",
                          borderLeftColor: primary,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                        >
                          {session.title || t("untitled")}
                        </div>
                        {pos.height > 36 && (
                          <div style={{ fontSize: 10, opacity: 0.75 }}>
                            {fmtTime(session.startTime)} –{" "}
                            {fmtTime(session.endTime)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session-Detail Modal */}
      {selected && (
        <SessionModal
          session={selected}
          onClose={() => setSelected(null)}
          locale={locale}
        />
      )}
    </div>
  );
}

function SessionModal({
  session,
  onClose,
  locale,
}: {
  session: Session;
  onClose: () => void;
  locale: string;
}) {
  const t = useTranslations("EventDetail");
  function fmt(iso: string) {
    return new Date(iso).toLocaleString(locale === "de" ? "de-DE" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--color-box-background)",
          borderRadius: 8,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          maxWidth: 480,
          width: "100%",
          padding: 24,
          color: "var(--color-font-primary)",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
          {session.title || t("untitled")}
        </h3>
        <dl
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: 14,
          }}
        >
          <Row label={t("start")} value={fmt(session.startTime)} />
          <Row label={t("end")} value={fmt(session.endTime)} />
          {session.room && <Row label={t("room")} value={session.room} />}
        </dl>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            padding: "6px 16px",
            fontSize: 13,
            border: "1px solid var(--color-border-tertiary, #e5e5e5)",
            borderRadius: 6,
            background: "transparent",
            color: "var(--color-font-primary)",
            cursor: "pointer",
          }}
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <dt
        style={{
          width: 80,
          color: "var(--color-text-secondary, #666)",
          flexShrink: 0,
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0 }}>{value}</dd>
    </div>
  );
}
