"use client";
import { useTranslations, useFormatter } from "next-intl";
import { PlaneLanding, PlaneTakeoff } from "lucide-react";

type FlightProps = {
  origin?: string;
  destination?: string;
  flightNr1?: string;
  via?: string | undefined;
  flightNr2?: string | undefined;
  departureDate?: string;
  arrivalDate?: string;
};

export default function TravelSlotFlight({
  origin,
  destination,
  flightNr1,
  via,
  flightNr2,
  departureDate,
  arrivalDate,
}: FlightProps) {
  const t = useTranslations("SpeakerBriefing");
  const format = useFormatter();
  const departure_Date = departureDate ? new Date(departureDate) : undefined;
  const arrival_Date = arrivalDate ? new Date(arrivalDate) : undefined;

  return (
    <>
      <div className="bg-white rounded-2xl p-2 w-full flex justify-between">
        <div className="flex gap-4">
          <PlaneTakeoff size="30" className=" self-center" />
          <div className="self-center">
            <p>{t("schedule-origin")}</p>
            <p className="text-2xl font-bold">{origin}</p>
          </div>
        </div>
        <div className="flex items-end flex-col">
          <p>
            {t("schedule-flightnr")}
            <span className="font-bold bg-gray-200 rounded-2xl p-2 ml-1">
              {flightNr1}
            </span>
          </p>
          {departure_Date && (
            <div className="flex items-end flex-col justify-center">
              <p className="text-2xl font-bold">
                {format.dateTime(departure_Date!, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                {format.dateTime(departure_Date!, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
      {via && (
        <div className="bg-gray-200 rounded-2xl border-gray-300 border-2 p-2 flex justify-between">
          <div className=" self-center">
            <p>
              via: <span className="font-bold">{via}</span>
            </p>
          </div>
          <div className="flex items-end flex-col">
            <p>
              {t("schedule-flightnr")}
              <span className="font-bold bg-white rounded-2xl p-2 ml-1">
                {flightNr2}
              </span>
            </p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl p-2 flex justify-between">
        <div className="flex gap-4">
          <PlaneLanding size="30" className=" self-center" />
          <div className=" self-center">
            <p>{t("schedule-destination")}</p>
            <p className="text-2xl font-bold">{destination}</p>
          </div>
        </div>
        {arrival_Date && (
          <div className="flex items-end flex-col justify-center">
            <p className="text-2xl font-bold">
              {format.dateTime(arrival_Date!, {
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
            <p>
              {format.dateTime(arrival_Date!, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
