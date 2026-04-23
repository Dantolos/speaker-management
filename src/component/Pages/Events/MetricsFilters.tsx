"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import type { EventFilterOption } from "@/services/speaker/dashboard";

type Props = {
  allPlatforms: string[];
  allEvents: EventFilterOption[];
  currentTimeframe: "all" | "upcoming" | "past";
  currentPlatforms: string[];
  currentEvent: string;
};

export default function MetricsFilters({
  allPlatforms,
  allEvents,
  currentTimeframe,
  currentPlatforms,
  currentEvent,
}: Props) {
  const t = useTranslations("EventsOverview");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const navigate = (overrides: Record<string, string | undefined>) => {
    startTransition(() => router.push(buildUrl(overrides)));
  };

  const togglePlatform = (platform: string) => {
    const next = currentPlatforms.includes(platform)
      ? currentPlatforms.filter((p) => p !== platform)
      : [...currentPlatforms, platform];
    navigate({ platforms: next.length ? next.join(",") : undefined });
  };

  const handleTimeframe = (value: string) => {
    navigate({ timeframe: value === "all" ? undefined : value });
  };

  const handleEvent = (value: string) => {
    navigate({ event: value || undefined });
  };

  const handleClearFilters = () => {
    navigate({
      timeframe: undefined,
      platforms: undefined,
      event: undefined,
    });
  };

  const hasActiveFilters =
    currentTimeframe !== "all" || currentPlatforms.length > 0 || !!currentEvent;

  return (
    <div
      className={`flex flex-wrap gap-3 items-center mb-4 ${
        isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
      }`}
    >
      {/* Zeitraum */}
      <select
        value={currentTimeframe}
        onChange={(e) => handleTimeframe(e.target.value)}
        className="py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[140px]"
      >
        <option value="all">{t("timeframeAll")}</option>
        <option value="upcoming">{t("timeframeUpcoming")}</option>
        <option value="past">{t("timeframePast")}</option>
      </select>

      {/* Plattform Multi-Select */}
      <PlatformFilter
        allPlatforms={allPlatforms}
        selected={currentPlatforms}
        onToggle={togglePlatform}
        label={t("platformsLabel")}
        allLabel={t("platformsAll")}
      />

      {/* Event Single-Select */}
      <select
        value={currentEvent}
        onChange={(e) => handleEvent(e.target.value)}
        className="py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[180px]"
      >
        <option value="">{t("eventAll")}</option>
        {allEvents.map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.name}
          </option>
        ))}
      </select>

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
    </div>
  );
}

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
