import { redirect } from "next/navigation";
import { getInternalSession } from "@/utils/auth";
import { getRecords } from "@/services/airtable";
import type { Speaker } from "@/types/speaker";
import SpeakerTable from "@/component/Pages/Speaker/SpeakerTable";

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    q?: string;
    event?: string;
    page?: string;
  }>;
}

type SpeakerWithEventInfo = Speaker & {
  "Event Name"?: string[];
  Event?: string[];
};

export default async function SpeakerOverviewPage({ searchParams }: Props) {
  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    redirect("/sign-in?redirect=/speaker/list&type=team");
  }

  const { q = "", event = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  // Alle Contributions laden
  const allSpeakers = (await getRecords(
    "Confirmed Contributions",
  )) as SpeakerWithEventInfo[];

  // Event-Optionen für das Dropdown — {id, name} statt nur name
  const eventMap = new Map<string, string>();
  for (const s of allSpeakers) {
    const ids = s.Event ?? [];
    const names = s["Event Name"] ?? [];
    // Annahme: gleicher Index → zusammengehörig
    ids.forEach((id, i) => {
      if (id && names[i]) {
        eventMap.set(id, names[i]);
      }
    });
  }
  const allEvents = Array.from(eventMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  // Filter
  const query = q.toLowerCase().trim();
  const filtered = allSpeakers.filter((s) => {
    const name = (s["Name"] ?? "").toLowerCase();
    const eventIds: string[] = s.Event ?? [];
    return (
      (!query || name.includes(query)) && (!event || eventIds.includes(event))
    );
  });

  // Paginate
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const speakers = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6">Speaker</h1>
      <SpeakerTable
        speakers={speakers}
        allEvents={allEvents}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={safePage}
        currentSearch={q}
        currentEvent={event}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
