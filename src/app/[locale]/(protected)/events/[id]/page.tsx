import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { getInternalSession } from "@/utils/auth";
import {
  getEvent,
  getAllThemes,
  getContentDisplayOptions,
} from "@/services/speaker/dashboard";
import { formatEventDate } from "@/utils/format";
import EventConfigForm from "@/component/Pages/Events/EventConfigForm";
import { getEventMetrics } from "@/services/speaker/dashboard";
import EventMetricsCharts from "@/component/Pages/Events/EventMetricsCharts";

import { getEventProgram } from "@/services/speaker/program";
import ProgramCalendar from "@/component/Pages/Events/Calendar/ProgramCalendar";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    redirect(`/sign-in?redirect=/events/${id}&type=team`);
  }

  const [event, themes, contentOptions, metrics, t, format, program] =
    await Promise.all([
      getEvent(id),
      getAllThemes(),
      getContentDisplayOptions(),
      getEventMetrics(id),
      getTranslations("EventDetail"),
      getFormatter(),
      getEventProgram(id),
    ]);
  if (!event) notFound();

  const dateDisplay =
    event.endDate && event.endDate !== event.date
      ? `${formatEventDate(format, event.date)} – ${formatEventDate(format, event.endDate)}`
      : formatEventDate(format, event.date);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">{event.name}</h1>
        <p className="text-sm text-foreground/60">{dateDisplay}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Facts */}
        <section className="md:col-span-2 rounded-2xl border border-foreground/10 bg-background p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-4">
            {t("factsHeading")}
          </h2>
          <dl className="space-y-3">
            <InfoRow label={t("factName")} value={event.name} />
            <InfoRow label={t("factDate")} value={dateDisplay} />
            {event.theme && (
              <InfoRow label={t("factTheme")} value={event.theme} />
            )}
            {event.platformName && (
              <InfoRow label={t("factPlatform")} value={event.platformName} />
            )}
            {event.location && (
              <InfoRow
                label={t("factLocation")}
                value={
                  <div className="text-right">
                    <p className="font-medium">{event.location.Name}</p>
                    <p className="text-sm text-foreground/60">
                      {event.location.Strasse} {event.location.Hausnummer}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {event.location.PLZ} {event.location.Stadt}
                    </p>
                    {event.location.Land && (
                      <p className="text-sm text-foreground/60">
                        {event.location.Land}
                      </p>
                    )}
                  </div>
                }
              />
            )}
          </dl>
        </section>

        {/* Actions */}
        <section className="rounded-2xl border border-foreground/10 bg-background p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-4">
            {t("actionsHeading")}
          </h2>
          <Link
            href={`/speaker/list?event=${event.id}`}
            className="flex items-center gap-3 rounded-xl border border-primary bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-3"
          >
            <span className="shrink-0 text-primary">
              <Users size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">
                {t("actionSpeakers")}
              </p>
              <p className="text-xs text-foreground/60">
                {t("actionSpeakersCount", { count: event.speakerCount })}
              </p>
            </div>
          </Link>
        </section>
      </div>

      {/* Config */}
      <EventConfigForm
        airtableId={event.id}
        config={event.config}
        themes={themes}
        contentOptions={contentOptions}
      />

      <div className="mt-6">
        <EventMetricsCharts metrics={metrics} />
      </div>

      <ProgramCalendar program={program} locale={locale} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-foreground/5 last:border-0">
      <dt className="text-sm text-foreground/60 shrink-0">{label}</dt>
      <dd className="text-sm text-right">{value}</dd>
    </div>
  );
}
