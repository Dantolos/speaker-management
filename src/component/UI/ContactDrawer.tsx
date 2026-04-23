"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ExternalLink, Loader2 } from "lucide-react";
import type {
  ContactDetail,
  ContactContribution,
} from "@/services/speaker/contacts";
import ContactDetailView from "@/component/Pages/Contacts/ContactDetailView";

type Props = {
  contactId: string | null;
  onClose: () => void;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      contact: ContactDetail;
      contributions: ContactContribution[];
    }
  | { status: "error"; message: string };

export default function ContactDrawer({ contactId, onClose }: Props) {
  const [state, setState] = useState<FetchState>({ status: "idle" });

  // Close on Escape
  useEffect(() => {
    if (!contactId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [contactId, onClose]);

  // Fetch when opened
  useEffect(() => {
    if (!contactId) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/contacts/${contactId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(
        (data: {
          contact: ContactDetail;
          contributions: ContactContribution[];
        }) => {
          if (cancelled) return;
          setState({
            status: "ready",
            contact: data.contact,
            contributions: data.contributions,
          });
        },
      )
      .catch((e: Error) => {
        if (cancelled) return;
        setState({ status: "error", message: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [contactId]);

  const open = Boolean(contactId);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[720px] bg-background shadow-2xl z-50 transition-transform overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header actions */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 bg-background border-b border-foreground/10">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {contactId && (
            <Link
              href={`/contacts/${contactId}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} />
              In voller Seite öffnen
            </Link>
          )}
        </div>

        {/* Content */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center p-12 text-foreground/50">
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}
        {state.status === "error" && (
          <div className="p-6 text-sm text-red-600">
            Fehler beim Laden: {state.message}
          </div>
        )}
        {state.status === "ready" && (
          <ContactDetailView
            contact={state.contact}
            contributions={state.contributions}
            variant="drawer"
          />
        )}
      </aside>
    </>
  );
}
