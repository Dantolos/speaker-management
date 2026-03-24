import { notFound, redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import {
  BedDouble,
  Calendar,
  Globe,
  Info,
  KeyRound,
  Languages,
  Mic,
  Phone,
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type Place = NonNullable<NonNullable<DeepPartialSpeaker["Event"]>["Location"]>;

function AddressBlock({ place }: { place: Place | null | undefined }) {
  if (!place) return null;
  return (
    <>
      <p className="font-bold">{place.Name}</p>
      <p>{`${place.Strasse} ${place.Hausnummer}`}</p>
      <p>{`${place.PLZ} ${place.Stadt}`}</p>
      <p>{place.Land}</p>
    </>
  );
}

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

  // ── Derived values ────────────────────────────────────────────────────────
  const eventStart = toDate(data.Event?.["Beginn"]);
  const eventEnd = data.Event?.["Ende"] ? toDate(data.Event?.["Ende"]) : null;
  const _sessionStart = data.Sessions?.[0]?.["Start (from Sessions NEW)"]
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
  const _firstSession = data.Sessions?.[0];

  // ── Formatters ────────────────────────────────────────────────────────────
  const fmtDate = (d: Date) =>
    format.dateTime(d, { year: "numeric", month: "long", day: "numeric" });
  const fmtDateTime = (d: Date) =>
    format.dateTime(d, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-[800px] m-auto text-font-primary">
      {/* Header */}
      <div className="mb-4 flex justify-between">
        <h1 className="text-4xl font-bold mb-4">
          {t("title")} {speakerName || "Kein Name"}
        </h1>
        <LanguageSwitch currentLocale={locale} />
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
                <div key={label} className="bg-primary/10 rounded-2xl pr-4">
                  <span className="font-bold bg-primary/20 px-4 py-1 mr-2 rounded-2xl">
                    {label}
                  </span>
                  <span>{value}</span>
                </div>
              ))}
          </div>

          {location && (
            <div className="p-2 bg-white rounded-2xl">
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

      {/*<Accordeon title={t("section-gig")} icon={<Spotlight />}>
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
        </Accordeon>*/}

      {/* Hotel */}
      {hotel?.Name && (
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
      {data.Referentenbetreuer && (
        <div className="bg-box-background shadow-xl rounded-2xl my-4 p-4">
          <h2 className="text-2xl font-bold border-b pb-2 mb-4">
            {t("section-on-site")}
          </h2>

          <InfoRow
            label={t("on-site-badge")}
            value={<p>{t("badge-information")}</p>}
          />

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
                    {data.Referentenbetreuer["Sprachen"].map((sprache, i) => (
                      <span key={i} className="bg-white rounded-2xl py-1 px-2">
                        {t(sprache!)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            }
          />
        </div>
      )}

      {/* Schedule */}
      {ProgramData?.length > 0 && (
        <div className="break-before-page my-4">
          <div className="rounded-2xl p-4 bg-box-background shadow-xl">
            <h3 className="text-2xl font-bold border-b pb-2">
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
      {data["Zugangsdaten Plattform"] && (
        <Accordeon title={t("section-platform")} icon={<KeyRound />}>
          <ul className="mb-2">
            <li>
              You are already registered for the event on our platform. You can
              log in with your login data.
            </li>
            <li>
              Feel free to update your profile and book your sessions or 1:1
              meetings.
            </li>
            <li>
              Login with your e-mail address{" "}
              <b>{data["Email direkt (from Person)"]}</b>
              and your password
            </li>
          </ul>
          <div className="w-full">
            <InfoRow
              label={t("platform-pwd")}
              value={<p>{data["Zugangsdaten Plattform"]}</p>}
            />
          </div>
          <div className="  my-2">
            <LinkButton
              text="Platform"
              link="https://sud25.startupdays.ch/login?next=/promotion-code"
              icon={<Globe />}
            ></LinkButton>
          </div>
        </Accordeon>
      )}

      {/* Static sections */}
      {[
        //{ key: "section-media", textKey: "media-text" },
        { key: "section-about", textKey: "about-text" },
      ].map(({ key, textKey }) => (
        <div
          key={key}
          className="bg-box-background shadow-xl rounded-2xl my-4 p-4"
        >
          <h3 className="text-2xl font-bold border-b pb-2 mb-4">{t(key)}</h3>
          <p>{t(textKey)}</p>
        </div>
      ))}

      {/* Contact */}
      <div className="bg-box-background shadow-xl rounded-2xl my-4 p-4">
        <h3 className="text-2xl font-bold border-b pb-2 mb-4">
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

      {/* PDF */}
      <div className="w-full flex items-center justify-center">
        <ButtonGeneratePdf
          filename={`${t("pdf-filename")}_${formattedFilename}`}
        />
      </div>
    </div>
  );
}
