import { getSession } from "@/services/speaker/program";
import SessionDetailView from "@/component/Pages/Events/Sessions/SessionDetailView";
import { base } from "@/services/airtable";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; sessionId: string }>;
}) {
  const { sessionId, id: eventId, locale } = await params;

  console.log("[SessionDetailPage] Loading session:", sessionId);

  // 1. Erst rohen Airtable-Call versuchen
  let rawRecord: { id: string; fields: Record<string, unknown> } | null = null;
  let rawError: string | null = null;
  try {
    const r = await base("Sessions").find(sessionId);
    rawRecord = { id: r.id, fields: r.fields as Record<string, unknown> };
    console.log(
      "[SessionDetailPage] Raw record fields:",
      Object.keys(rawRecord.fields),
    );
  } catch (err) {
    rawError = err instanceof Error ? err.message : String(err);
    console.error("[SessionDetailPage] Raw fetch error:", err);
  }

  // 2. Dann den getSession-Service
  const session = await getSession(sessionId);
  console.log(
    "[SessionDetailPage] getSession result:",
    session ? "OK" : "NULL",
  );

  // Diagnose-Ansicht statt notFound()
  if (!session) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-medium mb-4">Session-Diagnose</h1>
        <dl className="text-sm space-y-2 mb-6">
          <div className="flex gap-4">
            <dt className="font-medium w-32">Session ID:</dt>
            <dd className="font-mono">{sessionId}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="font-medium w-32">Event ID:</dt>
            <dd className="font-mono">{eventId}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="font-medium w-32">Locale:</dt>
            <dd>{locale}</dd>
          </div>
        </dl>

        <h2 className="text-sm font-medium uppercase tracking-wider mb-2">
          Airtable-Fetch
        </h2>
        {rawError ? (
          <pre className="bg-red-50 text-red-900 p-3 rounded text-xs overflow-auto mb-6">
            {rawError}
          </pre>
        ) : rawRecord ? (
          <div className="bg-gray-50 p-3 rounded mb-6">
            <p className="text-xs mb-2">Record gefunden. Verfügbare Felder:</p>
            <ul className="text-xs font-mono">
              {Object.entries(rawRecord.fields).map(([key, value]) => (
                <li key={key} className="py-0.5">
                  <span className="font-bold">{key}:</span>{" "}
                  <span className="text-gray-600">
                    {typeof value === "string"
                      ? value.length > 80
                        ? value.slice(0, 80) + "…"
                        : value
                      : JSON.stringify(value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-red-600 mb-6">
            Kein Record und kein Error — seltsam.
          </p>
        )}

        <h2 className="text-sm font-medium uppercase tracking-wider mb-2">
          getSession() Result
        </h2>
        <p className="text-sm text-red-600">
          Returned NULL. Schau ins Terminal für mehr Details.
        </p>
      </div>
    );
  }

  return <SessionDetailView session={session} variant="page" />;
}
