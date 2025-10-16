import { notFound } from "next/navigation";
import { getFormatter } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getMultipleRecordsById } from "@/services/airtable";

import { getSession } from "@/utils/auth";
import { redirect } from "next/navigation";
import InfoRow from "@/component/speakerDossier/InfoRow";
import Link from "next/link";
import ButtonGeneratePdf from "@/component/speakerDossier/ButtonGeneratePdf";
import programDataMapping from "@/services/programMapping";
import Schedule from "@/component/speakerDossier/Schedule";
import { Languages, Phone } from "lucide-react";
import type { DeepPartialSpeaker } from "@/types/speaker";

interface Props {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function SpeakerPage({ params }: Props) {
  const { locale, id } = await params;
  const format = await getFormatter({ locale });

  const t = await getTranslations({ locale, namespace: "SpeakerBriefing" });

  const session = await getSession();

  if (!session.isAuthenticated) {
    redirect(`/sign-in?redirect=/speaker/${id}`);
  }

  // Direkt Airtable-Daten abfragen – ohne fetch
  const data: DeepPartialSpeaker = await getMultipleRecordsById(
    "Confirmed Contributions"!,
    id,
  );

  if (!data) {
    notFound();
  }
  const ProgramData = await programDataMapping(data);

  const date_start = data.Sessions?.[0]?.["Session Start Time"]
    ? new Date(data.Sessions[0]["Session Start Time"])
    : new Date();

  const formattedDateStart = format.dateTime(date_start, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const checkinDate = data["Hotel Check-In"]
    ? new Date(data["Hotel Check-In"])
    : undefined;
  const checkoutDate = data["Hotel Check-Out"]
    ? new Date(data["Hotel Check-Out"])
    : undefined;

  const speakerName = data.Person?.["Speaker Name"] ?? "";
  const formattedFilename = speakerName
    .trimStart()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div className="p-8 max-w-[800px] m-auto ">
      <h3 className="text-xl">
        {data.Event?.Plattformen?.["Conference Name"] || "Event"}
      </h3>
      <h1 className="text-4xl font-bold">
        {`${t("title")} ${data.Person?.["Speaker Name"] || "Kein Name"}`}
      </h1>

      <div className="bg-gray-100 rounded-2xl my-4 p-4">
        <h2 className="text-2xl font-bold border-b-1 pb-2 mb-4">
          {t("section-gig")}
        </h2>

        {data.Sessions && (
          <InfoRow
            label={t("label-art")}
            value={
              <>
                {data.Sessions[0]?.Sessionart && (
                  <>
                    <p>{data.Sessions[0].Sessionart}:</p>
                    <p>{data.Sessions[0].Sessiontitel}</p>
                    <p>{data.Sessions[0]["Session-Untertitel"]}</p>
                  </>
                )}
              </>
            }
          ></InfoRow>
        )}
        <InfoRow
          label={t("label-date")}
          value={
            <>
              <p>{formattedDateStart}</p>
            </>
          }
        ></InfoRow>
        {data.Event && (
          <InfoRow
            label={t("label-location")}
            value={
              <>
                <p className="font-bold">{data.Event?.Location?.Name}</p>
                <p className="">{`${data.Event.Location?.Strasse} ${data.Event.Location?.Hausnummer}`}</p>
                <p className="">{`${data.Event.Location?.PLZ} ${data.Event.Location?.Stadt}`}</p>
                <p className="">{data.Event?.Location?.Land}</p>
              </>
            }
          ></InfoRow>
        )}
        {data.Sessions?.length && data.Sessions.length > 0 && (
          <InfoRow
            label={t("label-room")}
            value={
              <>
                <p>{data.Sessions[0]?.Room}</p>
              </>
            }
          ></InfoRow>
        )}
        {data.Sessions?.length &&
          data.Sessions.length > 0 &&
          data.Sessions[0]?.Sessionsprache && (
            <InfoRow
              label={t("label-language")}
              value={
                <>
                  <p>{data.Sessions[0]?.Sessionsprache}</p>
                </>
              }
            ></InfoRow>
          )}
      </div>

      <div className="bg-gray-100 rounded-2xl my-4 p-4">
        <h2 className="text-2xl font-bold border-b-1 pb-2 mb-4">
          {t("section-on-site")}
        </h2>
        <InfoRow
          label={t("on-site-badge")}
          value={
            <>
              <p>{t("badge-information")}</p>
            </>
          }
        ></InfoRow>
        {data.Referentenbetreuer && (
          <InfoRow
            label={t("on-site-contact")}
            value={
              <>
                <div className="flex flex-col gap-1">
                  <h5 className="font-bold">{`${data.Referentenbetreuer["First Name"]} ${data.Referentenbetreuer["Last Name"]}`}</h5>
                  {data.Referentenbetreuer["Phone Number"] && (
                    <div className="border-gray-200 border-2 rounded-2xl py-1 px-2 flex gap-2 items-center">
                      <Phone size="20" />
                      {data.Referentenbetreuer["Phone Number"]}
                    </div>
                  )}
                  {data.Referentenbetreuer["Sprachen"] && (
                    <div className="border-gray-200 border-2 rounded-2xl py-1 px-2 flex gap-2 items-center">
                      <Languages size="20" />
                      {data.Referentenbetreuer["Sprachen"].map(
                        (sprache, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 rounded-2xl py-1 px-2"
                          >
                            {t(sprache!)}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </>
            }
            note={t("on-site-contact-text")}
          ></InfoRow>
        )}
      </div>

      <div className="bg-gray-100 rounded-2xl my-4 p-4">
        <h2 className="text-2xl font-bold border-b-1 pb-2 mb-4">
          {t("section-stay")}
        </h2>
        {data["Anmerkung zum Aufenthalt"] && (
          <p>{data["Anmerkung zum Aufenthalt"]}</p>
        )}
        {data.Hotel?.Name ? (
          <>
            <InfoRow
              label={t("label-hotel")}
              value={
                <>
                  <>
                    <p className="font-bold">{data.Hotel.Name}</p>
                    <p className="">{`${data.Hotel?.Strasse} ${data.Hotel?.Hausnummer}`}</p>
                    <p className="">{`${data.Hotel?.PLZ} ${data.Hotel?.Stadt}`}</p>
                    <p className="">{data.Hotel?.Land}</p>
                  </>
                </>
              }
            ></InfoRow>
            {checkinDate && (
              <InfoRow
                label={t("label-check-in")}
                value={
                  <>
                    <p>
                      {format.dateTime(checkinDate, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </>
                }
              ></InfoRow>
            )}
            {checkoutDate && (
              <InfoRow
                label={t("label-check-out")}
                value={
                  <>
                    <p>
                      {format.dateTime(checkoutDate, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </>
                }
              ></InfoRow>
            )}
          </>
        ) : (
          <p></p>
        )}
      </div>

      <div className=" break-before-page my-4">
        <div className="rounded-2xl  p-4 bg-gray-100">
          <h3 className="text-2xl font-bold border-b-1 pb-2 ">
            {t("section-schedule")}
          </h3>
        </div>
        <p className="p-4">{t("schedule-text")}</p>
        <div className="flex flex-col gap-4">
          {ProgramData && <Schedule ProgramData={ProgramData} />}
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl my-4 p-4 break-before-page">
        <h3 className="text-2xl font-bold border-b-1 pb-2 mb-4">
          {t("section-media")}
        </h3>
        <p>{t("media-text")}</p>
      </div>

      <div className="bg-gray-100 rounded-2xl my-4 p-4">
        <h3 className="text-2xl font-bold border-b-1 pb-2 mb-4">
          {t("section-about")}
        </h3>
        <p>{t("about-text")}</p>
      </div>

      <div className="bg-gray-100 rounded-2xl my-4 p-4">
        <h3 className="text-2xl font-bold border-b-1 pb-2 mb-4">
          {t("section-contact")}
        </h3>
        <div className="flex justify-between flex-wrap">
          <div className="w-[300px]">
            <p className="font-bold">
              {data.Event?.Plattformen?.["Conference Name"] || " "}
            </p>
            <p>c/o LINDEN 3L AG</p>
            <p>Weyermannsstrasse 36</p>
            <p>3008 Bern</p>
            <Link href={`mailto:hello@andermatt-dialog.ch`}>
              hello@andermatt-dialog.ch
            </Link>
          </div>
          <div className="w-[300px]">
            <p className="font-bold">{t("contact-person")}</p>
            <p>Project Manager Andermatt Dialog</p>
            <p>Alexandra Ertle </p>
            <p>Tel: +41 78 319 46 86</p>
            <Link href={`mailto:alexandra.ertle@andermatt-dialog.ch`}>
              alexandra.ertle@andermatt-dialog.ch
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center ">
        <ButtonGeneratePdf
          filename={`${t("pdf-filename")}_${formattedFilename}`}
        />
      </div>
    </div>
  );
}
