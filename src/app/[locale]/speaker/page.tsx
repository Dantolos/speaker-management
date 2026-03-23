import { redirect } from "next/navigation";
import { getTeamSession } from "@/utils/auth";
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

export default async function SpeakerOverviewPage({ searchParams }: Props) {
  const session = await getTeamSession();
  if (!session.isAuthenticated) {
    redirect("/sign-in?redirect=/speaker&type=team");
  }

  const { q = "", event = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  // Single fetch — "Event Name" is a lookup field on Confirmed Contributions
  const allSpeakers = (await getRecords(
    "Confirmed Contributions",
  )) as (Speaker & {
    "Event Name"?: string[];
  })[];

  // Unique event names for the dropdown (lookup fields return arrays)
  const allEvents = Array.from(
    new Set(allSpeakers.flatMap((s) => s["Event Name"] ?? []).filter(Boolean)),
  ).sort();

  // Filter
  const query = q.toLowerCase().trim();
  const filtered = allSpeakers.filter((s) => {
    const name = (s["Name"] ?? "").toLowerCase();
    const eventNames = s["Event Name"] ?? [];
    return (
      (!query || name.includes(query)) && (!event || eventNames.includes(event))
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
