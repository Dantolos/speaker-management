import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getInternalSession } from "@/utils/auth";
import { getAllEvents } from "@/services/speaker/dashboard";
import EventsTable from "@/component/Pages/Events/EventsTable";

const PAGE_SIZE = 20;

function isUpcoming(isoDate: string | undefined): boolean {
  if (!isoDate) return false;
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  const eventDate = new Date(year, month - 1, day, 12, 0, 0);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(0, 0, 0, 0);
  return eventDate >= cutoff;
}

interface Props {
  searchParams: Promise<{
    q?: string;
    timeframe?: "all" | "upcoming" | "past";
    config?: "all" | "with" | "without";
    platforms?: string; // kommaseparierte Liste
    sort?: "name" | "date" | "speakers";
    dir?: "asc" | "desc";
    page?: string;
  }>;
}

export default async function EventsListPage({ searchParams }: Props) {
  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    redirect("/sign-in?redirect=/events/list&type=team");
  }

  const {
    q = "",
    timeframe = "all",
    config = "all",
    platforms = "",
    sort = "date",
    dir = "desc",
    page = "1",
  } = await searchParams;

  const t = await getTranslations("EventsList");
  const allEvents = await getAllEvents();

  // Alle eindeutigen Plattformen für den Multi-Select
  const allPlatforms = Array.from(
    new Set(
      allEvents
        .map((e) => e.platformName)
        .filter((p): p is string => Boolean(p)),
    ),
  ).sort();

  // Ausgewählte Plattformen aus URL parsen
  const selectedPlatforms = platforms
    ? platforms.split(",").filter(Boolean)
    : [];

  // Filter anwenden
  const query = q.toLowerCase().trim();
  const filtered = allEvents.filter((e) => {
    // Suche
    if (query && !e.name.toLowerCase().includes(query)) return false;

    // Zeitraum
    if (timeframe === "upcoming" && !isUpcoming(e.date)) return false;
    if (timeframe === "past" && isUpcoming(e.date)) return false;

    // Config
    if (config === "with" && !e.hasDirectusConfig) return false;
    if (config === "without" && e.hasDirectusConfig) return false;

    // Plattform
    if (selectedPlatforms.length > 0) {
      if (!e.platformName || !selectedPlatforms.includes(e.platformName)) {
        return false;
      }
    }

    return true;
  });

  // Sortieren
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sort === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sort === "speakers") {
      cmp = a.speakerCount - b.speakerCount;
    } else {
      cmp = (a.date ?? "").localeCompare(b.date ?? "");
    }
    return dir === "asc" ? cmp : -cmp;
  });

  // Paginieren
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const events = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <EventsTable
        events={events}
        allPlatforms={allPlatforms}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={safePage}
        currentSearch={q}
        currentTimeframe={timeframe}
        currentConfig={config}
        currentPlatforms={selectedPlatforms}
        currentSort={sort}
        currentDir={dir}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
