import { getTranslations } from "next-intl/server";
import {
  aggregateContributions,
  type GlobalMetricsData,
} from "@/services/speaker/dashboard";
import MetricsFilters from "./MetricsFilters";
import EventMetricsCharts from "./EventMetricsCharts";
import { translateGender } from "@/utils/charts/genderLabels";

type Props = {
  globalMetrics: GlobalMetricsData;
  timeframe: "all" | "upcoming" | "past";
  platforms: string;
  event: string;
};

function isUpcoming(isoDate: string | undefined): boolean {
  if (!isoDate) return false;
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  const eventDate = new Date(year, month - 1, day, 12, 0, 0);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(0, 0, 0, 0);
  return eventDate >= cutoff;
}

export default async function MetricsSection({
  globalMetrics,
  timeframe,
  platforms,
  event,
}: Props) {
  const [t, tGender] = await Promise.all([
    getTranslations("EventsOverview"),
    getTranslations("Charts.gender"),
  ]);

  const selectedPlatforms = platforms
    ? platforms.split(",").filter(Boolean)
    : [];

  const filtered = globalMetrics.contributions.filter((c) => {
    if (timeframe === "upcoming" && !isUpcoming(c.eventDate)) return false;
    if (timeframe === "past" && isUpcoming(c.eventDate)) return false;
    if (selectedPlatforms.length > 0) {
      if (!c.platformName || !selectedPlatforms.includes(c.platformName)) {
        return false;
      }
    }
    if (event && c.eventId !== event) return false;
    return true;
  });

  const rawTopMetrics = aggregateContributions(filtered);
  const topMetrics = {
    ...rawTopMetrics,
    gender: translateGender(rawTopMetrics.gender, tGender),
  };
  return (
    <div className="mt-6">
      <MetricsFilters
        allPlatforms={globalMetrics.allPlatforms}
        allEvents={globalMetrics.allEvents}
        currentTimeframe={timeframe}
        currentPlatforms={selectedPlatforms}
        currentEvent={event}
      />
      <EventMetricsCharts
        metrics={{
          totalSpeakers: filtered.length,
          gender: topMetrics.gender,
          country: topMetrics.country,
          category: topMetrics.category,
          language: topMetrics.language,
        }}
      />
    </div>
  );
}
