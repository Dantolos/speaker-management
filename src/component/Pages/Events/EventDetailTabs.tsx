"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, type ReactNode } from "react";

type TabId = "general" | "dossier" | "program" | "metrics";

const VALID_TABS: TabId[] = ["general", "dossier", "program", "metrics"];

interface Props {
  general: ReactNode;
  dossier: ReactNode;
  program: ReactNode;
  metrics: ReactNode;
}

export default function EventDetailTabs({
  general,
  dossier,
  program,
  metrics,
}: Props) {
  const t = useTranslations("EventDetail");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab: TabId = VALID_TABS.includes(tabParam as TabId)
    ? (tabParam as TabId)
    : "general";

  const setTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "general") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "general", label: t("tabGeneral") },
    { id: "dossier", label: t("tabDossier") },
    { id: "program", label: t("tabProgram") },
    { id: "metrics", label: t("tabMetrics") },
  ];

  return (
    <div>
      {/* Tab-Bar */}
      <div
        role="tablist"
        aria-label={t("tabsAriaLabel")}
        className="inline-flex items-center gap-1 rounded-xl bg-foreground/5 p-1 mb-6"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? "bg-background text-primary shadow-sm"
                  : "text-foreground/60 hover:text-foreground/90"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div
        role="tabpanel"
        id="panel-general"
        aria-labelledby="tab-general"
        hidden={activeTab !== "general"}
      >
        {activeTab === "general" && general}
      </div>
      <div
        role="tabpanel"
        id="panel-dossier"
        aria-labelledby="tab-dossier"
        hidden={activeTab !== "dossier"}
      >
        {activeTab === "dossier" && dossier}
      </div>
      <div
        role="tabpanel"
        id="panel-program"
        aria-labelledby="tab-program"
        hidden={activeTab !== "program"}
      >
        {activeTab === "program" && program}
      </div>
      <div
        role="tabpanel"
        id="panel-metrics"
        aria-labelledby="tab-metrics"
        hidden={activeTab !== "metrics"}
      >
        {activeTab === "metrics" && metrics}
      </div>
    </div>
  );
}
