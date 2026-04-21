"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Eye,
} from "lucide-react";
import type { EventListItem } from "@/services/speaker/dashboard";
import { formatEventDate } from "@/utils/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Timeframe = "all" | "upcoming" | "past";
type ConfigFilter = "all" | "with" | "without";
type SortField = "name" | "date" | "speakers";
type SortDir = "asc" | "desc";

interface Props {
  events: EventListItem[];
  allPlatforms: string[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentTimeframe: Timeframe;
  currentConfig: ConfigFilter;
  currentPlatforms: string[];
  currentSort: SortField;
  currentDir: SortDir;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EventsTable({
  events,
  allPlatforms,
  totalCount,
  totalPages,
  currentPage,
  currentSearch,
  currentTimeframe,
  currentConfig,
  currentPlatforms,
  currentSort,
  currentDir,
  pageSize,
}: Props) {
  const t = useTranslations("EventsList");
  const format = useFormatter();
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

  const handleTimeframe = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Timeframe;
    navigate({
      timeframe: value === "all" ? undefined : value,
      page: "1",
    });
  };

  const handleConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ConfigFilter;
    navigate({
      config: value === "all" ? undefined : value,
      page: "1",
    });
  };

  const togglePlatform = (platform: string) => {
    const next = currentPlatforms.includes(platform)
      ? currentPlatforms.filter((p) => p !== platform)
      : [...currentPlatforms, platform];
    navigate({
      platforms: next.length > 0 ? next.join(",") : undefined,
      page: "1",
    });
  };

  const toggleSort = (field: SortField) => {
    if (currentSort !== field) {
      navigate({
        sort: field === "date" ? undefined : field,
        dir: "asc",
        page: "1",
      });
    } else {
      const nextDir = currentDir === "asc" ? "desc" : "asc";
      navigate({
        sort: field === "date" ? undefined : field,
        dir: nextDir === "desc" ? undefined : nextDir,
        page: "1",
      });
    }
  };

  const handleClearFilters = () => {
    navigate({
      q: undefined,
      timeframe: undefined,
      config: undefined,
      platforms: undefined,
      page: "1",
    });
  };

  const hasActiveFilters =
    !!currentSearch ||
    currentTimeframe !== "all" ||
    currentConfig !== "all" ||
    currentPlatforms.length > 0;

  // ── Sort icon helper ──────────────────────────────────────────────────────

  const sortIcon = (field: SortField) => {
    if (currentSort !== field) return null;
    return currentDir === "asc" ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

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
            placeholder={t("searchPlaceholder")}
            defaultValue={currentSearch}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        {/* Timeframe */}
        <select
          value={currentTimeframe}
          onChange={handleTimeframe}
          className="py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[140px]"
        >
          <option value="all">{t("timeframeAll")}</option>
          <option value="upcoming">{t("timeframeUpcoming")}</option>
          <option value="past">{t("timeframePast")}</option>
        </select>

        {/* Config */}
        <select
          value={currentConfig}
          onChange={handleConfig}
          className="py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[140px]"
        >
          <option value="all">{t("configAll")}</option>
          <option value="with">{t("configWith")}</option>
          <option value="without">{t("configWithout")}</option>
        </select>

        {/* Platform Multi-Select */}
        <PlatformFilter
          allPlatforms={allPlatforms}
          selected={currentPlatforms}
          onToggle={togglePlatform}
          label={t("platformsLabel")}
          allLabel={t("platformsAll")}
        />

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-primary bg-primary/20 text-sm text-primary hover:bg-primary/30 transition-colors"
          >
            <X size={14} />
            {t("clearFilters")}
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-sm text-primary/80">
          {totalCount}{" "}
          {totalCount !== 1 ? t("eventsPlural") : t("eventsSingular")}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-foreground/10 overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10 bg-primary/5 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
              <th
                className="px-4 py-3 cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => toggleSort("name")}
              >
                {t("colName")}
                {sortIcon("name")}
              </th>
              <th
                className="px-4 py-3 cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => toggleSort("date")}
              >
                {t("colDate")}
                {sortIcon("date")}
              </th>
              <th
                className="px-4 py-3 cursor-pointer select-none hover:text-primary transition-colors text-right"
                onClick={() => toggleSort("speakers")}
              >
                {t("colSpeakers")}
                {sortIcon("speakers")}
              </th>
              <th className="px-4 py-3">{t("colPlatform")}</th>
              <th className="px-4 py-3">{t("colConfig")}</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-foreground"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-foreground/10 last:border-0 hover:bg-primary/10 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {event.name}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {formatEventDate(format, event.date)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground/80">
                    {event.speakerCount}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {event.platformName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {event.hasDirectusConfig ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <span className="text-[11px] uppercase tracking-wide bg-secondary/10 text-secondary px-2 py-0.5 rounded">
                        {t("configMissing")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/events/${event.id}`}
                      className="text-xs font-medium text-primary/60 hover:text-primary hover:scale-110 transition-all duration-200 inline-block"
                    >
                      <Eye />
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
            {startItem}–{endItem} {t("paginationOf")} {totalCount}
          </span>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
              aria-disabled={currentPage <= 1}
              className={`p-2 rounded-lg border border-foreground/80 transition-colors ${
                currentPage <= 1
                  ? "pointer-events-none opacity-30"
                  : "hover:bg-primary/10"
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
                  : "hover:bg-primary/10"
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

// ---------------------------------------------------------------------------
// Subcomponent: Platform Multi-Select
// ---------------------------------------------------------------------------

function PlatformFilter({
  allPlatforms,
  selected,
  onToggle,
  label,
  allLabel,
}: {
  allPlatforms: string[];
  selected: string[];
  onToggle: (platform: string) => void;
  label: string;
  allLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? selected[0]
        : `${label} (${selected.length})`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[160px] text-left hover:bg-primary/20 transition-colors"
      >
        {summary}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-64 max-h-80 overflow-y-auto rounded-xl border border-primary bg-background shadow-lg p-1">
            {allPlatforms.map((platform) => {
              const isSelected = selected.includes(platform);
              return (
                <button
                  key={platform}
                  onClick={() => onToggle(platform)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left hover:bg-primary/10 transition-colors"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-foreground/30"
                    }`}
                  >
                    {isSelected && (
                      <Check size={12} className="text-background" />
                    )}
                  </span>
                  {platform}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
