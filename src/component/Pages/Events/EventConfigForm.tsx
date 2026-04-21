"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Save, Plus, Check } from "lucide-react";
import {
  createEventConfig,
  updateEventConfig,
} from "@/app/[locale]/(protected)/events/[id]/actions";
import type {
  EventConfig,
  ThemeOption,
  ContentDisplayOption,
} from "@/services/speaker/dashboard";
import ThemePreview from "./ThemePreview";

type Props = {
  airtableId: string;
  config: EventConfig | null;
  themes: ThemeOption[];
  contentOptions: ContentDisplayOption[];
};

export default function EventConfigForm({
  airtableId,
  config,
  themes,
  contentOptions,
}: Props) {
  const t = useTranslations("EventDetail");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const [themeId, setThemeId] = useState(config?.themeId ?? "");
  const [contentDisplay, setContentDisplay] = useState<string[]>(
    config?.contentDisplay ?? [],
  );
  const [accessPassword, setAccessPassword] = useState(
    config?.accessPassword ?? "",
  );

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createEventConfig(airtableId);
      if (result.success) {
        setStatus("saved");
        router.refresh();
      } else {
        setStatus("error");
      }
    });
  };

  const handleSave = () => {
    if (!config) return;
    startTransition(async () => {
      const result = await updateEventConfig({
        directusId: config.directusId,
        airtableId,
        themeId: themeId || null,
        contentDisplay,
        accessPassword: accessPassword || null,
      });
      setStatus(result.success ? "saved" : "error");
      if (result.success) {
        router.refresh();
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  };

  const toggleContent = (key: string) => {
    setContentDisplay((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ── Config existiert nicht: Create-Button ────────────────────────────────
  if (!config) {
    return (
      <div className="rounded-2xl border border-secondary bg-secondary/10 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-2">
          {t("configHeading")}
        </h2>
        <p className="text-sm text-foreground/70 mb-4">
          {t("missingConfigText")}
        </p>
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium disabled:opacity-50"
        >
          <Plus size={16} />
          {t("createConfig")}
        </button>
      </div>
    );
  }

  // ── Config existiert: Edit-Form ──────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
          {t("configHeading")}
        </h2>
        {status === "saved" && (
          <span className="flex items-center gap-1 text-xs text-primary">
            <Check size={14} />
            {t("saved")}
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-secondary">{t("saveError")}</span>
        )}
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("themeLabel")}
          </label>
          <p className="text-xs text-foreground/60 mb-2">{t("themeHint")}</p>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">{t("themeNone")}</option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name ?? `Theme ${theme.id}`}
              </option>
            ))}
          </select>

          <ThemePreview theme={themes.find((t) => t.id === themeId) ?? null} />
        </div>

        {/* Content Display */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("contentDisplayLabel")}
          </label>
          <p className="text-xs text-foreground/60 mb-3">
            {t("contentDisplayHint")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {contentOptions.map((opt) => {
              const isActive = contentDisplay.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleContent(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm text-left transition-colors ${
                    isActive
                      ? "border-primary bg-primary/20 text-primary font-medium"
                      : "border-foreground/10 bg-background hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-primary border-primary"
                        : "border-foreground/30"
                    }`}
                  >
                    {isActive && (
                      <Check size={12} className="text-background" />
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Access Password */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("passwordLabel")}
          </label>
          <p className="text-xs text-foreground/60 mb-2">{t("passwordHint")}</p>
          <input
            type="text"
            value={accessPassword}
            onChange={(e) => setAccessPassword(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-primary bg-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder={t("passwordPlaceholder")}
          />
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2 border-t border-foreground/5">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium disabled:opacity-50"
          >
            <Save size={16} />
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
