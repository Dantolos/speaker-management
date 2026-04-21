import { getUpcomingEvents } from "@/services/speaker/dashboard";
import { formatEventDate } from "@/utils/format";
import { getFormatter, getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function SpeakerDashboardPage() {
  const t = await getTranslations("SpeakerDashboard");
  const format = await getFormatter();
  const events = await getUpcomingEvents(3);

  return (
    <div className="p-6 space-y-8">
      {/* Zeile 1: Navigation */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-foreground/60 mb-2">
          {t("navigation")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/speaker/list"
            className="rounded-lg border border-foreground/10 bg-box-background p-5 hover:border-foreground/30 transition"
          >
            <p className="font-medium">{t("allSpeakers")}</p>
            <p className="text-sm text-foreground/60 mt-1">
              {t("allSpeakersDescription")}
            </p>
          </Link>
          <Link
            href="/events"
            className="rounded-lg border border-foreground/10 bg-box-background p-5 hover:border-foreground/30 transition"
          >
            <p className="font-medium">{t("eventOverview")}</p>
            <p className="text-sm text-foreground/60 mt-1">
              {t("eventOverviewDescription")}
            </p>
          </Link>
        </div>
      </section>

      {/* Zeile 2: Kommende Events */}
      <section>
        <h2 className="text-xs uppercase tracking-wide text-foreground/60 mb-2">
          {t("upcomingEvents")}
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("noUpcomingEvents")}</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {events.map((event, i) => (
              <Link
                key={event.id}
                href={`/speaker/list?event=${event.id}`}
                className={`block rounded-lg bg-box-background p-4 transition ${
                  i === 0
                    ? "border-2 border-primary"
                    : "border border-foreground/10 hover:border-foreground/30"
                }`}
              >
                {i === 0 && (
                  <span className="inline-block text-[11px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded mb-2">
                    {t("nextBadge")}
                  </span>
                )}
                <p className="font-medium">{event.name}</p>
                <p className="text-xs text-foreground/60 mt-1 mb-4">
                  {formatEventDate(format, event.date)}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-medium">
                    {event.speakerCount}
                  </span>
                  <span className="text-xs text-foreground/60">
                    {t("confirmedSpeakers", { count: event.speakerCount })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
