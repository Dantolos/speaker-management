import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Calendar, Hotel, Plus } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";
import { getValidToken } from "@/utils/directusAuth";
import { getGlobalDashboard } from "@/services/speaker/dashboard";
import { formatEventDate } from "@/utils/format";

interface Props {
  params: Promise<{ locale: string }>;
}

const tiles = [
  {
    href: "/speaker",
    labelKey: "tileSpeaker",
    descKey: "tileSpeakerDesc",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-800",
  },
  {
    href: "/events",
    labelKey: "tileEvents",
    descKey: "tileEventsDesc",
    icon: Calendar,
    iconBg: "bg-green-50",
    iconColor: "text-green-800",
  },
  {
    href: "/partner",
    labelKey: "tilePartner",
    descKey: "tilePartnerDesc",
    icon: Hotel,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-800",
  },
];

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const token = await getValidToken();
  if (!token) redirect(`/${locale}/sign-in`);

  const [data, t, format] = await Promise.all([
    getGlobalDashboard(),
    getTranslations("Dashboard"),
    getFormatter(),
  ]);

  const metrics = [
    {
      label: t("metricSpeakers"),
      value: data.totalSpeakers,
      href: "/speaker/list",
    },
    {
      label: t("metricUpcomingEvents"),
      value: data.upcomingEvents,
      href: "/events?tab=upcoming",
    },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <p className="text-sm text-foreground/50 mb-1">{t("welcome")}</p>
      <h1 className="text-2xl font-medium mb-6">{t("title")}</h1>

      {/* Metriken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-foreground/5 rounded-xl p-4 hover:bg-foreground/10 transition-colors"
          >
            <p className="text-xs text-foreground/50 mb-1">{label}</p>
            <p className="text-2xl font-medium">{value}</p>
          </Link>
        ))}
      </div>

      {/* Nächste Events */}
      {data.nextEvents.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-2">
            {t("nextEvents")}
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {data.nextEvents.map((event, i) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`block rounded-2xl overflow-hidden bg-box-background hover:border-foreground/20 transition-all ${
                  i === 0
                    ? "border-2 border-primary"
                    : "border border-foreground/10"
                }`}
              >
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-2.5">
                    {i === 0 ? (
                      <span className="text-[11px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {t("nextBadge")}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-[11px] text-foreground/50 bg-foreground/5 px-2 py-0.5 rounded">
                      {t("inDays", { count: event.daysUntil })}
                    </span>
                  </div>
                  <p className="font-medium mb-0.5">{event.name}</p>
                  <p className="text-xs text-foreground/60">
                    {formatEventDate(format, event.date)}
                  </p>
                </div>
                <div className="border-t border-foreground/10 px-5 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-foreground/40 mb-0.5">
                    {t("speakers")}
                  </p>
                  <p className="text-xl font-medium">{event.speakerCount}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Bereiche */}
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-2">
        {t("sections")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map(
          ({ href, labelKey, descKey, icon: Icon, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="bg-box-background border border-foreground/10 rounded-2xl p-5 hover:border-foreground/20 transition-all"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}
              >
                <Icon size={16} />
              </div>
              <p className="font-medium mb-1">{t(labelKey)}</p>
              <p className="text-sm text-foreground/50">{t(descKey)}</p>
            </Link>
          ),
        )}
        <div className="border border-dashed border-foreground/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-foreground/30">
          <Plus size={16} />
          <p className="text-sm">{t("addTile")}</p>
        </div>
      </div>
    </div>
  );
}
