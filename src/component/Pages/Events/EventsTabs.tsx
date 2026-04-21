"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  activeTab: "upcoming" | "past";
  upcomingCount: number;
  pastCount: number;
};

export default function EventsTabs({
  activeTab,
  upcomingCount,
  pastCount,
}: Props) {
  const t = useTranslations("EventsOverview");
  const pathname = usePathname();

  const tabs = [
    { key: "upcoming" as const, label: t("tabUpcoming"), count: upcomingCount },
    { key: "past" as const, label: t("tabPast"), count: pastCount },
  ];

  return (
    <div className="flex gap-1 border-b border-foreground/10">
      {tabs.map(({ key, label, count }) => {
        const isActive = activeTab === key;
        const href = key === "upcoming" ? pathname : `${pathname}?tab=past`;

        return (
          <Link
            key={key}
            href={href}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
              isActive
                ? "border-primary text-primary font-medium"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {label}
            <span className="ml-2 text-xs text-foreground/40">({count})</span>
          </Link>
        );
      })}
    </div>
  );
}
