"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import Link from "next/link";
import type { Speaker } from "@/types/speaker";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  speakers: (Speaker & { "Event Name"?: string[] })[];
  allEvents: string[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentEvent: string;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SpeakerTable({
  speakers,
  allEvents,
  totalCount,
  totalPages,
  currentPage,
  currentSearch,
  currentEvent,
  pageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── URL param helpers ─────────────────────────────────────────────────────

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const navigate = (overrides: Record<string, string | undefined>) => {
    startTransition(() => router.push(buildUrl(overrides)));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({ q: e.target.value || undefined, page: "1" });
  };

  const handleEventFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate({ event: e.target.value || undefined, page: "1" });
  };

  const handleClearFilters = () => {
    navigate({ q: undefined, event: undefined, page: "1" });
  };

  const hasActiveFilters = !!currentSearch || !!currentEvent;

  // ── Pagination range ──────────────────────────────────────────────────────

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={
        isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
      }
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search speakers…"
            defaultValue={currentSearch}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-primary bg-primary/20 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        {/* Event filter */}
        <select
          value={currentEvent}
          onChange={handleEventFilter}
          className="py-2 px-3 rounded-xl border border-primary bg-primary/20 text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[160px]"
        >
          <option value="">All Events</option>
          {allEvents.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-primray bg-primary/20 text-sm text-primary hover:bg-gray-50 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-sm text-primary/80">
          {totalCount} speaker{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-foreground/10 overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10 bg-primary/5 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {speakers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-foreground"
                >
                  No speakers found.
                </td>
              </tr>
            ) : (
              speakers.map((speaker, i) => (
                <tr
                  key={speaker.id ?? i}
                  className="border-b border-foreground/10 last:border-0 hover:bg-primary/10 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {speaker["Speaker Name"] ?? speaker.Name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {speaker["Event Name"]?.[0] ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-right ">
                    <Link
                      href={`/speaker/${speaker.id}`}
                      className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-foreground/40">
            {startItem}–{endItem} of {totalCount}
          </span>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
              aria-disabled={currentPage <= 1}
              className={`p-2 rounded-lg border border-foreground/80 transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-30"
                  : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
            </Link>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-foreground text-sm"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${
                      p === currentPage
                        ? "bg-primary/20 text-primary border-primary"
                        : "border-none hover:bg-primary/20"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}

            {/* Next */}
            <Link
              href={buildUrl({ page: String(currentPage + 1) })}
              aria-disabled={currentPage >= totalPages}
              className={`p-2 rounded-lg border border-foreground/80 transition-colors ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-30"
                  : "hover:bg-gray-50"
              }`}
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
