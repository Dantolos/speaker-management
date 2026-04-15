import { notFound, redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import {
  BedDouble,
  Calendar,
  Globe,
  Info,
  KeyRound,
  Languages,
  MessageCircleWarning,
  Mic,
  Phone,
  Spotlight,
} from "lucide-react";

import { getSpeaker } from "@/services/airtable";
import { getSession, getTeamSession } from "@/utils/auth";
import programDataMapping from "@/services/programMapping";

import Accordeon from "@/component/UI/Accordeon";
import InfoRow from "@/component/speakerDossier/InfoRow";
import LinkButton from "@/component/speakerDossier/LinkButton";
import Schedule from "@/component/speakerDossier/Schedule";
import ButtonGeneratePdf from "@/component/speakerDossier/ButtonGeneratePdf";
import Link from "next/link";
import type { DeepPartialSpeaker } from "@/types/speaker";
import LanguageSwitch from "@/component/UI/LanguageSwitch";
import { directus } from "@/services/directus";
import { readItems } from "@directus/sdk";
import DarkModeToggle from "@/component/UI/DarkModeToggle";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type Place = NonNullable<NonNullable<DeepPartialSpeaker["Event"]>["Location"]>;

function AddressBlock({ place }: { place: Place | null | undefined }) {
  if (!place) return null;
  return (
    <>
      <p className="font-bold  ">{place.Name}</p>
      <p>{`${place.Strasse} ${place.Hausnummer}`}</p>
      <p>{`${place.PLZ} ${place.Stadt}`}</p>
      <p>{place.Land}</p>
    </>
  );
}

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function toDate(value: string | undefined, fallback = new Date()): Date {
  return value ? new Date(value) : fallback;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpeakerPage({ params }: Props) {
  const { locale, id } = await params;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [session, sessionTeam] = await Promise.all([
    getSession(),
    getTeamSession(),
  ]);
  if (!session.isAuthenticated && !sessionTeam.isAuthenticated) {
    redirect(`/sign-in?redirect=/speaker/${id}`);
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const [data, t, tg, format] = await Promise.all([
    getSpeaker(id),
    getTranslations({ locale, namespace: "SpeakerBriefing" }),
    getTranslations({ locale, namespace: "General" }),
    getFormatter({ locale }),
  ]);

  if (!data) notFound();

  const ProgramData = await programDataMapping(data);

  // ---- get settings -------------------------------------------------------
  const eventSettings = await directus.request(
    readItems("events", {
      filter: { event_name: { _eq: data.Event?.Name } },
      fields: ["*", "theme.*"],
    }),
  );

  const theme = eventSettings[0]?.theme;

  const contentDisplay =
    eventSettings[0]?.content_display &&
    eventSettings[0]?.content_display?.length > 0
      ? eventSettings[0]?.content_display
      : false;

  // ── Derived values ────────────────────────────────────────────────────────
  const eventStart = toDate(data.Event?.["Beginn"]);
  const eventEnd = data.Event?.["Ende"] ? toDate(data.Event?.["Ende"]) : null;
  const sessionStart = data.Sessions?.[0]?.["Start (from Sessions NEW)"]
    ? toDate(data.Sessions?.[0]?.["Start (from Sessions NEW)"])
    : null;
  const checkinDate = data["Hotel Check-In"]
    ? new Date(data["Hotel Check-In"])
    : undefined;
  const checkoutDate = data["Hotel Check-Out"]
    ? new Date(data["Hotel Check-Out"])
    : undefined;

  const speakerName = data.Person?.["Speaker Name"] ?? "";
  const formattedFilename = speakerName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const location = data.Event?.Location;
  const hotel = data.Hotel;
  const firstSession = data.Sessions?.[0];

  // ── Formatters ────────────────────────────────────────────────────────────
  const fmtDate = (d: Date) =>
    format.dateTime(d, { year: "numeric", month: "long", day: "numeric" });
  const fmtDateTime = (d: Date) =>
    `${format.dateTime(d, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })} | ${format.dateTime(d, {
      hour: "numeric",
      minute: "2-digit",
    })}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
      (function() {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', '${theme?.primary_color ?? "#9f9577"}');
        root.style.setProperty('--color-secondary', '${theme?.secondary_color ?? "#3b616e"}');
        root.style.setProperty('--color-background', '${theme?.background ?? "#ffffff"}');
        root.style.setProperty('--color-foreground', '${theme?.foreground ?? "#0f0f0f"}');
        root.style.setProperty('--color-background-dark', '${theme?.foreground ?? "#0f0f0f"}');
        root.style.setProperty('--color-foreground-dark', '${theme?.background ?? "#ffffff"}');
      })();
    `,
        }}
      />
      <div className="bg-background text-font-primary min-h-dvh">
        <div className="bg-primary/5 min-h-dvh ">
          <div className="p-8 max-w-[800px] m-auto min-h-dvw">
            {/* Header */}
            <div className="mb-4 flex justify-between">
              <h1 className="text-4xl font-bold mb-4">
                {t("title")} {speakerName || "Kein Name"}
              </h1>
              <div className="flex gap-2 h-10">
                <LanguageSwitch currentLocale={locale} />
                <DarkModeToggle />
              </div>
            </div>

            {/* Event overview */}
            <Accordeon title={t("section-event")} icon={<Info />}>
              <div className="flex flex-col gap-4 ">
                <h3 className="text-xl font-bold">
                  {data.Event?.Plattformen?.["Conference Name"] ?? "Event"}
                </h3>

                <div className="flex gap-5 w-full justify-between">
                  {[
                    { label: tg("from"), value: fmtDateTime(eventStart) },
                    {
                      label: tg("till"),
                      value: eventEnd ? fmtDateTime(eventEnd) : null,
                    },
                  ]
                    .filter(({ value }) => value != null)
                    .map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-primary/10 rounded-2xl pr-4"
                      >
                        <span className="font-bold bg-primary px-4 py-1 mr-2 rounded-2xl">
                          {label}
                        </span>
                        <span>{value}</span>
                      </div>
                    ))}
                </div>

                {location && (
                  <div className="p-2 bg-primary/10 rounded-2xl">
                    <AddressBlock place={location} />
                  </div>
                )}

                <div className="flex gap-2 w-full">
                  <LinkButton
                    text={tg("website")}
                    link="https://startupdays.ch/"
                    icon={<Globe size={30} />}
                  />
                  <LinkButton
                    text={tg("speaker")}
                    link="https://sud26.startupdays.ch/components/52926"
                    icon={<Mic size={30} />}
                  />
                  <LinkButton
                    text={tg("program")}
                    link="https://sud26.startupdays.ch/components/52339"
                    icon={<Calendar size={30} />}
                  />
                </div>
              </div>
            </Accordeon>

            {/* Session / Gig */}

            {contentDisplay && contentDisplay.includes("gig") && (
              <Accordeon title={t("section-gig")} icon={<Spotlight />}>
                {sessionStart && (
                  <InfoRow
                    label={t("label-date")}
                    value={<p>{fmtDate(sessionStart)}</p>}
                  />
                )}

                {firstSession?.Room && (
                  <InfoRow
                    label={t("label-room")}
                    value={<p>{firstSession.Room}</p>}
                  />
                )}

                {firstSession?.Sessionsprache && (
                  <InfoRow
                    label={t("label-language")}
                    value={<p>{firstSession.Sessionsprache}</p>}
                  />
                )}
              </Accordeon>
            )}

            {/* Hotel */}
            {contentDisplay &&
              contentDisplay.includes("hotel") &&
              hotel?.Name && (
                <Accordeon title={t("section-stay")} icon={<BedDouble />}>
                  {data["Anmerkung zum Aufenthalt"] && (
                    <p>{data["Anmerkung zum Aufenthalt"]}</p>
                  )}

                  <InfoRow
                    label={t("label-hotel")}
                    value={<AddressBlock place={hotel} />}
                  />

                  {checkinDate && (
                    <InfoRow
                      label={t("label-check-in")}
                      value={<p>{fmtDate(checkinDate)}</p>}
                    />
                  )}
                  {checkoutDate && (
                    <InfoRow
                      label={t("label-check-out")}
                      value={<p>{fmtDate(checkoutDate)}</p>}
                    />
                  )}
                  {data["Hotel Confirmation Number"] && (
                    <InfoRow
                      label={t("label-booking-nr")}
                      value={<p>{data["Hotel Confirmation Number"]}</p>}
                    />
                  )}
                </Accordeon>
              )}

            {/* On-site contact */}
            {contentDisplay && contentDisplay.includes("onsite") && (
              <div className="bg-box-background shadow-xl rounded-2xl my-4 p-4">
                <h2 className="text-2xl font-bold border-b pb-2 mb-4 border-b-foreground/60">
                  {t("section-on-site")}
                </h2>

                <InfoRow
                  label={t("on-site-badge")}
                  value={<p>{t("badge-information")}</p>}
                />
                {data.Referentenbetreuer && (
                  <InfoRow
                    label={t("on-site-contact")}
                    note={t("on-site-contact-text")}
                    value={
                      <div className="flex flex-col gap-1">
                        <h5 className="font-bold">
                          {data.Referentenbetreuer["First Name"]}{" "}
                          {data.Referentenbetreuer["Last Name"]}
                        </h5>

                        {data.Referentenbetreuer["Phone Number"] && (
                          <div className="bg-primary/10   rounded-2xl py-1 px-2 flex gap-2 items-center">
                            <Phone size={20} />
                            {data.Referentenbetreuer["Phone Number"]}
                          </div>
                        )}

                        {data.Referentenbetreuer["Sprachen"]?.length && (
                          <div className="bg-primary/10 rounded-2xl py-1 px-2 flex gap-2 items-center">
                            <Languages size={20} />
                            {data.Referentenbetreuer["Sprachen"].map(
                              (sprache, i) => (
                                <span
                                  key={i}
                                  className="bg-primary/20 rounded-2xl py-1 px-2"
                                >
                                  {t(sprache!)}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                )}
              </div>
            )}

            {/* Schedule */}
            {contentDisplay &&
              contentDisplay.includes("individualprogram") &&
              ProgramData?.length > 0 && (
                <div className="break-before-page my-4">
                  <div className="rounded-2xl p-4 bg-box-background shadow-xl">
                    <h3 className="text-2xl font-bold border-b pb-2 border-b-foreground/60">
                      {t("section-schedule")}
                    </h3>
                  </div>
                  <p className="p-4">{t("schedule-text")}</p>
                  <div className="flex flex-col gap-4">
                    <Schedule ProgramData={ProgramData} />
                  </div>
                </div>
              )}

            {/* Platform */}
            {contentDisplay &&
              contentDisplay.includes("b2match") &&
              data["Zugangsdaten Plattform"] && (
                <Accordeon title={t("section-platform")} icon={<KeyRound />}>
                  <div className="mb-2">
                    <p>{t("plafrorm-text")}</p>
                  </div>
                  <div className="   my-2">
                    <LinkButton
                      text={t("platform-btn")}
                      link="https://sud26.startupdays.ch/sign-in"
                      icon={<Globe />}
                    ></LinkButton>
                  </div>
                  <div className="w-full">
                    <InfoRow
                      label={t("platform-user")}
                      value={<p>{data["Email direkt (from Person)"]}</p>}
                    />
                    <InfoRow
                      label={t("platform-pwd")}
                      value={<p>{data["Zugangsdaten Plattform"]}</p>}
                    />
                    <div className="flex items-center mt-2 gap-2 border-1 border-secondary rounded-2xl py-3 px-3 bg-secondary/5 text-secondary">
                      <MessageCircleWarning />
                      <p>{t("platform-pwd-note")}</p>
                    </div>
                  </div>
                </Accordeon>
              )}

            {/* Static sections */}
            {contentDisplay &&
              contentDisplay.includes("about") &&
              [{ key: "section-about", textKey: "about-text" }].map(
                ({ key, textKey }) => (
                  <div
                    key={key}
                    className="bg-box-background shadow-xl rounded-2xl my-4 p-4"
                  >
                    <h3 className="text-2xl font-bold border-b border-b-foreground/60 pb-2 mb-4">
                      {t(key)}
                    </h3>
                    <p>{t(textKey)}</p>
                  </div>
                ),
              )}

            {/* Contact */}
            {contentDisplay && contentDisplay.includes("contact") && (
              <div className="bg-box-background shadow-xl rounded-2xl my-4 p-4">
                <h3 className="text-2xl font-bold border-b border-b-foreground/60 pb-2 mb-4">
                  {t("section-contact")}
                </h3>
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="w-[300px]">
                    <p className="font-bold">
                      {data.Event?.Plattformen?.["Conference Name"]}
                    </p>
                    <p>c/o LINDEN 3L AG</p>
                    <p>Weyermannsstrasse 36</p>
                    <p>3008 Bern</p>
                    <Link href="mailto:hello@andermatt-dialog.ch">
                      hello@startupdays.ch
                    </Link>
                  </div>
                  <div className="w-[300px]">
                    <p className="font-bold">{t("contact-person")}</p>
                    <p>Senior Project Manager</p>
                    <p>Alexandra Leemann</p>
                    <p>Tel: +49 172 133 76 50</p>
                    <Link href="mailto:ruth.inniger@lucerne-dialogue.ch">
                      ale@livelearninglabs.ch
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* PDF */}
            <div className="w-full flex items-center justify-center">
              <ButtonGeneratePdf
                filename={`${t("pdf-filename")}_${formattedFilename}`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
