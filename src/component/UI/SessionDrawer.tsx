"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { X, ExternalLink, Loader2 } from "lucide-react";
import type { SessionDetail } from "@/services/speaker/program";
import SessionDetailView from "@/component/Pages/Events/Sessions/SessionDetailView";

type Props = {
  sessionId: string | null;
  eventId: string;
  onClose: () => void;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; session: SessionDetail }
  | { status: "error"; message: string };

export default function SessionDrawer({ sessionId, eventId, onClose }: Props) {
  const locale = useLocale();
  const t = useTranslations("SessionDetail");
  const [state, setState] = useState<FetchState>({ status: "idle" });

  useEffect(() => {
    if (!sessionId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sessionId, onClose]);

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { session: SessionDetail }) => {
        if (cancelled) return;
        setState({ status: "ready", session: data.session });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setState({ status: "error", message: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const open = Boolean(sessionId);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[640px] bg-[var(--color-box-background)] shadow-2xl z-50 transition-transform overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 bg-[var(--color-box-background)] border-b border-[var(--color-border-tertiary,#e5e5e5)]">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-background-secondary,#f5f5f5)] cursor-pointer"
            aria-label={t("close")}
          >
            <X size={18} />
          </button>
          {sessionId && (
            <Link
              href={`/${locale}/events/${eventId}/sessions/${sessionId}`}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-secondary)] hover:underline"
            >
              <ExternalLink size={14} />
              {t("openFullPage")}
            </Link>
          )}
        </div>

        {state.status === "loading" && (
          <div className="flex items-center justify-center p-12 text-[var(--color-text-secondary,#666)]">
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}
        {state.status === "error" && (
          <div className="p-6 text-sm text-red-600">
            {t("loadError")}: {state.message}
          </div>
        )}
        {state.status === "ready" && (
          <SessionDetailView session={state.session} variant="drawer" />
        )}
      </aside>
    </>
  );
}
