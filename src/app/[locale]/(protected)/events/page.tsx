import { redirect } from "next/navigation";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { getInternalSession } from "@/utils/auth";
import {
  getAllEvents,
  getGlobalMetrics,
  aggregateContributions,
  type EventListItem,
} from "@/services/speaker/dashboard";
import { formatEventDate } from "@/utils/format";
import EventsTabs from "@/component/Pages/Events/EventsTabs";
import DonutMini from "@/component/Pages/Events/DonutMini";

function isUpcoming(isoDate: string | undefined): boolean {
  if (!isoDate) return false; // ohne Datum → "Vergangen"
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  const eventDate = new Date(year, month - 1, day, 12, 0, 0);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(0, 0, 0, 0);
  return eventDate >= cutoff;
}

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function EventsOverviewPage({ searchParams }: Props) {
  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    redirect("/sign-in?redirect=/events&type=team");
  }

  const { tab = "upcoming" } = await searchParams;

  const [allEvents, globalMetrics, t, format] = await Promise.all([
    getAllEvents(),
    getGlobalMetrics(),
    getTranslations("EventsOverview"),
    getFormatter(),
  ]);

  const topMetrics = aggregateContributions(globalMetrics.contributions);

  // Aufsplitten
  const upcoming = allEvents
    .filter((e) => isUpcoming(e.date))
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")); // asc

  const past = allEvents
    .filter((e) => !isUpcoming(e.date))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")); // desc

  const activeEvents = tab === "past" ? past : upcoming;

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl border border-foreground/10 bg-background p-5">
          <p className="text-sm font-medium mb-3">{t("overviewGender")}</p>
          <DonutMini data={topMetrics.gender} />
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-background p-5">
          <p className="text-sm font-medium mb-3">{t("overviewCategory")}</p>
          <DonutMini data={topMetrics.category} />
        </div>
      </div>

      <EventsTabs
        activeTab={tab === "past" ? "past" : "upcoming"}
        upcomingCount={upcoming.length}
        pastCount={past.length}
      />

      {activeEvents.length === 0 ? (
        <p className="text-foreground/60 mt-6">
          {tab === "past" ? t("emptyPast") : t("emptyUpcoming")}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 mt-6">
          {activeEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              formattedDate={formatEventDate(format, event.date)}
              missingConfigLabel={t("missingConfig")}
              speakerLabel={t("confirmedSpeakers", {
                count: event.speakerCount,
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  formattedDate,
  missingConfigLabel,
  speakerLabel,
}: {
  event: EventListItem;
  formattedDate: string;
  missingConfigLabel: string;
  speakerLabel: string;
}) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-lg border border-foreground/10 bg-box-background p-4 hover:border-foreground/30 transition"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-medium">{event.name}</p>
        {!event.hasDirectusConfig && (
          <span
            className="shrink-0 text-[11px] uppercase tracking-wide bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded"
            title={missingConfigLabel}
          >
            {missingConfigLabel}
          </span>
        )}
      </div>
      <p className="text-xs text-foreground/60 mb-4">{formattedDate}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-medium">{event.speakerCount}</span>
        <span className="text-xs text-foreground/60">{speakerLabel}</span>
      </div>
    </Link>
  );
}
