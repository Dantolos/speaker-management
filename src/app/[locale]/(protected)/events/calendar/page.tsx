import { getCalendarEvents } from "@/services/speaker/eventCalendars";
import CalendarView from "@/component/Pages/Events/Calendar/CalendarView";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function EventsCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("EventsOverview");
  const events = await getCalendarEvents();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium">{t("calendarTitle")}</h1>
          <p className="text-sm text-[var(--color-text-secondary,#666)] mt-1">
            {t("calendarSubtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}/events`}
          className="text-sm text-[var(--color-secondary)] hover:underline"
        >
          ← {t("backToList")}
        </Link>
      </div>

      <CalendarView events={events} locale={locale} />
    </div>
  );
}
