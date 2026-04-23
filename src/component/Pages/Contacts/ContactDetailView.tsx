"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { Mail, Phone, Linkedin, Globe, ExternalLink } from "lucide-react";
import type {
  ContactDetail,
  ContactContribution,
  ContactMandate,
} from "@/services/speaker/contacts";
import CopyButton from "@/component/UI/CopyButton";
import { formatEventDate } from "@/utils/format";

type Props = {
  contact: ContactDetail;
  contributions: ContactContribution[];
  variant?: "page" | "drawer";
};

export default function ContactDetailView({
  contact,
  contributions,
  variant = "page",
}: Props) {
  const locale = useLocale();
  const t = useTranslations("ContactDetail");
  const format = useFormatter();

  const sorted = [...contributions].sort((a, b) =>
    (a.eventDate ?? "").localeCompare(b.eventDate ?? ""),
  );
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = sorted.find((c) => (c.eventDate ?? "") >= todayIso);
  const quickAccess = upcoming ?? sorted[sorted.length - 1];

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window === "undefined" ? "" : window.location.origin);

  const dossierUrl = (contribId: string) =>
    `${baseUrl}/${locale}/speaker/${contribId}`;

  const isDrawer = variant === "drawer";

  return (
    <div className={isDrawer ? "p-6" : "p-8 max-w-[1200px] mx-auto"}>
      {/* Header */}
      <div className="flex items-start gap-6 mb-6">
        {contact.profilePhoto ? (
          <div
            className={`shrink-0 rounded-full overflow-hidden bg-foreground/5 relative ${
              isDrawer ? "w-16 h-16" : "w-24 h-24"
            }`}
          >
            <Image
              src={
                contact.profilePhoto.thumbnailUrl ?? contact.profilePhoto.url
              }
              alt={contact.speakerName}
              fill
              sizes={isDrawer ? "64px" : "96px"}
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={`shrink-0 rounded-full overflow-hidden bg-foreground/5 relative ${
              isDrawer ? "w-16 h-16" : "w-24 h-24"
            }`}
          >
            <Image
              src="/assets/avatar-placeholder.png"
              alt="avatar-placeholder"
              fill
              sizes={isDrawer ? "64px" : "96px"}
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1
            className={
              isDrawer ? "text-xl font-bold mb-1" : "text-3xl font-bold mb-1"
            }
          >
            {contact.speakerName}
          </h1>
          {(contact.position || contact.organizations.length > 0) && (
            <p className="text-sm text-foreground/60 mb-3">
              {[contact.position, ...contact.organizations]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <ContactLinks contact={contact} />
        </div>
      </div>

      {/* Quick-Access Dossier */}
      {quickAccess && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 mb-6 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-foreground/60 mb-0.5">
              {t("quickDossier")}
              {quickAccess.eventName && ` — ${quickAccess.eventName}`}
            </p>
            <p className="text-sm font-mono truncate">
              {dossierUrl(quickAccess.id)}
            </p>
          </div>
          <CopyButton
            value={dossierUrl(quickAccess.id)}
            label={t("copyLink")}
          />
          <Link
            href={`/speaker/${quickAccess.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {t("open")} <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Metadata + Notes */}
      <div
        className={`grid gap-6 mb-6 ${
          isDrawer ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        <section
          className={`rounded-2xl border border-foreground/10 bg-background p-6 ${
            isDrawer ? "" : "md:col-span-2"
          }`}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-4">
            {t("metadataHeading")}
          </h2>
          <dl className="space-y-3">
            {contact.gender && (
              <MetaRow
                label={t("gender")}
                value={
                  <span className="text-sm">
                    {["m", "f", "d"].includes(contact.gender)
                      ? t(`genderValues.${contact.gender}`)
                      : contact.gender}
                  </span>
                }
              />
            )}
            {contact.languages.length > 0 && (
              <MetaRow
                label={t("languages")}
                value={chips(contact.languages)}
              />
            )}
            {contact.kontaktart.length > 0 && (
              <MetaRow
                label={t("kontaktart")}
                value={chips(contact.kontaktart)}
              />
            )}
            {contact.speakerkategorie.length > 0 && (
              <MetaRow
                label={t("speakerkategorie")}
                value={chips(contact.speakerkategorie)}
              />
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-background p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-4">
            {t("notesHeading")}
          </h2>
          {contact.notes ? (
            <p className="text-sm whitespace-pre-line">{contact.notes}</p>
          ) : (
            <p className="text-sm text-foreground/40">{t("notesEmpty")}</p>
          )}
        </section>
      </div>

      {/* Contributions */}
      <section className="rounded-2xl border border-foreground/10 bg-background p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-4">
          {t("contributionsHeading", { count: contributions.length })}
        </h2>
        {contributions.length === 0 ? (
          <p className="text-sm text-foreground/40">
            {t("contributionsEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {sorted
              .slice()
              .reverse()
              .map((c) => (
                <ContributionRow
                  key={c.id}
                  contribution={c}
                  dateLabel={formatEventDate(format, c.eventDate)}
                  dossierLink={dossierUrl(c.id)}
                />
              ))}
          </ul>
        )}
      </section>

      {/* Mandates */}
      <section className="rounded-2xl border border-foreground/10 bg-background p-6 mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-4">
          {t("mandatesHeading", { count: contact.mandates?.length ?? 0 })}
        </h2>
        {!contact.mandates || contact.mandates.length === 0 ? (
          <p className="text-sm text-foreground/40">{t("mandatesEmpty")}</p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {contact.mandates.map((m) => (
              <MandateRow key={m.id} mandate={m} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─ Sub-components ──────────────────────────────────────────────────────────

function ContactLinks({
  contact,
}: {
  contact: Pick<ContactDetail, "email" | "phone" | "linkedin" | "website">;
}) {
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition"
        >
          <Mail size={14} /> {contact.email}
        </a>
      )}
      {contact.phone && (
        <a
          href={`tel:${contact.phone}`}
          className="inline-flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition"
        >
          <Phone size={14} /> {contact.phone}
        </a>
      )}
      {contact.linkedin && (
        <a
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition"
        >
          <Linkedin size={14} /> LinkedIn
        </a>
      )}
      {contact.website && (
        <a
          href={contact.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition"
        >
          <Globe size={14} /> {stripUrl(contact.website)}
        </a>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-foreground/5 last:border-0">
      <dt className="text-sm text-foreground/60 shrink-0">{label}</dt>
      <dd className="text-sm text-right flex flex-wrap justify-end gap-1.5">
        {value}
      </dd>
    </div>
  );
}

function chips(values: string[]) {
  return values.map((v) => (
    <span
      key={v}
      className="inline-block text-xs bg-foreground/5 px-2 py-0.5 rounded"
    >
      {v}
    </span>
  ));
}

function ContributionRow({
  contribution,
  dateLabel,
  dossierLink,
}: {
  contribution: ContactContribution;
  dateLabel: string;
  dossierLink: string;
}) {
  return (
    <li className="py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {contribution.eventId ? (
            <Link
              href={`/events/${contribution.eventId}`}
              className="text-sm font-medium hover:underline"
            >
              {contribution.eventName ?? contribution.eventId}
            </Link>
          ) : (
            <span className="text-sm font-medium">
              {contribution.eventName ?? "—"}
            </span>
          )}
          <span className="text-xs text-foreground/60">{dateLabel}</span>
          {contribution.briefingStatus && (
            <span className="text-[11px] uppercase tracking-wide bg-foreground/5 px-2 py-0.5 rounded">
              {contribution.briefingStatus}
            </span>
          )}
        </div>
      </div>
      <CopyButton value={dossierLink} label="Link" />
      <Link
        href={`/speaker/${contribution.id}`}
        target="_blank"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
      >
        <ExternalLink size={12} />
      </Link>
    </li>
  );
}

function MandateRow({ mandate }: { mandate: ContactMandate }) {
  const orgName = mandate.organizationNames[0];
  const website = mandate.organizationWebsites[0];

  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{mandate.position ?? "—"}</p>
          {orgName && (
            <p className="text-xs text-foreground/60">
              {website ? (
                <a
                  href={
                    website.startsWith("http") ? website : `https://${website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center gap-1"
                >
                  {orgName}
                  <ExternalLink size={10} />
                </a>
              ) : (
                orgName
              )}
            </p>
          )}
        </div>
        {mandate.organizationCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mandate.organizationCategories.map((cat) => (
              <span
                key={cat}
                className="inline-block text-[11px] bg-foreground/5 px-2 py-0.5 rounded"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function stripUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
