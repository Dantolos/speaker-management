"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Clock, MapPin, Users, ArrowLeft, Globe } from "lucide-react";
import type { SessionDetail } from "@/services/speaker/program";

type Props = {
  session: SessionDetail;
  variant?: "page" | "drawer";
};

export default function SessionDetailView({
  session,
  variant = "page",
}: Props) {
  const locale = useLocale();
  const t = useTranslations("SessionDetail");

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(
      locale === "de" ? "de-DE" : "en-US",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  }
  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString(
      locale === "de" ? "de-DE" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  const sameDay = fmtDate(session.startTime) === fmtDate(session.endTime);

  return (
    <div className={variant === "drawer" ? "p-6" : "p-6 max-w-3xl mx-auto"}>
      {variant === "page" && session.eventId && (
        <Link
          href={`/${locale}/events/${session.eventId}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary,#666)] hover:text-[var(--color-font-primary)] mb-4"
        >
          <ArrowLeft size={14} />
          {t("backToEvent")}
        </Link>
      )}

      <h1 className="text-2xl font-medium mb-1">
        {session.title || t("untitled")}
      </h1>
      {session.subtitle && (
        <p className="text-base text-[var(--color-text-secondary,#666)] mb-3">
          {session.subtitle}
        </p>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary,#666)] mb-6">
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>
            {fmtDate(session.startTime)}
            {" · "}
            {fmtTime(session.startTime)} – {fmtTime(session.endTime)}
            {!sameDay && ` (${fmtDate(session.endTime)})`}
            {session.durationMinutes && (
              <span className="ml-2 opacity-70">
                ({session.durationMinutes} {t("minutesShort")})
              </span>
            )}
          </span>
        </div>
        {session.room && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{session.room}</span>
          </div>
        )}
        {session.language && (
          <div className="flex items-center gap-1.5">
            <Globe size={14} />
            <span>{session.language}</span>
          </div>
        )}
        {session.speakerNames.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>
              {session.speakerNames.length} {t("speakers")}
            </span>
          </div>
        )}
      </div>

      {session.description && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-secondary,#666)] mb-2">
            {t("description")}
          </h2>
          <p className="text-sm text-[var(--color-font-primary)] whitespace-pre-wrap">
            {session.description}
          </p>
        </div>
      )}

      {session.speakerIds.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-secondary,#666)] mb-3">
            {t("speakers")} ({session.speakerIds.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {session.speakerIds.map((spId, i) => (
              <li key={spId}>
                <Link
                  href={`/${locale}/contacts/${spId}`}
                  className="block px-3 py-2 rounded-md border border-[var(--color-border-tertiary,#e5e5e5)] hover:bg-[var(--color-background-secondary,#fafafa)] text-sm transition"
                >
                  {session.speakerNames[i] ?? spId}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {variant === "page" && session.eventId && (
        <div className="pt-4 border-t border-[var(--color-border-tertiary,#e5e5e5)]">
          <Link
            href={`/${locale}/events/${session.eventId}`}
            className="text-sm text-[var(--color-secondary)] hover:underline"
          >
            ← {t("backToEvent")}
          </Link>
        </div>
      )}
    </div>
  );
}
